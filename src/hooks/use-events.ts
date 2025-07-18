import { useQuery } from "@tanstack/react-query"

export interface EventLogData {
  sNo: number
  timestamp: string
  event: string
  data: number
  circle: string
  id: number
  date: Date
}

export interface EventsResponse {
  events: EventLogData[]
}

async function fetchEvents(): Promise<EventLogData[]> {
  const url =
    "https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/events"

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`)
  }

  const data: EventsResponse = await response.json()
  return data.events.map((event) => ({
    ...event,
    timestamp: event.timestamp,
    date: (() => {
      const raw = event.timestamp // dd.MM.yy  →  4 July 2025
      const [d, m, yy] = raw.split(".").map(Number)

      const fullYear = yy + (yy >= 50 ? 1900 : 2000)

      const date = new Date(fullYear, m - 1, d)
      return date
    })(),
  }))
}

async function deleteEvent(eventId: number): Promise<void> {
  const url = `https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/events/${eventId}`

  const response = await fetch(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`Failed to delete event: ${response.statusText}`)
  }
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useCircleEvents(circleName: string) {
  const { data: allEvents, ...rest } = useEvents()

  const circleEvents =
    allEvents
      ?.filter(
        (event) => event.circle.toLowerCase() === circleName.toLowerCase(),
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime()) || []

  return {
    data: circleEvents,
    ...rest,
  }
}

export { deleteEvent }
