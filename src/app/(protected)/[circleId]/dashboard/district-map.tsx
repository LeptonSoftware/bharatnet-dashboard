import { MapProvider, MapCanvas, MapLayer } from "@rio.js/react-maps";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { envelope } from "@turf/turf";
import { fitBounds } from "@math.gl/web-mercator";
import { Maximize2, Minimize2, X } from "lucide-react";
import React, { useState } from "react";

const entityTypes = {
  Cable: "OFC",
  Duct: "Span",
  Pole: "Pole",
  Manhole: "Manhole",
  Splitter: "Splitter",
  Loop: "Loop",
  Tree: "Route Indicator",
  ONT: "CPE",
  FMS: "FDP",
  POD: "GP",
  SpliceClosure: "FPOI",
  Trench: "Trench",
  BDB: "FDC",
};

const iconMapping = {
  marker: {
    x: 0,
    y: 0,
    width: 24,
    height: 24,
    anchorY: 0,
    mask: false,
  },
};

function useLayerStyles() {
  return useSuspenseQuery({
    queryKey: ["layer-styles"],
    queryFn: async () => {
      const response = await fetch("/api/layers");
      const data = await response.json();
      return data;
    },
  });
}

function useLayerData(
  districtId: string,
  circleId: string,
  entityType: string
) {
  return useSuspenseQuery({
    queryKey: ["layer-data", districtId, circleId, entityType],
    queryFn: async () => {
      const response = await fetch(
        `/api/layer/district?district=${districtId}&circle=${circleId}&entityType=${entityType}`
      );
      const data = await response.json();
      return data;
    },
  });
}

const colors = {
  P: [0, 0, 255, 255],
  D: [255, 255, 0, 255],
  A: [255, 0, 0, 255],
};

const hexToColorArray = (hex: string) => {
  const [r, g, b] = hex.match(/\w\w/g)!.map((c) => parseInt(c, 16));
  return [r, g, b, 255];
};

function MapLayers({
  district,
  circleId,
  onHoverDistrict,
  onHoverCable,
  onHoverIcon,
}: {
  district: any;
  circleId: string;
  onHoverDistrict?: (info: any) => void;
  onHoverCable?: (info: any) => void;
  onHoverIcon?: (info: any, entityType: string) => void;
}) {
  const { data: layerStyles } = useLayerStyles();
  return (
    <>
      {Object.keys(entityTypes).map((entityType, index) => {
        const style = layerStyles.find(
          (style: any) => style.layer_name === entityType
        );
        const isIconLayer =
          style &&
          style.LayerStyle &&
          style.LayerStyle[0] &&
          style.LayerStyle[0].line_width == null;
        return (
          <MapLayer
            order={index}
            id={`district-${district.id}-${entityType}`}
            type={MapLayer.GeoJsonLayer}
            data={`/api/layer/district?district=${district}&circle=${circleId}&entityType=${entityType}`}
            pointType={"icon"}
            getPointRadius={100}
            pickable
            iconAtlas={`/icons/${entityType}/A/${entityType}.png`}
            iconMapping={iconMapping}
            getIcon={() => "marker"}
            onHover={
              entityType === "POD"
                ? (info: any) => onHoverIcon && onHoverIcon(info, entityType)
                : entityType === "Cable"
                  ? onHoverCable
                  : isIconLayer && onHoverIcon
                    ? (info: any) => onHoverIcon(info, entityType)
                    : undefined
            }
            getLineColor={(f) =>
              entityType === "Cable"
                ? colors[f.properties.network_status]
                : hexToColorArray(layerStyles.LayerStyle[0].color_code_hex)
            }
            autoHighlight
            getIconSize={() => 24}
            getLineWidth={() => 20}
            lineWidthMinPixels={2}
          />
        );
      })}
    </>
  );
}

function Map({
  viewState,
  district,
  circleId,
  onHoverDistrict,
  onHoverCable,
  onHoverIcon,
}: {
  viewState: any;
  district: any;
  circleId: string;
  onHoverDistrict?: (info: any) => void;
  onHoverCable?: (info: any) => void;
  onHoverIcon?: (info: any, entityType: string) => void;
}) {
  return (
    <MapProvider initialViewState={viewState}>
      <MapCanvas></MapCanvas>
      <Suspense fallback={null}>
        <MapLayers
          district={district}
          circleId={circleId}
          onHoverDistrict={onHoverDistrict}
          onHoverCable={onHoverCable}
          onHoverIcon={onHoverIcon}
        />
      </Suspense>
    </MapProvider>
  );
}

