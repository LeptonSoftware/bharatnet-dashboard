import { useQuery } from "@tanstack/react-query";

export interface EventLogData {
  sNo: number;
  timestamp: string;
  event: string;
  data: number;
  circle: string;
  id: number;
}

export interface EventsResponse {
  events: EventLogData[];
}

async function fetchEvents(): Promise<EventLogData[]> {
  const url =
    "https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/events";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`);
  }

  const data: EventsResponse = await response.json();
  return data.events;
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
