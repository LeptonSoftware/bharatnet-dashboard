"use no memo"

import { useAttendance } from "@/hooks/use-attendance"
import { useEvents } from "@/hooks/use-events"
import { useNationalDashboard } from "@/hooks/use-national-dashboard"
import { fetchNationalData, fetchUserCircleRoles } from "@/lib/api"
import {
  TimePeriod,
  calculateAggregateComparativeTrend,
  calculateAggregateTrend,
  calculateComparativeTrend,
  calculateTrend,
  filterEventsByTimePeriod,
  getPeriodBoundaries,
  getTrendColor,
  getTrendIcon,
} from "@/lib/trends"
import { circleMap } from "@/lib/utils"
import { NationalRowData } from "@/types"
import { Icon } from "@iconify/react"
import { ColumnDef } from "@tanstack/react-table"
import { addMonths, format } from "date-fns"
import {
  BarChart3,
  Building2,
  Cable,
  CheckCircle,
  FileText,
  LayoutDashboard,
  Map,
  Minus,
  Table,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { Link } from "react-router"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@rio.js/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rio.js/ui/components/select"
import { Tabs, TabsList, TabsTrigger } from "@rio.js/ui/components/tabs"
import { cn } from "@rio.js/ui/lib/utils"

import { CircleSVG } from "@/components/circle-svg"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableProvider } from "@/components/data-table/data-table-provider"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { AestheticCard } from "@/components/ui/aesthetic-card"

import { NationalDashboardSkeleton } from "./loading-skeleton"
import { StatusCard } from "./status-card"

interface Milestone {
  id: number
  name: string
  targetPercentage: number
  date: Date
  monthsFromStart: number
}

function createMilestones(
  agreementDate: Date,
  type: "feasibility" | "hoto" = "feasibility",
): Milestone[] {
  if (type === "hoto") {
    return [
      {
        id: 1,
        name: "Milestone I",
        targetPercentage: 25,
        date: addMonths(agreementDate, 1),
        monthsFromStart: 1,
      },
      {
        id: 2,
        name: "Milestone II",
        targetPercentage: 50,
        date: addMonths(agreementDate, 2),
        monthsFromStart: 2,
      },
      {
        id: 3,
        name: "Milestone III",
        targetPercentage: 75,
        date: addMonths(agreementDate, 4),
        monthsFromStart: 4,
      },
      {
        id: 4,
        name: "Milestone IV",
        targetPercentage: 90,
        date: addMonths(agreementDate, 5),
        monthsFromStart: 5,
      },
      {
        id: 5,
        name: "Milestone V",
        targetPercentage: 100,
        date: addMonths(agreementDate, 6),
        monthsFromStart: 6,
      },
    ]
  }

  // Default feasibility milestones
  return [
    {
      id: 1,
      name: "Milestone I",
      targetPercentage: 5,
      date: addMonths(agreementDate, 3),
      monthsFromStart: 3,
    },
    {
      id: 2,
      name: "Milestone II",
      targetPercentage: 15,
      date: addMonths(agreementDate, 6),
      monthsFromStart: 6,
    },
    {
      id: 3,
      name: "Milestone III",
      targetPercentage: 40,
      date: addMonths(agreementDate, 9),
      monthsFromStart: 9,
    },
    {
      id: 4,
      name: "Milestone IV",
      targetPercentage: 95,
      date: addMonths(agreementDate, 12),
      monthsFromStart: 12,
    },
  ]
}

const parseDate = (date: string) => {
  const [day, month, year] = date.split(".")
  return new Date(Number(year), Number(month) - 1, Number(day))
}

function calculateCurrentTarget(
  milestones: Milestone[],
  currentDate: Date,
  totalGps: number,
): {
  expectedPercentage: number
  expectedGps: number
  currentMilestone?: Milestone
  lastMilestone?: Milestone
} {
  // Find the current milestone period
  const currentMilestone = milestones.find((m) => currentDate <= m.date)
  const lastMilestone = [...milestones]
    .reverse()
    .find((m) => currentDate > m.date)
  const finalMilestone = milestones[milestones.length - 1]

  if (!currentMilestone && lastMilestone) {
    // Past all milestones
    return {
      expectedPercentage: lastMilestone.targetPercentage,
      expectedGps: Math.round(
        (lastMilestone.targetPercentage / 100) * totalGps,
      ),
      lastMilestone,
    }
  }

  if (!currentMilestone) {
    // Past all milestones but no milestone has been completed yet
    return {
      expectedPercentage: finalMilestone.targetPercentage,
      expectedGps: Math.round(
        (finalMilestone.targetPercentage / 100) * totalGps,
      ),
      lastMilestone: finalMilestone,
    }
  }

  const currentIndex = milestones.indexOf(currentMilestone)
  const previousMilestone =
    currentIndex > 0 ? milestones[currentIndex - 1] : null

  if (!previousMilestone) {
    // Before first milestone
    const daysSinceStart =
      (currentDate.getTime() -
        milestones[0].date.getTime() +
        currentMilestone.monthsFromStart * 30 * 24 * 60 * 60 * 1000) /
      (1000 * 60 * 60 * 24)
    const totalDaysToMilestone = currentMilestone.monthsFromStart * 30
    const progress = Math.max(
      0,
      Math.min(1, daysSinceStart / totalDaysToMilestone),
    )
    const expectedPercentage = currentMilestone.targetPercentage

    return {
      expectedPercentage,
      expectedGps: Math.round((expectedPercentage / 100) * totalGps),
      currentMilestone,
      lastMilestone: lastMilestone,
    }
  }

  // Between two milestones - linear interpolation
  const totalDuration =
    currentMilestone.date.getTime() - previousMilestone.date.getTime()
  const elapsed = currentDate.getTime() - previousMilestone.date.getTime()
  const progress = Math.max(0, Math.min(1, elapsed / totalDuration))

  const expectedPercentage = previousMilestone.targetPercentage

  return {
    expectedPercentage,
    expectedGps: Math.round((expectedPercentage / 100) * totalGps),
    currentMilestone,
    lastMilestone: lastMilestone,
  }
}