function useDistrictInfo(district: string, circleId: string) {
  return useSuspenseQuery({
    queryKey: ["district-info", district, circleId],
    queryFn: async () => {
      const response = await fetch(
        `https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/districts`
      );
      const data = await response.json();
      const districtInfo = data.districts.find(
        (d: any) =>
          d.circle.toLowerCase() === circleId?.toLowerCase() &&
          d.provinceName.toLowerCase() === district.toLowerCase()
      );
      return districtInfo;
    },
  });
}

export function DistrictMap({
  district,
  circleId,
}: {
  district: any;
  circleId: string;
}) {
  const { data: districtInfo } = useDistrictInfo(district.name, circleId);
  const { data: layerData } = useLayerData(
    districtInfo.provinceId,
    circleId,
    "POD"
  );
  const { data: layerStyles } = useLayerStyles();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredCable, setHoveredCable] = useState<{
    cable_name: string;
    cable_type: string;
    cable_cores: string;
    network_id: string;
    ownership_type: string;
    display_name?: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<{
    name: string;
    code: string;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<{
    label: string;
    x: number;
    y: number;
  } | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const viewState = useMemo(() => {
    const bbox = envelope(layerData);
    const viewport = fitBounds({
      width: 500,
      height: 750,
      bounds: [
        [
          bbox.geometry.coordinates[0][0][0],
          bbox.geometry.coordinates[0][0][1],
        ],
        [
          bbox.geometry.coordinates[0][1][0],
          bbox.geometry.coordinates[0][1][1],
        ],
      ],
    });
    return viewport;
  }, []);

  // Legend logic: show only entities present in layerStyles (i.e., rendered on the map), but exclude Trench, Duct, Cable
  const legendItems = useMemo(() => {
    const exclude = ["Trench", "Duct", "Cable"];
    return (layerStyles as Array<{ layer_name: keyof typeof entityTypes }>)
      .filter(
        (layer) =>
          Object.prototype.hasOwnProperty.call(entityTypes, layer.layer_name) &&
          !exclude.includes(layer.layer_name)
      )
      .map((layer) => ({
        key: layer.layer_name,
        label: entityTypes[layer.layer_name],
        icon: `/icons/${layer.layer_name}/A/${layer.layer_name}.png`,
      }));
  }, [layerStyles]);

  // Cable (OFC) legend for network status colors
  const cableLegend = useMemo(() => {
    const cableLayer = (layerStyles as Array<{ layer_name: string }>).find(
      (layer) => layer.layer_name === "Cable"
    );
    if (!cableLayer) return [];
    // Use the colors object for swatches and labels
    const statusLabels: Record<string, string> = {
      P: "Planned",
      D: "Deployed",
      A: "Active",
    };
    return Object.entries(colors).map(([status, colorArr]) => ({
      status,
      label: statusLabels[status] || status,
      color: `rgba(${colorArr.join(",")})`,
    }));
  }, [layerStyles]);

  const map = (
    <div ref={mapRef} className="relative w-full h-full">
      {/* Fullscreen button, styled like map controls */}
      <button
        className="absolute top-3.5 right-5 rounded-[2px] border-[2px] border-[#ccc] z-50 bg-white shadow p-2 hover:bg-gray-100 focus:outline-none"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
        onClick={() => setIsFullscreen((f) => !f)}
        aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </button>
      {/* Legend: bottom right */}
      <>
        {!showLegend && (
          <button
            className="fixed bottom-6 right-6 z-50 bg-white/90 rounded-full shadow-lg border border-gray-200 p-2 flex items-center justify-center hover:bg-gray-100"
            onClick={() => setShowLegend(true)}
            aria-label="Show legend"
          >
            <svg
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="4" y="7" width="16" height="10" rx="2" strokeWidth="2" />
              <path
                d="M8 11h.01M12 11h.01M16 11h.01"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        {(legendItems.length > 0 || cableLegend.length > 0) && showLegend && (
          <div className="fixed bottom-6 right-6 z-50 bg-white/90 rounded-lg shadow-lg border border-gray-200 px-4 py-3 flex flex-col gap-2 min-w-[180px] max-w-xs">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded-full"
              onClick={() => setShowLegend(false)}
              aria-label="Close legend"
            >
              <X className="h-4 w-4" />
            </button>
            {cableLegend.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-xs mb-1 text-gray-700">
                  OFC (Cable) Status
                </div>
                {cableLegend.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="inline-block w-5 h-3 rounded-sm border border-gray-300"
                      style={{ background: item.color }}
                    />
                    <span className="truncate text-gray-800">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
            {legendItems.length > 0 && (
              <div className="font-semibold text-sm mb-1 text-gray-700">
                Legend
              </div>
            )}
            {legendItems.map((item) => (
              <div key={item.key} className="flex items-center gap-2 text-sm">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-5 h-5 object-contain"
                  style={{ background: "#f3f4f6", borderRadius: 4 }}
                />
                <span className="truncate text-gray-800">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </>
      {/* Tooltip for hovered icon */}
      {hoveredIcon && mapRef.current && (
        <div
          className="pointer-events-none absolute z-50 px-3 py-2 rounded-md bg-white border border-gray-300 shadow text-xs text-gray-900 min-w-[120px]"
          style={{
            left: hoveredIcon.x,
            top: hoveredIcon.y,
            maxWidth: 220,
          }}
        >
          <div className="font-semibold">{hoveredIcon.label}</div>
        </div>
      )}
      {/* Tooltip for hovered cable */}
      {hoveredCable && mapRef.current && (
        <div
          className="pointer-events-none absolute z-50 px-3 py-2 rounded-md bg-white border border-gray-300 shadow text-xs text-gray-900 min-w-[200px]"
          style={{
            left: hoveredCable.x,
            top: hoveredCable.y,
            maxWidth: 320,
          }}
        >
          <div className="font-semibold mb-1">Cable Details</div>
          <div className="flex flex-col gap-1">
            {Object.entries(hoveredCable)
              .filter(
                ([key, value]) =>
                  ["x", "y"].indexOf(key) === -1 &&
                  value &&
                  typeof value === "string"
              )
              .map(([key, value]) => (
                <div key={key} className="flex justify-between gap-2">
                  <span className="text-gray-500 capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-gray-900 font-medium">{value}</span>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Tooltip for hovered district */}
      {hoveredDistrict && (
        <div
          className="pointer-events-none fixed z-50 px-3 py-2 rounded-md bg-white border border-gray-300 shadow text-xs text-gray-900"
          style={{ left: hoveredDistrict.x + 16, top: hoveredDistrict.y + 16 }}
        >
          <div className="font-semibold">{hoveredDistrict.name}</div>
          <div className="text-gray-500">{hoveredDistrict.code}</div>
        </div>
      )}
      <Suspense fallback={null}>
        <Map
          viewState={viewState}
          district={districtInfo.provinceId}
          circleId={circleId}
          onHoverDistrict={(info: any) => {
            if (info?.object?.properties && info.x && info.y) {
              setHoveredDistrict({
                name: info.object.properties.name || "",
                code: info.object.properties.code || "",
                x: info.x,
                y: info.y,
              });
            } else {
              setHoveredDistrict(null);
            }
          }}
          onHoverCable={(info: any) => {
            if (info?.object?.properties && info.x && info.y) {
              setHoveredCable({
                cable_name: info.object.properties.cable_name || "",
                cable_type: info.object.properties.cable_type || "",
                cable_cores: info.object.properties.cable_cores || "",
                network_id: info.object.properties.network_id || "",
                ownership_type: info.object.properties.ownership_type || "",
                display_name: info.object.properties.display_name || undefined,
                x: info.x,
                y: info.y,
              });
            } else {
              setHoveredCable(null);
            }
          }}
          onHoverIcon={(info: any, entityType: string) => {
            if (info?.object?.properties && info.x && info.y) {
              const label = info.object.properties.display_name
                ? String(info.object.properties.display_name).trim()
                : "NA";
              setHoveredIcon({
                label,
                x: info.x,
                y: info.y,
              });
            } else {
              setHoveredIcon(null);
            }
          }}
        />
      </Suspense>
    </div>
  );

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 bg-white">{map}</div>;
  }

  return map;
}
