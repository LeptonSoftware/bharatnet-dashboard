"use no memo";

import { Suspense, useEffect, useState } from "react";
import { fetchNationalData, fetchUserCircleRoles } from "@/lib/api";
import { NationalRowData } from "@/types";
import { StatusCard } from "./status-card";
import { AestheticCard } from "@/components/ui/aesthetic-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@rio.js/ui/components/badge";
import {
  LayoutDashboard,
  Map,
  CheckCircle,
  FileText,
  Cable,
  Zap,
  Wifi,
  Building2,
  Table,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DataTableProvider } from "@/components/data-table/data-table-provider";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { CircleSVG } from "@/components/circle-svg";
import { circleMap } from "@/lib/utils";
import { Link } from "react-router";
import { Tabs, TabsList, TabsTrigger } from "@rio.js/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rio.js/ui/components/select";
import { cn } from "@rio.js/ui/lib/utils";
import { NationalDashboardSkeleton } from "./loading-skeleton";
import { Icon } from "@iconify/react";
import {
  TimePeriod,
  filterEventsByTimePeriod,
  calculateAggregateTrend,
  calculateTrend,
  getTrendIcon,
  getTrendColor,
  getPeriodBoundaries,
} from "@/lib/trends";
import { useEvents } from "@/hooks/use-events";

const TrendIndicator = ({
  trend,
  size = "xs",
}: {
  trend: { direction: string; hasData: boolean; changeValue: number };
  size?: "xs" | "sm";
}) => {
  if (!trend.hasData) return null;

  const iconSize = size === "xs" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        textSize,
        trend.direction === "up" && "text-emerald-600",
        trend.direction === "down" && "text-red-600",
        trend.direction === "stable" && "text-gray-500"
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
        {trend.changeValue > 0 ? "+" : ""}
        {Math.round(trend.changeValue)}
      </span>
    </div>
  );
};
// Add CircleRole type
interface CircleRole {
  id: number;
  created_at: string;
  user_id: string;
  circles: string[];
  role: string;
}

interface NationalDashboardProps {
  timePeriod?: TimePeriod;
}

