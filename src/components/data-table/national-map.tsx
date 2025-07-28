import { useDataTable } from "@/hooks/use-data-table"
import { NationalRowData } from "@/types"
import { useQuery } from "@tanstack/react-query"
import { Table } from "@tanstack/react-table"
import { ColumnDef } from "@tanstack/react-table"
import { Maximize2, Minimize2, X } from "lucide-react"
import { useMemo, useState } from "react"
import { Suspense } from "react"
import { Link } from "react-router"

import { MapCanvas, MapLayer, MapProvider } from "@rio.js/react-maps"
import { Button } from "@rio.js/ui/components/button"
import { cn } from "@rio.js/ui/lib/utils"

import { CircleSVG } from "@/components/circle-svg"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { AestheticCard } from "@/components/ui/aesthetic-card"

interface NationalMapProps {
  data: NationalRowData[]
  table: Table<NationalRowData>
}

export function NationalMap({ data, table }: NationalMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedState, setSelectedState] = useState<NationalRowData | null>(
    null,
  )
  const [hoveredState, setHoveredState] = useState<{
    name: string
    abbreviation: string
    x: number
    y: number
  } | null>(null)

  // Fetch india-states.json directly from public
  const { data: geojson, isLoading } = useQuery({
    queryKey: ["india-states-geojson"],
    queryFn: async () => {
      const response = await fetch("/india-states.json")
      return response.json()
    },
    staleTime: 60 * 60 * 1000,
  })

  // Filter features to only those states present in the data
  const filteredGeoJson = useMemo(() => {
    if (!geojson?.features || !data?.length) return null
    const stateNames = data.map((row) => row.state.toLowerCase())
    return {
      ...geojson,
      features: geojson.features
        // .filter((f: any) =>
        //   stateNames.includes((f.properties.name as string)?.toLowerCase()),
        // )
        .map((feature: any) => {
          const stateName = feature.properties.name as string
          const stateData = data.find(
            (row) => row.state.toLowerCase() === stateName.toLowerCase(),
          )
          const color = stateData?.agreementSigningDate
            ? "#FF671F"
            : stateData
              ? "#E2E8F0"
              : "#046A38"
          return {
            ...feature,
            properties: {
              ...feature.properties,
              color,
              stateData: stateData || null,
            },
          }
        }),
    }
  }, [geojson, data])

  const toggleFullscreen = () => setIsFullscreen((f) => !f)

  // Adjusted view to fit all of India better
  const viewState = useMemo(
    () => ({
      longitude: 80.0888, // Center longitude of India (updated)
      latitude: 25.1466, // Center latitude of India (updated)
      zoom: 3.2, // Zoomed out to fit all of India (updated)
      pitch: 0,
      bearing: 0,
    }),
    [],
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-lg">Loading map...</div>
      </div>
    )
  }
  if (!filteredGeoJson || filteredGeoJson.features.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-lg">No state data available for map display</div>
      </div>
    )
  }
  const mapContainerClass = isFullscreen
    ? "fixed inset-0 z-50 bg-white"
    : "relative w-full h-[600px] rounded-lg border"
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
      <div className="absolute bottom-4 left-4 z-10">
        <div className="flex flex-col items-start gap-2 bg-white/90 backdrop-blur-sm rounded-md p-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FF671F] rounded-full border-2 border-black"></div>
            <div className="text-xs">Agreement Done</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#E2E8F0] rounded-full border-2 border-black"></div>
            <div className="text-xs">Under Consideration</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#046A38] rounded-full border-2 border-black"></div>
            <div className="text-xs">State Led</div>
          </div>
        </div>
      </div>
      {/* Card panel top right */}
      {selectedState && (
        <div className="fixed top-16 right-4 z-20 w-[350px] max-w-ful shadow-lg">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-0 right-10 z-30"
              onClick={() => setSelectedState(null)}
              aria-label="Close card"
            >
              <X className="h-5 w-5" />
            </Button>
            <AestheticCard row={selectedState} index={0} table={table} />
          </div>
        </div>
      )}
      <MapProvider
        initialViewState={viewState}
        initialStyle={{
          baseProvider: "mapbox",
          // baseStyle: "mapbox://styles/mapbox/light-v11",
          baseStyle: `${window.location.origin}/mapbox-styles.json`,
        }}
      >
        <MapCanvas />
        <MapLayer
          id="states-layer"
          type={MapLayer.GeoJsonLayer}
          data={filteredGeoJson}
          getFillColor={(feature: any) => {
            const color = feature.properties.color
            if (!color) return new Uint8Array([204, 204, 204, 180])
            const r = parseInt(color.slice(1, 3), 16)
            const g = parseInt(color.slice(3, 5), 16)
            const b = parseInt(color.slice(5, 7), 16)
            return new Uint8Array([r, g, b, 180])
          }}
          getLineColor={new Uint8Array([0, 0, 0, 255])}
          getLineWidth={2}
          lineWidthMinPixels={1}
          pickable
          autoHighlight
          highlightColor={[255, 255, 0]}
          onClick={(info: any) => {
            if (info?.object?.properties?.stateData) {
              setSelectedState(info.object.properties.stateData)
            }
          }}
          onHover={(info: any) => {
            if (info?.object?.properties?.stateData && info.x && info.y) {
              setHoveredState({
                name: info.object.properties.stateData.state,
                abbreviation: info.object.properties.stateData.abbreviation,
                x: info.x,
                y: info.y,
              })
            } else {
              setHoveredState(null)
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
  )
}
