import { fetchAttendanceData } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAttendanceData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  })
}

const mapping = {
  punjab: "Punjab",
  upe: "UP East",
  upw: "UP West",
  himachalpradesh: "Himachal Pradesh",
  westbengal: "West Bengal, A&N",
  bihar: "Bihar",
  madhyapradesh: "Madhya Pradesh, DNH & DD",
  uttarakhand: "Uttarakhand",
  jk: "J&K,Ladakh",
  kerala: "Kerala",
  karanataka: "Karnataka, Goa,Puducherry",
  ner2: "NER-2",
  rajasthan: "Rajasthan",
  haryana: "Haryana",
  ner1: "NER-1",
  assam: "Assam",
  odisha: "Odisha",
  sikkim: "Sikkim",
}

export function useCircleAttendance(circleId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["attendance", "circle"],
    queryFn: async () => {
      const response = await fetch(
        "https://glitscrm.digitalrupay.com/apirt1/crm/attendance/package/stats",
      )
      const data = await response.json()
      return Object.values(data.data)
    },
  })

  if (isLoading) return { data: null, isLoading, error }
  if (error) return { data: null, isLoading, error }

  console.log(data)

  const circleData = data.find(
    (item: any) => item.states === mapping[circleId.toLowerCase()],
  )
  return { data: circleData, isLoading, error }
}
