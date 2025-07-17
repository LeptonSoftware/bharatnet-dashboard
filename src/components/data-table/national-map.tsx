import { MapProvider, MapCanvas, MapLayer } from "@rio.js/react-maps";
import { useQuery } from "@tanstack/react-query";
import { NationalRowData } from "@/types";
import { useMemo, useState } from "react";
import { Button } from "@rio.js/ui/components/button";
import { Maximize2, Minimize2, X } from "lucide-react";
import { AestheticCard } from "@/components/ui/aesthetic-card";
import { Table } from "@tanstack/react-table";
import { useDataTable } from "@/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CircleSVG } from "@/components/circle-svg";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { cn } from "@rio.js/ui/lib/utils";
import { Link } from "react-router";
import { Suspense } from "react";

// Copy the columns definition from dashboard-table.tsx
const columns: ColumnDef<NationalRowData>[] = [
  {
    id: "icon",
    header: "",
    cell: ({ row }) => (
      <div className="w-12 flex justify-center">
        <Suspense>
          <CircleSVG circleId={row.original.state} />
        </Suspense>
      </div>
    ),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State/UT" />
    ),
    cell: ({ row }) => {
      if (
        row.original.abbreviation &&
        typeof row.original.abbreviation === "string"
      ) {
        return (
          <Link
            className="font-medium text-blue-500 hover:underline text-wrap min-w-[200px]"
            to={`/${row.original.abbreviation}`}
          >
            {row.getValue("state")}
          </Link>
        );
      }
      return (
        <div className="font-medium text-wrap min-w-[200px]">
          {row.getValue("state")}
        </div>
      );
    },
  },
  {
    accessorKey: "pia",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PIA" className="mx-auto" />
    ),
    cell: ({ row }) => {
      const pia = row.original.pia;
      const isNotPia =
        pia &&
        typeof pia === "string" &&
        (pia.toLowerCase().includes("tender") ||
          pia.toLowerCase().includes("bids"));
      return (
        <div
          className={cn(
            "font-medium text-center",
            isNotPia && "text-destructive"
          )}
        >
          {pia}
        </div>
      );
    },
  },
  {
    accessorKey: "agreementSigningDate",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Agreement Signing Date"
        className="mx-auto"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("agreementSigningDate") || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "gPsTotal",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total GPs"
        className="mx-auto"
      />
    ),
    cell: ({ row }) => {
      const total = row.original.gPsTotal;
      const newGPs = row.original.gPsNew;
      const existing = row.original.gPsExisting;
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="font-medium tabular-nums">
            {total?.toLocaleString?.() ?? "0"}
          </div>
          <div className="text-xs">
            <span className="text-blue-600">
              {existing?.toLocaleString?.() ?? "0"} existing
            </span>
            <span className="text-muted-foreground">, </span>
            <span className="text-emerald-600">
              {newGPs?.toLocaleString?.() ?? "0"} new
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "ofcTotalKMs",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="OFC (KMs)"
        className="mx-auto"
      />
    ),
    cell: ({ row }) => {
      const total = row.original.ofcTotalKMs;
      const existing = row.original.ofcExistingKMs;
      const newKms = row.original.ofcNewKms;
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="font-medium tabular-nums">
            {total?.toLocaleString?.() ?? "0"}
          </div>
          <div className="text-xs">
            <span className="text-blue-600">
              {existing?.toLocaleString?.() ?? "0"} existing
            </span>
            <span className="text-muted-foreground">, </span>
            <span className="text-emerald-600">
              {newKms?.toLocaleString?.() ?? "0"} new
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "financialProgress",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Financial Progress"
        className="mx-auto"
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue("financialProgress");
      if (!value) return <div className="text-center">N/A</div>;
      const parts = String(value).split("\n");
      const amount = parts[0] || "N/A";
      const date = parts[1] || "";
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="font-medium">₹ {amount}</div>
          {date && <div className="text-xs text-muted-foreground">{date}</div>}
        </div>
      );
    },
  },
  {
    accessorKey: "snocStatus",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SNOC Status"
        className="mx-auto"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center text-wrap min-w-[200px]">
        {row.getValue("snocStatus") || "N/A"}
      </div>
    ),
  },
];

interface NationalMapProps {
  data: NationalRowData[];
}

const colors = [
  { name: "Flame Red", hex: "#FF3B30" },
  { name: "Neon Orange", hex: "#FF9500" },
  { name: "Bright Yellow", hex: "#FFD600" },
  { name: "Lime Green", hex: "#A4F600" },
  { name: "Spring Green", hex: "#00E676" },
  { name: "Minty Teal", hex: "#1DE9B6" },
  { name: "Electric Cyan", hex: "#00E5FF" },
  { name: "Sky Blue", hex: "#00B0FF" },
  { name: "Azure", hex: "#2979FF" },
  { name: "Royal Blue", hex: "#304FFE" },
  { name: "Vivid Indigo", hex: "#651FFF" },
  { name: "Electric Violet", hex: "#AA00FF" },
  { name: "Hot Pink", hex: "#FF2D95" },
  { name: "Shocking Pink", hex: "#FF5ACD" },
  { name: "Coral Pop", hex: "#FF6D6D" },
];

