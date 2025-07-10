import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { GeoJSON2SVG } from "geojson2svg";
import { useMemo } from "react";
import { cn } from "@rio.js/ui/lib/utils";
const converter = new GeoJSON2SVG({});
const colors = [
  { name: "Rich Black", hex: "#0B0C10" },
  { name: "Ebony", hex: "#1C1F26" },
  { name: "Charcoal Teal", hex: "#264653" },
  { name: "Gunmetal", hex: "#2A3439" },
  { name: "Midnight Green", hex: "#004643" },
  { name: "Deep Teal", hex: "#005F73" },
  { name: "Prussian Blue", hex: "#003049" },
  { name: "Midnight Blue", hex: "#191970" },
  { name: "Oxford Blue", hex: "#002147" },
  { name: "Indigo Dye", hex: "#00416A" },
  { name: "Dark Burgundy", hex: "#45001B" },
  { name: "Maroon", hex: "#5B0001" },
  { name: "Espresso", hex: "#3E2723" },
  { name: "Slate Gray", hex: "#2E3A44" },
  { name: "Jet", hex: "#343434" },
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
