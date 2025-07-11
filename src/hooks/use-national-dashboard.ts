import { fetchNationalData, fetchUserCircleRoles } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useNationalDashboard() {
  const {
    data: nationalData,
    isLoading: nationalLoading,
    error: nationalError,
  } = useQuery({
    queryKey: ["national-dashboard"],
    queryFn: () => fetchNationalData(),
  });

  const {
    data: circleRoles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["user-circle-roles"],
    queryFn: () => fetchUserCircleRoles(),
  });

  const isLoading = nationalLoading || rolesLoading;
  const error = nationalError || rolesError;

  // Filter national data based on circle roles
  const filteredData =
    nationalData && circleRoles
      ? (() => {
          if (circleRoles && circleRoles.circles.length > 0) {
            const allowedCircles = circleRoles.circles.map((c: string) =>
              c.toLowerCase()
            );
            return nationalData.filter((row) =>
              allowedCircles.includes(row.abbreviation.toLowerCase())
            );
          }
          return nationalData;
        })()
      : [];

  return {
    data: filteredData,
    circleRoles,
    isLoading,
    error,
  };
}
