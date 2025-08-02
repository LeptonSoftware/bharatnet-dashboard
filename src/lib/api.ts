import { ApiResponse, NationalRowData } from "@/types"

import { createClient } from "./supabase/client"

// Types for circle roles
interface CircleRole {
  id: number
  user_id: string
  circles: string[]
  role: string
  created_at: string
}

// Types for attendance data
export interface AttendanceData {
  total_users: number
  total_present: number
  total_absent: number
  total_punch_out: number
  total_on_time: number
  total_late_time: number
}

export interface AttendanceResponse {
  status: number
  data: AttendanceData[]
  errors: string[]
}

const BASE_API_URL =
  "https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatNetPhase3ProjectReport"
const NATIONAL_API_URL =
  "https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/dashboard"

function parseNumberFromCell(cellValue: string | number): number {
  if (typeof cellValue === "number") return cellValue
  if (!cellValue) return 0

  // Handle cells like " 673\n12,664 " or "  6,226 "
  const cleanValue = cellValue.toString().replace(/\s+/g, " ").trim()

  // If contains newline, take the larger number
  if (cleanValue.includes("\n")) {
    const numbers = cleanValue.split("\n").map((n) => {
      const cleaned = n.replace(/,/g, "").trim()
      return parseFloat(cleaned) || 0
    })
    return Math.max(...numbers)
  }

  // Remove commas and parse
  const cleaned = cleanValue.replace(/,/g, "").replace(/[^\d.-]/g, "")
  return parseFloat(cleaned) || 0
}

function parseMultipleNumbersFromCell(cellValue: string | number): {
  primary: number
  secondary?: number
} {
  if (typeof cellValue === "number") return { primary: cellValue }
  if (!cellValue) return { primary: 0 }

  const cleanValue = cellValue.toString().trim()

  if (cleanValue.includes("\n")) {
    const parts = cleanValue.split("\n")
    const numbers = parts.map((part) => {
      const cleaned = part
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "")
        .trim()
      return parseFloat(cleaned) || 0
    })
    return { primary: numbers[0] || 0, secondary: numbers[1] || 0 }
  }

  const cleaned = cleanValue.replace(/,/g, "").replace(/[^\d.-]/g, "")
  return { primary: parseFloat(cleaned) || 0 }
}

function parseTargetCell(cellValue: string | number): {
  target: number
  date?: string
} {
  if (typeof cellValue === "number") return { target: cellValue }
  if (!cellValue) return { target: 0 }

  const cleanValue = cellValue.toString().trim()

  if (cleanValue.includes("\n")) {
    const parts = cleanValue.split("\n")
    const targetStr = parts[0]
      ?.replace(/,/g, "")
      .replace(/[^\d.-]/g, "")
      .trim()
    const target = parseFloat(targetStr) || 0
    const date = parts[1]?.trim()
    return { target, date }
  }

  const cleaned = cleanValue.replace(/,/g, "").replace(/[^\d.-]/g, "")
  return { target: parseFloat(cleaned) || 0 }
}

function parsePercentage(cellValue: string | number): number {
  if (typeof cellValue === "number") return cellValue
  if (!cellValue) return 0

  const cleanValue = cellValue.toString().replace(/[^\d.-]/g, "")
  return parseFloat(cleanValue) || 0
}

export async function fetchNationalData(): Promise<NationalRowData[]> {
  try {
    const response = await fetch(NATIONAL_API_URL)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // The new API returns data in a 'dashboard' property
    return data.dashboard || []
  } catch (error) {
    console.error("Error fetching national data:", error)
    throw error
  }
}

export async function fetchAttendanceData(): Promise<AttendanceData> {
  try {
    const response = await fetch(
      "https://abp-pmtool.bsnl.co.in/apirt1/cnoc/attendance/overallstats",
    )

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: AttendanceResponse = await response.json()

    // Return the first (and should be only) item in the data array
    if (data.data && data.data.length > 0) {
      return data.data[0]
    }

    // Return default values if no data
    return {
      total_users: 0,
      total_present: 0,
      total_absent: 0,
      total_punch_out: 0,
      total_on_time: 0,
      total_late_time: 0,
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error)
    throw error
  }
}

export async function fetchrelevantCircleData(
  circle: string,
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_API_URL}/${circle}`)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching relevant circle data:", error)
    throw error
  }
}

export async function fetchUserCircleRoles(): Promise<CircleRole | null> {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError
    console.log(user)
    if (!user) return null

    // Fetch circle roles for the user
    const { data: circleRoles, error: rolesError } = await supabase
      .from("circle_roles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (rolesError) {
      return {
        id: 0,
        user_id: user.id,
        circles: [],
        role: "",
        created_at: new Date().toISOString(),
      }
    }
    return circleRoles
  } catch (error) {
    console.error("Error fetching user circle roles:", error)
    throw error
  }
}

export async function fetchData(
  circle: string,
  activity: "dtp" | "survey",
): Promise<ApiResponse> {
  try {
    const endpoint = activity === "dtp" ? `${circle}Dtp` : `${circle}Survey`
    const response = await fetch(`${BASE_API_URL}/${endpoint}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return {
      [endpoint]: data[endpoint] || [],
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}
