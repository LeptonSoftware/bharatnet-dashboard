import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { GeoJSON2SVG } from "geojson2svg";
import { useMemo } from "react";
import { cn } from "@rio.js/ui/lib/utils";
const converter = new GeoJSON2SVG({});
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

export function CircleSVG({ circleId = "punjab", className = "", size = 32 }) {
  const { data: geojson } = useSuspenseQuery({
    queryKey: ["circles", "geojson"],
    queryFn: async () => {
      const response = await fetch(`/india-states.json`);
      const data = await response.json();
      return data;
    },
  });
  const { data: nationalData } = useSuspenseQuery({
    queryKey: ["circles", "national"],
    queryFn: async () => {
      const response = await fetch(
        `https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/dashboard`
      );
      const data = await response.json();
      return data.dashboard;
    },
  });

  const features = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: geojson?.features.filter(
        (feature) =>
          feature.properties.name.toLowerCase() === circleId.toLowerCase() ||
          Boolean(
            nationalData.find(
              (d) =>
                d.state.toLowerCase() ===
                  feature.properties.name.toLowerCase() &&
                d.abbreviation.toLowerCase() === circleId.toLowerCase()
            )
          )
      ),
    };
  }, [geojson, circleId, nationalData]);

  const svgString = useMemo(() => {
    console.log(features);
    if (!features.features.length) return "";

    const color = colors[Math.abs(hash(circleId)) % colors.length].hex;
    return converter.convert(features, {
      attributes: {
        fill: color,
        stroke: "black",
        strokeWidth: "1",
      },
    });
  }, [features, circleId]);

  console.log(svgString);

  return (
    <svg
      width={size}
      height={size}
      className={cn("mx-auto", className)}
      viewBox="0 0 256 256"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
