import { fetchUserCircleRoles } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export function useCircleRoles() {
  return useQuery({
    queryKey: ["circle-roles"],
    queryFn: fetchUserCircleRoles,
  })
}
