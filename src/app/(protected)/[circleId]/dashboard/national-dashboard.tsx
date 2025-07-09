import { Suspense, useEffect, useState } from "react";
import { fetchNationalData } from "@/lib/api";
import { NationalRowData } from "@/types";
import { StatusCard } from "./status-card";
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

export function NationalDashboard() {
  const [data, setData] = useState<NationalRowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const nationalData = await fetchNationalData();
        setData(nationalData);
      } catch (err) {
        setError("Failed to load national data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading)
    return <div className="text-center p-8">Loading national dashboard...</div>;
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
        const done = row.original.hotoGPsDone;
        const todo = row.original.hotoGPsTodo;
        const percentage = todo > 0 ? (done / todo) * 100 : 0;

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

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-mono">{uptime.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}%
            </div>
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

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-mono">{connections.toLocaleString()}</div>
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
            <div className="font-mono">{(total ?? 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {existing.toLocaleString()} existing, {newKms.toLocaleString()}{" "}
              new
            </div>
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
            </Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6 overflow-y-auto">
      <div>
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
              nationalSummary.totalHotoTarget > 0
                ? (nationalSummary.totalHotoCompleted /
                    nationalSummary.totalHotoTarget) *
                  100
                : 0
            }
            icon={<CheckCircle />}
            description={`${nationalSummary.totalHotoCompleted.toLocaleString()}/${nationalSummary.totalHotoTarget.toLocaleString()} completed`}
            className="bg-emerald-50 dark:bg-emerald-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <StatusCard
            title="Physical Survey Progress"
            value={
              nationalSummary.totalSurveyTarget > 0
                ? (nationalSummary.totalSurveyCompleted /
                    nationalSummary.totalSurveyTarget) *
                  100
                : 0
            }
            icon={<FileText />}
            description={`${nationalSummary.totalSurveyCompleted.toLocaleString()}/${nationalSummary.totalSurveyTarget.toLocaleString()} completed`}
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <StatusCard
            title="GPS Uptime"
            value={nationalSummary.totalGpsUptime}
            icon={<Wifi />}
            description="Total GPs with >98% uptime"
            className="bg-purple-50 dark:bg-purple-950/20"
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
            title="FTTH Connections"
            value={nationalSummary.totalFtthConnections}
            icon={<Building2 />}
            description="Active FTTH connections nationwide"
            className="bg-indigo-50 dark:bg-indigo-950/20"
          />
          <StatusCard
            title="OFC Length"
            value={nationalSummary.totalOfcLength}
            icon={<Cable />}
            description="Total OFC route length (KMs)"
            valueFormatter={(value) => `${value.toLocaleString()} km`}
          />
          <StatusCard
            title="OFC Existing"
            value={nationalSummary.totalOfcExisting}
            icon={<Cable />}
            description="Existing OFC (KMs)"
            className="bg-green-50 dark:bg-green-950/20"
            valueFormatter={(value) => `${value.toLocaleString()} km`}
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
          State-wise Progress
        </h2>
        <DataTableProvider columns={columns} data={data}>
          <DataTable>
            <DataTableAdvancedToolbar>
              <DataTableFilterList />
              <DataTableSortList />
              <Tabs className="hidden md:block">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="current-week">Current Week</TabsTrigger>
                  <TabsTrigger value="last-week">Last Week</TabsTrigger>
                  <TabsTrigger value="current-month">Current Month</TabsTrigger>
                  <TabsTrigger value="last-month">Last Month</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select>
                <SelectTrigger className="md:hidden">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="current-week">Current Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </DataTableAdvancedToolbar>
          </DataTable>
        </DataTableProvider>
      </div>

      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              State-wise Progress Comparison
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
