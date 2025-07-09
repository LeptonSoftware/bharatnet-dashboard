import { fetchNationalData } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useNationalDashboard() {
  const { data: nationalData } = useSuspenseQuery({
    queryKey: ["national-dashboard"],
    queryFn: () => fetchNationalData(),
  });

  return nationalData;
}
