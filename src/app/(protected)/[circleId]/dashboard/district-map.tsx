import { MapProvider, MapCanvas, MapLayer } from "@rio.js/react-maps";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { envelope } from "@turf/turf";
import { fitBounds } from "@math.gl/web-mercator";

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

function useLayerData(districtId: string, entityType: string) {
  return useSuspenseQuery({
    queryKey: ["layer-data", districtId, entityType],
    queryFn: async () => {
      const response = await fetch(
        `/api/layer/district?districtId=945&entityType=${entityType}`
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

function MapLayers({ district }: { district: any }) {
  const { data: layerStyles } = useLayerStyles();
  return (
    <>
      {Object.keys(entityTypes).map((entityType, index) => {
        const style = layerStyles.find(
          (style: any) => style.layer_name === entityType
        );

        console.log(style);
        return (
          <MapLayer
            order={index}
            id={`district-${district.id}-${entityType}`}
            type={MapLayer.GeoJsonLayer}
            data={`/api/layer/district?districtId=945&entityType=${entityType}`}
            pointType={"icon"}
            getPointRadius={100}
            pickable
            iconAtlas={`/icons/${entityType}/A/${entityType}.png`}
            iconMapping={iconMapping}
            getIcon={() => "marker"}
            onHover={(e) => {
              console.log(e);
            }}
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

function Map({ viewState, district }: { viewState: any; district: any }) {
  return (
    <MapProvider initialViewState={viewState}>
      <MapCanvas></MapCanvas>
      <Suspense fallback={null}>
        <MapLayers district={district} />
      </Suspense>
    </MapProvider>
  );
}

export function DistrictMap({
  district,
  circle,
}: {
  district: any;
  circle: string;
}) {
  console.log(district);
  const { data: layerData } = useLayerData(district.id, "POD");

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
  return (
    <div className="h-full w-full">
      <Suspense fallback={null}>
        <Map viewState={viewState} district={district} />
      </Suspense>
    </div>
  );
}