interface NationalDashboardProps {
  timePeriod?: TimePeriod
  compareMode?: boolean
}

export function NationalDashboard({
  timePeriod = "today",
  compareMode = false,
}: NationalDashboardProps) {
  "use no memo"

  // Use the national dashboard hook
  const { data, circleRoles, isLoading, error } = useNationalDashboard()

  // Load events data
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents()

  // Load attendance data
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useAttendance()

  if (isLoading) return <NationalDashboardSkeleton />
  if (error)
    return (
      <div className="text-destructive text-center p-8">
        {error.message || "Failed to load national data"}
      </div>
    )
  if (!data.length)
    return <div className="text-center p-8">No data available</div>

  // Helper function to safely convert values to numbers
  const toNumber = (value: string | number): number => {
    if (typeof value === "number") return value
    if (!value || value === "") return 0
    const cleaned = value.toString().replace(/[^\d.-]/g, "")
    return parseFloat(cleaned) || 0
  }

  // Calculate national target based on milestones
  const calculateNationalHotoTarget = () => {
    const currentDate = new Date()
    let nationalTarget = 0

    data.forEach((state) => {
      if (state.agreementSigningDate && state.agreementSigningDate !== "") {
        try {
          const agreementDate = parseDate(state.agreementSigningDate)
          const milestones = createMilestones(agreementDate, "hoto")

          // Use the final milestone target
          const finalMilestone = milestones[milestones.length - 1]
          nationalTarget += Math.round(
            (finalMilestone.targetPercentage / 100) * state.hotoGPsTodo,
          )
        } catch (error) {
          console.warn("Failed to calculate target for", state.state, error)
        }
      }
    })

    return nationalTarget
  }

  // Calculate national summaries
  const nationalSummary = data.reduce(
    (acc, state) => {
      if (state.agreementSigningDate) {
        acc.totalGpsInScope += state.gPsTotal
        acc.totalHotoCompleted += state.hotoGPsDone
        acc.totalHotoTarget += state.hotoGPsTodo
        acc.totalSurveyCompleted += state.physicalSurveyGPsDone
        acc.totalSurveyTarget += state.physicalSurveyGPsTodo
        acc.totalGpsUptime += state["gPs >98%Uptime"]
        acc.totalFtthConnections += state.activeFtthConnections
        acc.totalOfcLength += state.ofcTotalKMs
        acc.totalOfcExisting += state.ofcExistingKMs
        acc.totalOfcNew += state.ofcNewKms
        acc.totalGpsCommissioned += state.gPsCommissionedTodo
        acc.totalGpsCommissionedDone += toNumber(state.gPsCommissionedDone)
        acc.totalDesktopSurveyDone += state.desktopSurveyDone
        acc.totalDesktopSurveyTarget += toNumber(state.desktopSurveyTarget)
      }

      return acc
    },
    {
      totalGpsInScope: 0,
      totalHotoCompleted: 0,
      totalHotoTarget: 0,
      totalSurveyCompleted: 0,
      totalSurveyTarget: 0,
      totalGpsUptime: 0,
      totalFtthConnections: 0,
      totalOfcLength: 0,
      totalOfcExisting: 0,
      totalOfcNew: 0,
      totalGpsCommissioned: 0,
      totalGpsCommissionedDone: 0,
      totalDesktopSurveyDone: 0,
      totalDesktopSurveyTarget: 0,
    },
  )

  const nationalHotoTarget = calculateNationalHotoTarget()

  // Calculate national target for physical survey based on milestones
  const calculateNationalSurveyTarget = () => {
    const currentDate = new Date()
    let nationalTarget = 0

    data.forEach((state) => {
      if (state.agreementSigningDate && state.agreementSigningDate !== "") {
        try {
          const agreementDate = parseDate(state.agreementSigningDate)
          const milestones = createMilestones(agreementDate, "feasibility")

          // Use the final milestone target
          const finalMilestone = milestones[milestones.length - 1]
          nationalTarget += Math.round(
            (finalMilestone.targetPercentage / 100) *
              state.physicalSurveyGPsTodo,
          )
        } catch (error) {
          console.warn(
            "Failed to calculate survey target for",
            state.state,
            error,
          )
        }
      }
    })

    return nationalTarget
  }

  const nationalSurveyTarget = calculateNationalSurveyTarget()

  // Prepare chart data
  const progressChartData = data.map((state) => ({
    state: state.state.replace(" & A&N", "").substring(0, 15),
    hotoProgress:
      state.hotoGPsTodo > 0 ? (state.hotoGPsDone / state.hotoGPsTodo) * 100 : 0,
    surveyProgress:
      state.physicalSurveyGPsTodo > 0
        ? (state.physicalSurveyGPsDone / state.physicalSurveyGPsTodo) * 100
        : 0,
    gpsCommissionedProgress:
      state.gPsCommissionedTodo > 0
        ? (toNumber(state.gPsCommissionedDone) / state.gPsCommissionedTodo) *
          100
        : 0,
  }))

  const statusDistributionData = [
    { name: "HOTO Completed", value: nationalSummary.totalHotoCompleted },
    {
      name: "HOTO Pending",
      value:
        nationalSummary.totalHotoTarget - nationalSummary.totalHotoCompleted,
    },
    { name: "Survey Completed", value: nationalSummary.totalSurveyCompleted },
    {
      name: "Survey Pending",
      value:
        nationalSummary.totalSurveyTarget -
        nationalSummary.totalSurveyCompleted,
    },
  ]

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"]

  // Calculate trends for key metrics
  const getTrendData = () => {
    if (!eventsData || eventsData.length === 0 || timePeriod === null) {
      return {
        hotoTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        surveyTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        desktopSurveyTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        uptimeTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        ftthTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
      }
    }

    const circles = data.map((row) => row.state)

    // Use comparative trends when compare mode is enabled
    if (compareMode && ["current-week", "current-month"].includes(timePeriod)) {
      return {
        hotoTrend: calculateAggregateComparativeTrend(
          eventsData,
          "hotoGPsDone",
          circles,
          timePeriod,
        ),
        surveyTrend: calculateAggregateComparativeTrend(
          eventsData,
          "physicalSurveyGPsDone",
          circles,
          timePeriod,
        ),
        desktopSurveyTrend: calculateAggregateComparativeTrend(
          eventsData,
          "desktopSurveyDone",
          circles,
          timePeriod,
        ),
        uptimeTrend: calculateAggregateComparativeTrend(
          eventsData,
          "gPs >98%Uptime",
          circles,
          timePeriod,
        ),
        ftthTrend: calculateAggregateComparativeTrend(
          eventsData,
          "activeFtthConnections",
          circles,
          timePeriod,
        ),
      }
    }

    // Use regular trends for non-compare mode
    const boundaries = getPeriodBoundaries(timePeriod)
    if (!boundaries) {
      return {
        hotoTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        surveyTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        desktopSurveyTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        uptimeTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
        ftthTrend: {
          direction: "stable" as const,
          hasData: false,
          changePercentage: 0,
          changeValue: 0,
          previousValue: 0,
          currentValue: 0,
        },
      }
    }

    const { startDate, endDate } = boundaries

    return {
      hotoTrend: calculateAggregateTrend(
        eventsData,
        "hotoGPsDone",
        circles,
        startDate,
        endDate,
      ),
      surveyTrend: calculateAggregateTrend(
        eventsData,
        "physicalSurveyGPsDone",
        circles,
        startDate,
        endDate,
      ),
      desktopSurveyTrend: calculateAggregateTrend(
        eventsData,
        "desktopSurveyDone",
        circles,
        startDate,
        endDate,
      ),
      uptimeTrend: calculateAggregateTrend(
        eventsData,
        "gPs >98%Uptime",
        circles,
        startDate,
        endDate,
      ),
      ftthTrend: calculateAggregateTrend(
        eventsData,
        "activeFtthConnections",
        circles,
        startDate,
        endDate,
      ),
    }
  }

  const trends = getTrendData()

  // TrendIndicator component
  const TrendIndicator = ({
    trend,
    size = "xs",
  }: {
    trend: {
      direction: string
      hasData: boolean
      changeValue: number
      changePercentage?: number
      currentTotal?: number
      previousTotal?: number
      currentDailyRate?: number
      previousDailyRate?: number
    }
    size?: "xs" | "sm"
  }) => {
    if (!trend.hasData) return null

    const iconSize = size === "xs" ? "h-3 w-3" : "h-4 w-4"
    const textSize = size === "xs" ? "text-base" : "text-sm"

    // Show percentage for comparative trends, otherwise show absolute change
    const displayValue =
      compareMode &&
      ["current-week", "current-month"].includes(timePeriod!) &&
      "changePercentage" in trend
        ? Math.round(trend.changePercentage!)
        : Math.round(trend.changeValue)

    const suffix =
      compareMode &&
      ["current-week", "current-month"].includes(timePeriod!) &&
      "changePercentage" in trend
        ? "%"
        : ""

    const showDetailed =
      compareMode &&
      ["current-week", "current-month"].includes(timePeriod!) &&
      trend.currentTotal !== undefined

    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-1 justify-center group-[.is-card]/card:justify-end",
            textSize,
            trend.direction === "up" && "text-emerald-600",
            trend.direction === "down" && "text-red-600",
            trend.direction === "stable" && "text-gray-500",
          )}
        >
          {trend.direction === "up" && (
            <Icon icon="iconamoon:trend-up-bold" className={iconSize} />
          )}
          {trend.direction === "down" && (
            <Icon icon="iconamoon:trend-down-bold" className={iconSize} />
          )}
          {trend.direction === "stable" && (
            <Icon
              icon="material-symbols:trending-flat-rounded"
              className={iconSize}
            />
          )}
          <span className="font-mono">
            {displayValue > 0 ? "+" : ""}
            {displayValue}
            {suffix}
          </span>
        </div>

        {showDetailed && (
          <div className="text-[10px] text-muted-foreground space-y-0.5 text-center group-[.is-card]/card:text-right">
            <div
              title={`Current: ${trend.currentTotal?.toLocaleString()}, Previous: ${trend.previousTotal?.toLocaleString()}`}
            >
              <span className="font-mono">
                {trend.previousTotal?.toLocaleString()}
              </span>
              <span className="mx-1">→</span>

              <span className="font-mono">
                {trend.currentTotal?.toLocaleString()}
              </span>
            </div>
            <div
              title={`Current: ${trend.currentDailyRate?.toFixed(1)}/day, Previous: ${trend.previousDailyRate?.toFixed(1)}/day`}
            >
              <span className="font-mono">
                {trend.previousDailyRate?.toFixed(1)}
              </span>
              <span className="mx-1">→</span>
              <span className="font-mono">
                {trend.currentDailyRate?.toFixed(1)}
              </span>
              <span>/day</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Helper function to get individual circle trend
  const getCircleTrend = (stateName: string, eventType: string) => {
    console.log(timePeriod, stateName, eventType, eventsData)
    if (!eventsData || eventsData.length === 0 || timePeriod === null) {
      return { direction: "stable" as const, hasData: false, changeValue: 0 }
    }

    // Use comparative trends when compare mode is enabled
    if (compareMode && ["current-week", "current-month"].includes(timePeriod)) {
      return calculateComparativeTrend(
        eventsData,
        eventType,
        stateName,
        timePeriod,
      )
    }

    // Use regular trends for non-compare mode
    const boundaries = getPeriodBoundaries(timePeriod)
    if (!boundaries) {
      return { direction: "stable" as const, hasData: false, changeValue: 0 }
    }

    const { startDate, endDate } = boundaries
    return calculateTrend(eventsData, eventType, stateName, startDate, endDate)
  }

  // Helper component for compact trend indicator

  // Define columns for the states table
  const columns: ColumnDef<NationalRowData>[] = [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => (
        <Suspense>
          <CircleSVG circleId={row.original.state} />
        </Suspense>
      ),
    },
    {
      accessorKey: "state",
      header: "State/UT",
      cell: ({ row }) => {
        if (
          Object.keys(circleMap).includes(
            row.original.abbreviation.toLowerCase(),
          )
        ) {
          return (
            <Link
              className="font-bold text-base text-blue-500 hover:underline text-wrap text-base"
              to={`/${row.original.abbreviation}`}
            >
              {row.getValue("state")}
            </Link>
          )
        }
        return (
          <div className="font-bold text-base text-wrap">
            {row.getValue("state")}
          </div>
        )
        return (
          <div className="font-bold text-base">{row.getValue("state")}</div>
        )
      },
    },
    {
      accessorKey: "pia",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="PIA"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => {
        const pia = row.original.pia
        const isNotPia =
          pia.toLowerCase().includes("tender") ||
          pia.toLowerCase().includes("bids")
        return (
          <div
            className={cn(
              "font-bold text-center text-base",
              isNotPia && "text-destructive",
            )}
          >
            {pia}
          </div>
        )
      },
    },
    {
      accessorKey: "agreementSigningDate",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Agreement Signing Date"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center text-base font-bold">
          {row.getValue("agreementSigningDate") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "ie",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IE" className="mx-auto" />
      ),
      cell: ({ row }) => {
        const ie = row.original.ie
        const isNotIE =
          ie.toLowerCase().includes("tender") ||
          ie.toLowerCase().includes("bids")
        return (
          <div
            className={cn(
              "font-bold text-center text-base",
              isNotIE && "text-destructive",
            )}
          >
            {ie}
          </div>
        )
      },
    },
    {
      accessorKey: "gPsTotal",
      enableSorting: true,
      cell: ({ row }) => {
        const total = row.original.gPsTotal
        const newGPs = row.original.gPsNew
        const existing = row.original.gPsExisting

        return (
          <div className="flex flex-col items-center text-base gap-1 font-bold">
            <div className="font-bold tabular-nums">
              {total.toLocaleString()}
            </div>
            <div className="text-xs flex flex-col items-center">
              <span className="text-blue-600">
                {existing.toLocaleString()} existing
              </span>
              <span className="text-emerald-600">
                {newGPs.toLocaleString()} new
              </span>
            </div>
          </div>
        )
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="Total GPs (Existing, New)"
        />
      ),
    },
    {
      id: "hotoProgress",
      accessorFn: (row) => {
        const done = row.hotoGPsDone
        const todo = row.hotoGPsTodo
        const percentage = todo > 0 ? (done / todo) * 100 : 0
        return percentage
      },

      cell: ({ row }) => {
        "use no memo"
        const done = row.original.hotoGPsDone
        const todo = row.original.hotoGPsTodo
        const percentage = todo > 0 ? (done / todo) * 100 : 0
        const trend = getCircleTrend(row.original.state, "hotoGPsDone")

        // Calculate milestone information
        let milestoneInfo = null
        if (
          row.original.agreementSigningDate &&
          row.original.agreementSigningDate !== ""
        ) {
          try {
            const agreementDate = parseDate(row.original.agreementSigningDate)
            const currentDate = new Date()
            const milestones = createMilestones(agreementDate, "hoto")
            const target = calculateCurrentTarget(milestones, currentDate, todo)

            milestoneInfo = {
              previousMilestone: target.lastMilestone, // The milestone that has been passed
              currentMilestone: target.currentMilestone,
              finalMilestone: milestones[milestones.length - 1], // The actual final milestone
              currentTarget: target.expectedPercentage,
              currentTargetGps: target.expectedGps,
              isOnTrack: percentage >= target.expectedPercentage,
            }
          } catch (error) {
            console.warn(
              "Failed to parse agreement date:",
              row.original.agreementSigningDate,
            )
          }
        }

        return (
          <div className="flex flex-col items-center gap-1 text-base font-bold">
            {trend.hasData ? (
              <TrendIndicator trend={trend} size="xs" />
            ) : (
              <Badge
                variant={milestoneInfo?.isOnTrack ? "secondary" : "destructive"}
                className="font-mono"
              >
                {percentage.toFixed(0)}%
              </Badge>
            )}
            <div className="text-xs text-muted-foreground">
              {(done ?? 0).toLocaleString()}/{(todo ?? 0).toLocaleString()}
            </div>

            {/* Milestone information */}
            {milestoneInfo && (
              <div className="text-xs text-center space-y-0.5">
                {/* Current Target */}
                <div className="space-y-0.5 border-b border-gray-200 pb-1">
                  <div className="text-muted-foreground">
                    Next: {milestoneInfo.currentMilestone?.name}
                  </div>
                  <div className={cn("font-mono text-xs", "text-blue-600")}>
                    {milestoneInfo.currentMilestone?.targetPercentage.toFixed(
                      1,
                    )}
                    % (
                    {((milestoneInfo.currentMilestone?.targetPercentage ?? 0) /
                      100) *
                      row.original.hotoGPsTodo}{" "}
                    GPs)
                  </div>
                  {milestoneInfo.currentMilestone && (
                    <div className="text-muted-foreground">
                      by{" "}
                      {format(
                        milestoneInfo.currentMilestone.date,
                        "dd MMM yyyy",
                      )}
                    </div>
                  )}
                </div>

                {/* Previous Milestone */}
                {milestoneInfo.previousMilestone && (
                  <div className="space-y-0.5 pb-1">
                    <div className="text-muted-foreground">
                      Previous: {milestoneInfo.previousMilestone.name}
                    </div>
                    <div className="font-mono text-xs text-green-600">
                      {milestoneInfo.previousMilestone.targetPercentage}% (
                      {Math.round(
                        (milestoneInfo.previousMilestone.targetPercentage /
                          100) *
                          todo,
                      )}{" "}
                      GPs) ✓
                    </div>
                    <div className="text-muted-foreground">
                      by{" "}
                      {format(
                        milestoneInfo.previousMilestone.date,
                        "dd MMM yyyy",
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      },
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="HOTO"
        />
      ),
    },
    {
      accessorKey: "desktopSurveyDone",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="Desktop Survey"
        />
      ),
      accessorFn: (row) => {
        const done = Number(row.desktopSurveyDone)
        const todo = Number(row.desktopSurveyTarget)
        const percentage = todo > 0 ? (done / todo) * 100 : 0
        return percentage
      },
      cell: ({ row }) => {
        const done = Number(row.original.desktopSurveyDone)
        const todo = Number(row.original.desktopSurveyTarget)
        const percentage = todo > 0 ? (done / todo) * 100 : 0
        const trend = getCircleTrend(row.original.state, "desktopSurveyDone")

        return (
          <div className="flex flex-col items-center gap-1 text-base font-bold">
            {trend.hasData ? (
              <TrendIndicator trend={trend} size="xs" />
            ) : (
              <Badge
                variant={
                  // percentage >= 100
                  //   ? "default"
                  //   : percentage >= 75
                  //     ? "secondary"
                  //     : "destructive"
                  "default"
                }
                className="font-mono"
              >
                {percentage.toFixed(0)}%
              </Badge>
            )}
            <div className="text-xs text-muted-foreground">
              {(done ?? 0).toLocaleString()}/{(todo ?? 0).toLocaleString()}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "physicalSurveyGPsDone",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="Physical Survey"
        />
      ),
      accessorFn: (row) => {
        const done = row.physicalSurveyGPsDone
        const todo = row.physicalSurveyGPsTodo
        const percentage = todo > 0 ? (done / todo) * 100 : 0
        return percentage
      },
      cell: ({ row }) => {
        const done = row.original.physicalSurveyGPsDone
        const todo = row.original.physicalSurveyGPsTodo
        const percentage = todo > 0 ? (done / todo) * 100 : 0
        const trend = getCircleTrend(
          row.original.state,
          "physicalSurveyGPsDone",
        )

        // Calculate milestone information for physical survey
        let milestoneInfo = null
        if (
          row.original.agreementSigningDate &&
          row.original.agreementSigningDate !== ""
        ) {
          try {
            const agreementDate = parseDate(row.original.agreementSigningDate)
            const currentDate = new Date()
            const milestones = createMilestones(agreementDate, "feasibility")
            const target = calculateCurrentTarget(milestones, currentDate, todo)

            milestoneInfo = {
              previousMilestone: target.lastMilestone, // The milestone that has been passed
              currentMilestone: target.currentMilestone,
              finalMilestone: milestones[milestones.length - 1], // The actual final milestone
              currentTarget: target.expectedPercentage,
              currentTargetGps: target.expectedGps,
              isOnTrack: percentage >= target.expectedPercentage,
            }
          } catch (error) {
            console.warn(
              "Failed to parse agreement date:",
              row.original.agreementSigningDate,
            )
          }
        }

        return (
          <div className="flex flex-col items-center gap-1 text-base font-bold">
            {trend.hasData ? (
              <TrendIndicator trend={trend} size="xs" />
            ) : (
              <Badge
                variant={
                  // milestoneInfo.isOnTrack ? "secondary" : "destructive"
                  // percentage >= 100
                  //   ? "default"
                  //   : percentage >= 75
                  //     ? "secondary"
                  //     : "destructive"
                  "default"
                }
                className="font-mono"
              >
                {percentage.toFixed(0)}%
              </Badge>
            )}
            <div className="text-xs text-muted-foreground">
              {(done ?? 0).toLocaleString()}/{(todo ?? 0).toLocaleString()}
            </div>

            {/* Milestone information */}
            {milestoneInfo && (
              <div className="text-xs text-center space-y-0.5">
                {/* Current Target */}
                <div className="space-y-0.5 border-b border-gray-200 pb-1">
                  <div className="text-muted-foreground">
                    Next: {milestoneInfo.currentMilestone?.name}
                  </div>
                  <div className={cn("font-mono text-xs", "text-blue-600")}>
                    {milestoneInfo.currentMilestone?.targetPercentage.toFixed(
                      1,
                    )}
                    % (
                    {((milestoneInfo.currentMilestone?.targetPercentage ?? 0) /
                      100) *
                      row.original.physicalSurveyGPsTodo}{" "}
                    GPs)
                  </div>
                  <div className="text-muted-foreground">
                    by{" "}
                    {format(
                      milestoneInfo.currentMilestone?.date,
                      "dd MMM yyyy",
                    )}
                  </div>
                </div>

                {/* Previous Milestone */}
                {milestoneInfo.previousMilestone && (
                  <div className="space-y-0.5 pb-1">
                    <div className="text-muted-foreground">
                      Previous: {milestoneInfo.previousMilestone.name}
                    </div>
                    <div className="font-mono text-xs text-green-600">
                      {milestoneInfo.previousMilestone.targetPercentage}% (
                      {Math.round(
                        (milestoneInfo.previousMilestone.targetPercentage /
                          100) *
                          todo,
                      )}{" "}
                      GPs) ✓
                    </div>
                    <div className="text-muted-foreground">
                      by{" "}
                      {format(
                        milestoneInfo.previousMilestone.date,
                        "dd MMM yyyy",
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "gPs >98%Uptime",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="GPs with >98% Uptime"
        />
      ),
      cell: ({ row }) => {
        const uptime = row.original["gPs >98%Uptime"]
        const total = row.original.gPsTotal
        const percentage = total > 0 ? (uptime / total) * 100 : 0
        const trend = getCircleTrend(row.original.state, "gPs >98%Uptime")

        return (
          <div className="flex flex-col items-center gap-1 text-base font-bold">
            <div className="font-mono">{uptime.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}%
            </div>
            <TrendIndicator trend={trend} size="xs" />
          </div>
        )
      },
    },
    {
      accessorKey: "activeFtthConnections",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="FTTH Connections"
        />
      ),
      cell: ({ row }) => {
        const connections = row.original.activeFtthConnections
        const trend = getCircleTrend(
          row.original.state,
          "activeFtthConnections",
        )

        return (
          <div className="flex flex-col items-center gap-1 text-base font-bold">
            <TrendIndicator trend={trend} size="xs" />
            <div className="font-mono">{connections.toLocaleString()}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "ofcTotalKMs",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="OFC (KMs)"
        />
      ),
      cell: ({ row }) => {
        const total = row.original.ofcTotalKMs
        const existing = row.original.ofcExistingKMs
        const newKms = row.original.ofcNewKms
        const laid = row.original.ofcLaidKMs
        const percentage = total > 0 ? (laid / total) * 100 : 0

        return (
          <div className="flex flex-col items-center gap-1 text-base font-bold">
            <Badge
              variant={
                percentage >= 80
                  ? "default"
                  : percentage >= 40
                    ? "secondary"
                    : "destructive"
              }
              className="text-xs"
            >
              {laid}km ({percentage.toFixed(0)}%) laid
            </Badge>{" "}
            <div className="font-mono">{(total ?? 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              <span className="text-green-700">
                {existing.toLocaleString()} existing{" "}
              </span>
              ,{" "}
              <span className="text-blue-700">
                {newKms.toLocaleString()} new
              </span>
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-6 overflow-y-auto">
      {/* <div className="flex items-center justify-end"></div> */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Map className="h-5 w-5" />
          National Progress
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="Total GPs in Scope"
            value={nationalSummary.totalGpsInScope}
            icon={<Map />}
            description="Total Gram Panchayats to be covered"
          />
          <StatusCard
            title="HOTO Progress"
            value={
              <>
                <span>
                  {nationalSummary.totalHotoCompleted.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {nationalSummary.totalHotoTarget.toLocaleString()}
                </span>
              </>
            }
            icon={<Icon icon="lineicons:handshake" className="size-6" />}
            description={
              <>
                <span className="text-muted-foreground italic">
                  (For existing GPs only)
                </span>
                <br />
                {(nationalSummary.totalHotoTarget > 0
                  ? (nationalSummary.totalHotoCompleted /
                      nationalSummary.totalHotoTarget) *
                    100
                  : 0
                ).toFixed(1)}
                % completed <br />
                {nationalHotoTarget > 0
                  ? `Target: ${nationalHotoTarget.toLocaleString()} GPs (${((nationalSummary.totalHotoCompleted / nationalHotoTarget) * 100).toFixed(1)}% achieved)`
                  : "No milestone targets set"}
              </>
            }
            className="bg-emerald-50 dark:bg-emerald-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              trends.hotoTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(trends.hotoTrend.changePercentage)
                        : Math.round(trends.hotoTrend.changeValue),
                    direction:
                      trends.hotoTrend.direction === "up"
                        ? "up"
                        : trends.hotoTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                    ...(compareMode &&
                      ["current-week", "current-month"].includes(timePeriod) &&
                      "currentTotal" in trends.hotoTrend && {
                        currentTotal: trends.hotoTrend.currentTotal,
                        previousTotal: trends.hotoTrend.previousTotal,
                        currentDailyRate: trends.hotoTrend.currentDailyRate,
                        previousDailyRate: trends.hotoTrend.previousDailyRate,
                      }),
                  }
                : undefined
            }
          />
          <StatusCard
            title="Physical Survey Progress"
            value={
              <>
                <span>
                  {nationalSummary.totalSurveyCompleted.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {nationalSummary.totalSurveyTarget.toLocaleString()}
                </span>
              </>
            }
            icon={<FileText />}
            description={
              <>
                {(nationalSummary.totalSurveyTarget > 0
                  ? (nationalSummary.totalSurveyCompleted /
                      nationalSummary.totalSurveyTarget) *
                    100
                  : 0
                ).toFixed(1)}
                % completed <br />
                {nationalSurveyTarget > 0
                  ? `Target: ${nationalSurveyTarget.toLocaleString()} GPs (${((nationalSummary.totalSurveyCompleted / nationalSurveyTarget) * 100).toFixed(1)}% achieved)`
                  : "No milestone targets set"}
              </>
            }
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              trends.surveyTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(trends.surveyTrend.changePercentage)
                        : Math.round(trends.surveyTrend.changeValue),
                    direction:
                      trends.surveyTrend.direction === "up"
                        ? "up"
                        : trends.surveyTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                    ...(compareMode &&
                      ["current-week", "current-month"].includes(timePeriod) &&
                      "currentTotal" in trends.surveyTrend && {
                        currentTotal: trends.surveyTrend.currentTotal,
                        previousTotal: trends.surveyTrend.previousTotal,
                        currentDailyRate: trends.surveyTrend.currentDailyRate,
                        previousDailyRate: trends.surveyTrend.previousDailyRate,
                      }),
                  }
                : undefined
            }
          />
          <StatusCard
            title="Desktop Survey Progress"
            value={
              <>
                <span>
                  {nationalSummary.totalDesktopSurveyDone.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {nationalSummary.totalDesktopSurveyTarget.toLocaleString()}
                </span>
              </>
            }
            icon={<Icon icon="mdi:desktop-mac" className="size-6" />}
            description={`${(nationalSummary.totalDesktopSurveyTarget > 0
              ? (nationalSummary.totalDesktopSurveyDone /
                  nationalSummary.totalDesktopSurveyTarget) *
                100
              : 0
            ).toFixed(1)}% completed`}
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              trends.desktopSurveyTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(trends.desktopSurveyTrend.changePercentage)
                        : Math.round(trends.desktopSurveyTrend.changeValue),
                    direction:
                      trends.desktopSurveyTrend.direction === "up"
                        ? "up"
                        : trends.desktopSurveyTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                    ...(compareMode &&
                      ["current-week", "current-month"].includes(timePeriod) &&
                      "currentTotal" in trends.desktopSurveyTrend && {
                        currentTotal: trends.desktopSurveyTrend.currentTotal,
                        previousTotal: trends.desktopSurveyTrend.previousTotal,
                        currentDailyRate:
                          trends.desktopSurveyTrend.currentDailyRate,
                        previousDailyRate:
                          trends.desktopSurveyTrend.previousDailyRate,
                      }),
                  }
                : undefined
            }
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Cable className="h-5 w-5" />
          Infrastructure Progress
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="OFC Length"
            value={nationalSummary.totalOfcLength}
            icon={<Cable />}
            description="Total OFC route length (KMs)"
            valueFormatter={(value) => `${value.toLocaleString()} km`}
          />
          <StatusCard
            title="FTTH Connections"
            value={nationalSummary.totalFtthConnections}
            icon={<Building2 />}
            description="Active FTTH connections nationwide"
            className="bg-indigo-50 dark:bg-indigo-950/20"
            trend={
              trends.ftthTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(trends.ftthTrend.changePercentage)
                        : Math.round(trends.ftthTrend.changeValue),
                    direction:
                      trends.ftthTrend.direction === "up"
                        ? "up"
                        : trends.ftthTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                  }
                : undefined
            }
          />

          <StatusCard
            title="GPs with >98% Uptime"
            value={nationalSummary.totalGpsUptime}
            icon={<Wifi />}
            description="Total GPs with >98% uptime"
            className="bg-purple-50 dark:bg-purple-950/20"
            trend={
              trends.uptimeTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(trends.uptimeTrend.changePercentage)
                        : Math.round(trends.uptimeTrend.changeValue),
                    direction:
                      trends.uptimeTrend.direction === "up"
                        ? "up"
                        : trends.uptimeTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                  }
                : undefined
            }
          />
          <StatusCard
            title="GPS Commissioned"
            value={
              nationalSummary.totalGpsCommissioned > 0
                ? (nationalSummary.totalGpsCommissionedDone /
                    nationalSummary.totalGpsCommissioned) *
                  100
                : 0
            }
            icon={<Zap />}
            description={`${nationalSummary.totalGpsCommissionedDone.toLocaleString()}/${nationalSummary.totalGpsCommissioned.toLocaleString()} commissioned`}
            className="bg-amber-50 dark:bg-amber-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Attendance Overview Section */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Icon icon="mdi:account-group" className="h-5 w-5" />
          Attendance Overview
        </h2>
        {attendanceLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : attendanceError ? (
          <div className="text-destructive text-sm mb-4">
            Failed to load attendance data: {attendanceError.message}
          </div>
        ) : attendanceData ? (
          <a href="https://glitscrm.digitalrupay.com/monitoring_dashboard/dashboard/manpower/Package-1">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatusCard
                title="Total Users"
                value={attendanceData.total_users}
                icon={<Icon icon="mdi:account-group" className="size-6" />}
                description="Total registered users"
                className="bg-slate-50 dark:bg-slate-950/20"
              />
              <StatusCard
                title="Present Today"
                value={attendanceData.total_present}
                icon={<Icon icon="mdi:account-check" className="size-6" />}
                description={`${attendanceData.total_users > 0 ? ((attendanceData.total_present / attendanceData.total_users) * 100).toFixed(1) : 0}% attendance rate`}
                className="bg-green-50 dark:bg-green-950/20"
              />
              <StatusCard
                title="Absent Today"
                value={attendanceData.total_absent}
                icon={<Icon icon="mdi:account-remove" className="size-6" />}
                description={`${attendanceData.total_users > 0 ? ((attendanceData.total_absent / attendanceData.total_users) * 100).toFixed(1) : 0}% absent rate`}
                className="bg-red-50 dark:bg-red-950/20"
              />
              <StatusCard
                title="Late Arrivals"
                value={attendanceData.total_late_time}
                icon={<Icon icon="mdi:clock-alert" className="size-6" />}
                description={`${attendanceData.total_present > 0 ? ((attendanceData.total_late_time / attendanceData.total_present) * 100).toFixed(1) : 0}% of present users`}
                className="bg-orange-50 dark:bg-orange-950/20"
              />
            </div>
          </a>
        ) : null}
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Table className="h-5 w-5" />
          Package-wise Progress
        </h2>
        <DataTableProvider
          columns={columns as any}
          data={data.map((item) => ({ ...item, id: item.id.toString() }))}
          defaultView="map"
          skeletonRow={{
            id: "skeleton",
            sNo: 0,
            ie: "",
            state: "",
            abbreviation: "",
            pia: "",
            agreementSigningDate: "",
            gPsTotal: 0,
            gPsNew: 0,
            gPsExisting: 0,
            hotoGPsTodo: 0,
            hotoGPsDone: 0,
            hotoKMsDone: "",
            hotoKMsTodo: "",
            physicalSurveyGPsTodo: 0,
            physicalSurveyGPsDone: 0,
            physicalSurveyKMsTodo: "",
            physicalSurveyKMsDone: "",
            physicalSurveyBlocksDone: 0,
            physicalSurveyBlocksPending: 0,
            hotoBlocksDone: 0,
            hotoBlocksPending: 0,
            desktopSurveyTarget: "",
            desktopSurveyDone: 0,
            snocTargetDate: "",
            snocStatus: "",
            "gPs >98%Uptime": 0,
            activeFtthConnections: 0,
            gPsCommissionedTodo: 0,
            gPsCommissionedDone: "",
            ofcTotalKMs: 0,
            ofcExistingKMs: 0,
            ofcNewKms: 0,
            ofcLaidKMs: 0,
          }}
        >
          <DataTable
            cardComponent={AestheticCard}
            key={timePeriod + compareMode.toString()}
          >
            <DataTableAdvancedToolbar>
              <DataTableFilterList />
              <DataTableSortList />
            </DataTableAdvancedToolbar>
          </DataTable>
        </DataTableProvider>
      </div>

      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Package-wise Progress Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={progressChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="state"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name,
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="hotoProgress"
                  fill="#22c55e"
                  name="HOTO Progress"
                />
                <Bar
                  dataKey="surveyProgress"
                  fill="#3b82f6"
                  name="Survey Progress"
                />
                <Bar
                  dataKey="gpsCommissionedProgress"
                  fill="#f59e0b"
                  name="GPS Commissioned"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Overall Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => value.toLocaleString()}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