function hash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export function NationalMap({ data }: NationalMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedState, setSelectedState] = useState<NationalRowData | null>(
    null
  );
  const [hoveredState, setHoveredState] = useState<{
    name: string;
    abbreviation: string;
    x: number;
    y: number;
  } | null>(null);

  // Fetch india-states.json directly from public
  const { data: geojson, isLoading } = useQuery({
    queryKey: ["india-states-geojson"],
    queryFn: async () => {
      const response = await fetch("/india-states.json");
      return response.json();
    },
    staleTime: 60 * 60 * 1000,
  });

  // Filter features to only those states present in the data
  const filteredGeoJson = useMemo(() => {
    if (!geojson?.features || !data?.length) return null;
    const stateNames = data.map((row) => row.state.toLowerCase());
    return {
      ...geojson,
      features: geojson.features
        .filter((f: any) =>
          stateNames.includes((f.properties.name as string)?.toLowerCase())
        )
        .map((feature: any) => {
          const stateName = feature.properties.name as string;
          const stateData = data.find(
            (row) => row.state.toLowerCase() === stateName.toLowerCase()
          );
          const color = stateData
            ? colors[Math.abs(hash(stateData.state)) % colors.length].hex
            : "#cccccc";
          return {
            ...feature,
            properties: {
              ...feature.properties,
              color,
              stateData: stateData || null,
            },
          };
        }),
    };
  }, [geojson, data]);

  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  // Adjusted view to fit all of India better
  const viewState = useMemo(
    () => ({
      longitude: 80.0888, // Center longitude of India (updated)
      latitude: 25.1466, // Center latitude of India (updated)
      zoom: 3.2, // Zoomed out to fit all of India (updated)
      pitch: 0,
      bearing: 0,
    }),
    []
  );

  // Always call the hook at the top level, never conditionally
  const selectedTable = useDataTable({
    data: selectedState ? [selectedState] : [],
    columns,
    pageCount: 1,
    initialState: { pagination: { pageIndex: 0, pageSize: 1 } },
    getRowId: (row) => row.id.toString(),
  }).table;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-lg">Loading map...</div>
      </div>
    );
  }
  if (!filteredGeoJson || filteredGeoJson.features.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-lg">No state data available for map display</div>
      </div>
    );
  }
  const mapContainerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white"
    : "relative w-full h-[600px] rounded-lg border";
  return (
    <div className={mapContainerClass}>
      {/* Fullscreen button top left */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4 mr-2" />
              Exit Fullscreen
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </>
          )}
        </Button>
      </div>
      {/* Card panel top right */}
      {selectedState && (
        <div className="absolute top-4 right-4 z-20 w-[350px] max-w-full">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-30"
              onClick={() => setSelectedState(null)}
              aria-label="Close card"
            >
              <X className="h-5 w-5" />
            </Button>
            <AestheticCard
              row={selectedState}
              index={0}
              table={selectedTable}
            />
          </div>
        </div>
      )}
      <MapProvider initialViewState={viewState}>
        <MapCanvas />
        <MapLayer
          id="states-layer"
          type={MapLayer.GeoJsonLayer}
          data={filteredGeoJson}
          getFillColor={(feature: any) => {
            const color = feature.properties.color;
            if (!color) return new Uint8Array([204, 204, 204, 180]);
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return new Uint8Array([r, g, b, 180]);
          }}
          getLineColor={new Uint8Array([255, 255, 255, 255])}
          getLineWidth={2}
          lineWidthMinPixels={1}
          pickable
          autoHighlight
          highlightColor={[255, 255, 0]}
          onClick={(info: any) => {
            if (info?.object?.properties?.stateData) {
              setSelectedState(info.object.properties.stateData);
            }
          }}
          onHover={(info: any) => {
            if (info?.object?.properties?.stateData && info.x && info.y) {
              setHoveredState({
                name: info.object.properties.stateData.state,
                abbreviation: info.object.properties.stateData.abbreviation,
                x: info.x,
                y: info.y,
              });
            } else {
              setHoveredState(null);
            }
          }}
        />
      </MapProvider>
      {/* Tooltip for hovered state */}
      {hoveredState && (
        <div
          className="pointer-events-none absolute z-50 px-3 py-2 rounded-md bg-white border border-gray-300 shadow text-xs text-gray-900"
          style={{ left: hoveredState.x + 16, top: hoveredState.y + 16 }}
        >
          <div className="font-semibold">{hoveredState.name}</div>
          <div className="text-gray-500">{hoveredState.abbreviation}</div>
        </div>
      )}
    </div>
  );
}
