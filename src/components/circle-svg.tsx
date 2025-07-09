import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { GeoJSON2SVG } from "geojson2svg";
import { useMemo } from "react";
import { cn } from "@rio.js/ui/lib/utils";
const converter = new GeoJSON2SVG({});

export function CircleSVG({ circleId = "punjab", className = "" }) {
  const { data: geojson } = useSuspenseQuery({
    queryKey: ["circles", "geojson"],
    queryFn: async () => {
      const response = await fetch(`india-states.json`);
      const data = await response.json();
      return data;
    },
  });

  const features = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: geojson?.features.filter(
        (feature) =>
          feature.properties.name.toLowerCase() === circleId.toLowerCase()
      ),
    };
  }, [geojson, circleId]);

  const svgString = useMemo(() => {
    console.log(features);
    if (!features.features.length) return "";
    return converter.convert(features, {
      attributes: {
        fill: "black",
        stroke: "black",
        strokeWidth: "1",
      },
    });
  }, [features]);

  console.log(svgString);

  return (
    <svg
      width={32}
      height={32}
      className={cn("mx-auto", className)}
      viewBox="0 0 256 256"
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
}
