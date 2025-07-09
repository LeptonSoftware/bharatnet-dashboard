import { useQuery } from "@tanstack/react-query";
import { fetchUserCircleRoles } from "@/lib/api";

export function useCircleRoles() {
  return useQuery({
    queryKey: ["circle-roles"],
    queryFn: fetchUserCircleRoles,
  });
}
