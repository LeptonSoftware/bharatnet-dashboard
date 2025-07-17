import React, { useEffect } from "react";
import { MapPin, Maximize2, Minimize2 } from "lucide-react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { BlockData } from "@/types";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";

interface BlockMapProps {
  blocks: BlockData[];
}

function MapController({
  blocks,
  geojson,
}: {
  blocks: BlockData[];
  geojson: any;
}) {
  const map = useMap();

  useEffect(() => {
    if (geojson && blocks.length) {
      const features = blocks
        .map((block) =>
          geojson.features.find(
            (f: any) => parseInt(f.properties.Code) === block.blockCode
          )
        )
        .filter(Boolean);

      if (features.length) {
        // @ts-ignore
        const bounds = L.geoJSON({
          type: "FeatureCollection",
          features,
        }).getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, blocks, geojson]);

  return null;
}

async function fetchGeoJson(circle: string) {
  const response = await fetch(
    `https://cdn.leptonmaps.com/bharatnet/${circle}.geojson`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch GeoJSON data");
  }
  return response.json();
}

export function BlockMap({ blocks }: BlockMapProps) {
  const { circle = "upe" } = useParams();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const {
    data: geojson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["geojson", circle],
    queryFn: () => fetchGeoJson(circle),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5 animate-bounce" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="flex items-center gap-2 text-destructive">
          <MapPin className="h-5 w-5" />
          <span>Error loading map data</span>
        </div>
      </div>
    );
  }

  const blockFeatures = blocks
    .map((block) =>
      geojson.features.find(
        (f: any) => parseInt(f.properties.Code) === block.blockCode
      )
    )
    .filter(Boolean);

  if (!blockFeatures.length) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span>Block geometries not found</span>
        </div>
      </div>
    );
  }
  const map = (
    <div className="relative w-full h-full">
      {/* Fullscreen button, styled like map controls */}
      <button
        className="absolute top-3.5 Hola right-5 rounded-[2px] border-[2px] border-[#ccc] z-2000 bg-white shadow p-2 hover:bg-gray-100 focus:outline-none"
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
      <MapContainer
        style={{ height: isFullscreen ? "100vh" : "500px", width: "100%" }}
        center={[0, 0]}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {blockFeatures.map((feature, index) => (
          <GeoJSON
            key={feature.properties.Code}
            data={feature}
            style={{
              fillColor:
                blocks.length > 1
                  ? `hsl(${(index * 137) % 360}, 70%, 50%)`
                  : "#3B82F6",
              weight: 2,
              opacity: 1,
              color:
                blocks.length > 1
                  ? `hsl(${(index * 137) % 360}, 70%, 40%)`
                  : "#2563EB",
              fillOpacity: 0.3,
            }}
          />
        ))}
        <MapController blocks={blocks} geojson={geojson} />
      </MapContainer>
    </div>
  );

  if (isFullscreen) {
    return <div className="fixed inset-0 z-50 bg-white">{map}</div>;
  }

  return map;
}