export function NationalDashboard({
  timePeriod = "today",
}: NationalDashboardProps) {
  "use no memo";
  const [data, setData] = useState<NationalRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [circleRoles, setCircleRoles] = useState<CircleRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load events data
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const nationalData = await fetchNationalData();
        const userCircleRoles = await fetchUserCircleRoles();
        console.log(userCircleRoles);
        console.log(nationalData);
        setCircleRoles(userCircleRoles);

        // Filter national data based on circle roles
        if (userCircleRoles && userCircleRoles.circles.length > 0) {
          const allowedCircles = userCircleRoles.circles.map((c) =>
            c.toLowerCase()
          );
          const filteredData = nationalData.filter((row) =>
            allowedCircles.includes(row.abbreviation.toLowerCase())
          );
          setData(filteredData);
        } else {
          setData(nationalData);
        }
      } catch (err) {
        setError("Failed to load national data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) return <NationalDashboardSkeleton />;
  if (error)
    return <div className="text-destructive text-center p-8">{error}</div>;
  if (!data.length)
    return <div className="text-center p-8">No data available</div>;

  // Helper function to safely convert values to numbers
  const toNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (!value || value === "") return 0;
    const cleaned = value.toString().replace(/[^\d.-]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Calculate national summaries
  const nationalSummary = data.reduce(
    (acc, state) => {
      acc.totalGpsInScope += state.gPsTotal;
      acc.totalHotoCompleted += state.hotoGPsDone;
      acc.totalHotoTarget += state.hotoGPsTodo;
      acc.totalSurveyCompleted += state.physicalSurveyGPsDone;
      acc.totalSurveyTarget += state.physicalSurveyGPsTodo;
      acc.totalGpsUptime += state["gPs >98%Uptime"];
      acc.totalFtthConnections += state.activeFtthConnections;
      acc.totalOfcLength += state.ofcTotalKMs;
      acc.totalOfcExisting += state.ofcExistingKMs;
      acc.totalOfcNew += state.ofcNewKms;
      acc.totalGpsCommissioned +=
        state.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone;
      acc.totalGpsCommissionedDone += toNumber(
        state.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone
      );
      acc.totalDesktopSurveyDone += state.desktopSurveyDone;
      acc.totalDesktopSurveyTarget += toNumber(state.desktopSurveyTarget);
      return acc;
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
    }
  );

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
      state.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone > 0
        ? (toNumber(state.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone) /
            state.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone) *
          100
        : 0,
  }));

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
  ];

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b"];

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
      };
    }

    const boundaries = getPeriodBoundaries(timePeriod);
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
      };
    }

    const { startDate, endDate } = boundaries;
    const circles = data.map((row) => row.state);

    return {
      hotoTrend: calculateAggregateTrend(
        eventsData,
        "hotoGPsDone",
        circles,
        startDate,
        endDate
      ),
      surveyTrend: calculateAggregateTrend(
        eventsData,
        "physicalSurveyGPsDone",
        circles,
        startDate,
        endDate
      ),
      desktopSurveyTrend: calculateAggregateTrend(
        eventsData,
        "desktopSurveyDone",
        circles,
        startDate,
        endDate
      ),
      uptimeTrend: calculateAggregateTrend(
        eventsData,
        "gPs >98%Uptime",
        circles,
        startDate,
        endDate
      ),
      ftthTrend: calculateAggregateTrend(
        eventsData,
        "activeFtthConnections",
        circles,
        startDate,
        endDate
      ),
    };
  };

  const trends = getTrendData();

  // Helper function to get individual circle trend
  const getCircleTrend = (stateName: string, eventType: string) => {
    console.log(timePeriod, stateName, eventType, eventsData);
    if (!eventsData || eventsData.length === 0 || timePeriod === null) {
      return { direction: "stable" as const, hasData: false, changeValue: 0 };
    }

    const boundaries = getPeriodBoundaries(timePeriod);
    if (!boundaries) {
      return { direction: "stable" as const, hasData: false, changeValue: 0 };
    }

    const { startDate, endDate } = boundaries;
    return calculateTrend(eventsData, eventType, stateName, startDate, endDate);
  };

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
            row.original.abbreviation.toLowerCase()
          )
        ) {
          return (
            <Link
              className="font-bold text-base text-blue-500 hover:underline text-wrap"
              to={`/${row.original.abbreviation}`}
            >
              {row.getValue("state")}
            </Link>
          );
        }
        return (
          <div className="font-bold text-base text-wrap">
            {row.getValue("state")}
          </div>
        );
        return (
          <div className="font-bold text-base">{row.getValue("state")}</div>
        );
      },
    },
    {
      accessorKey: "pia",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="PIA"
        />
      ),
      cell: ({ row }) => {
        const pia = row.original.pia;

        const isNotPia =
          pia.toLowerCase().includes("tender") ||
          pia.toLowerCase().includes("bids");
        return (
          <div className={cn("text-center", isNotPia && "text-destructive")}>
            {pia}
          </div>
        );
      },
    },
    {
      accessorKey: "gPsTotal",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="text-center font-mono">
          {row.original.gPsTotal.toLocaleString()}
        </div>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader
          className="mx-auto"
          column={column}
          title="Total GPs"
        />
      ),
    },
    {
      id: "hotoProgress",
      accessorFn: (row) => {
        const done = row.hotoGPsDone;
        const todo = row.hotoGPsTodo;
        const percentage = todo > 0 ? (done / todo) * 100 : 0;
        return percentage;
      },

      cell: ({ row }) => {
        "use no memo";
        const done = row.original.hotoGPsDone;
        const todo = row.original.hotoGPsTodo;
        const percentage = todo > 0 ? (done / todo) * 100 : 0;
        const trend = getCircleTrend(row.original.state, "hotoGPsDone");
        console.log(trend);

        return (
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant={
                percentage >= 100
                  ? "default"
                  : percentage >= 75
                    ? "secondary"
                    : "destructive"
              }
              className="font-mono"
            >
              {percentage.toFixed(0)}%
            </Badge>
            <div className="text-xs text-muted-foreground">
              {(done ?? 0).toLocaleString()}/{(todo ?? 0).toLocaleString()}
            </div>
            <TrendIndicator trend={trend} size="xs" />
          </div>
        );
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
        const done = Number(row.desktopSurveyDone);
        const todo = Number(row.desktopSurveyTarget);
        const percentage = todo > 0 ? (done / todo) * 100 : 0;
        return percentage;
      },
      cell: ({ row }) => {
        const done = Number(row.original.desktopSurveyDone);
        const todo = Number(row.original.desktopSurveyTarget);
        const percentage = todo > 0 ? (done / todo) * 100 : 0;
        const trend = getCircleTrend(row.original.state, "desktopSurveyDone");

        return (
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant={
                percentage >= 100
                  ? "default"
                  : percentage >= 75
                    ? "secondary"
                    : "destructive"
              }
              className="font-mono"
            >
              {percentage.toFixed(0)}%
            </Badge>
            <div className="text-xs text-muted-foreground">
              {(done ?? 0).toLocaleString()}/{(todo ?? 0).toLocaleString()}
            </div>
            <TrendIndicator trend={trend} size="xs" />
          </div>
        );
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
        const done = row.physicalSurveyGPsDone;
        const todo = row.physicalSurveyGPsTodo;
        const percentage = todo > 0 ? (done / todo) * 100 : 0;
        return percentage;
      },
      cell: ({ row }) => {
        const done = row.original.physicalSurveyGPsDone;
        const todo = row.original.physicalSurveyGPsTodo;
        const percentage = todo > 0 ? (done / todo) * 100 : 0;
        const trend = getCircleTrend(
          row.original.state,
          "physicalSurveyGPsDone"
        );

        return (
          <div className="flex flex-col items-center gap-1">
            <Badge
              variant={
                percentage >= 100
                  ? "default"
                  : percentage >= 75
                    ? "secondary"
                    : "destructive"
              }
              className="font-mono"
            >
              {percentage.toFixed(0)}%
            </Badge>
            <div className="text-xs text-muted-foreground">
              {(done ?? 0).toLocaleString()}/{(todo ?? 0).toLocaleString()}
            </div>
            <TrendIndicator trend={trend} size="xs" />
          </div>
        );
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
        const uptime = row.original["gPs >98%Uptime"];
        const total = row.original.gPsTotal;
        const percentage = total > 0 ? (uptime / total) * 100 : 0;
        const trend = getCircleTrend(row.original.state, "gPs >98%Uptime");

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-mono">{uptime.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}%
            </div>
            <TrendIndicator trend={trend} size="xs" />
          </div>
        );
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
        const connections = row.original.activeFtthConnections;
        const trend = getCircleTrend(
          row.original.state,
          "activeFtthConnections"
        );

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-mono">{connections.toLocaleString()}</div>
            <TrendIndicator trend={trend} size="xs" />
          </div>
        );
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
        const total = row.original.ofcTotalKMs;
        const existing = row.original.ofcExistingKMs;
        const newKms = row.original.ofcNewKms;
        const laid = row.original.ofcLaidKMs;
        const percentage = total > 0 ? (laid / total) * 100 : 0;

        return (
          <div className="flex flex-col items-center gap-1">
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
              {percentage.toFixed(0)}% laid
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
        );
      },
    },
  ];

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
            description={`${(nationalSummary.totalHotoTarget > 0
              ? (nationalSummary.totalHotoCompleted /
                  nationalSummary.totalHotoTarget) *
                100
              : 0
            ).toFixed(1)}% completed`}
            className="bg-emerald-50 dark:bg-emerald-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              trends.hotoTrend.hasData && timePeriod
                ? {
                    value: Math.round(trends.hotoTrend.changeValue),
                    direction:
                      trends.hotoTrend.direction === "up"
                        ? "up"
                        : trends.hotoTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period: timePeriod.replace("-", " "),
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
            description={`${(nationalSummary.totalSurveyTarget > 0
              ? (nationalSummary.totalSurveyCompleted /
                  nationalSummary.totalSurveyTarget) *
                100
              : 0
            ).toFixed(1)}% completed`}
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              trends.surveyTrend.hasData
                ? {
                    value: Math.round(trends.surveyTrend.changeValue),
                    direction:
                      trends.surveyTrend.direction === "up"
                        ? "up"
                        : trends.surveyTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period: timePeriod.replace("-", " "),
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
                    value: Math.round(trends.desktopSurveyTrend.changeValue),
                    direction:
                      trends.desktopSurveyTrend.direction === "up"
                        ? "up"
                        : trends.desktopSurveyTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period: timePeriod.replace("-", " "),
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
                    value: Math.round(trends.ftthTrend.changeValue),
                    direction:
                      trends.ftthTrend.direction === "up"
                        ? "up"
                        : trends.ftthTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period: timePeriod.replace("-", " "),
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
                    value: Math.round(trends.uptimeTrend.changeValue),
                    direction:
                      trends.uptimeTrend.direction === "up"
                        ? "up"
                        : trends.uptimeTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period: timePeriod.replace("-", " "),
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

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Table className="h-5 w-5" />
          Package-wise Progress
        </h2>
        <DataTableProvider columns={columns} data={data} defaultView="grid">
          <DataTable cardComponent={AestheticCard} key={timePeriod}>
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
  );
}
