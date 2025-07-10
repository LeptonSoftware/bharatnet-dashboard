import { useEffect, useState } from "react";
import { fetchNationalData } from "@/lib/api";
import { NationalRowData } from "@/types";
import { StatusCard } from "./status-card";
import {
  Map,
  FileText,
  Cable,
  Zap,
  Wifi,
  Building2,
  CheckCircle,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { NationalDashboardSkeleton } from "./loading-skeleton";
import { useEvents } from "@/hooks/use-events";
import {
  TimePeriod,
  calculateComparativeTrend,
  calculateTrend,
  getPeriodBoundaries,
} from "@/lib/trends";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@rio.js/ui/components/select";
import { Switch } from "@rio.js/ui/components/switch";
import { Tabs, TabsList, TabsTrigger } from "@rio.js/ui/components/tabs";
import { Label } from "@rio.js/ui/components/label";
import { CircleSVG } from "@/components/circle-svg";
import { getCircleName } from "@/lib/utils";

interface OverviewDashboardProps {
  circle: string;
}

export function OverviewDashboard({ circle }: OverviewDashboardProps) {
  const [data, setData] = useState<NationalRowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events data for trend calculations
  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useEvents();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>("");
  const [compareMode, setCompareMode] = useState(false);
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const nationalData = await fetchNationalData();

        // Find the specific circle data
        const circleData = nationalData.find(
          (row) =>
            row.abbreviation.toLowerCase() === circle.toLowerCase() ||
            row.state.toLowerCase() === circle.toLowerCase()
        );

        if (circleData) {
          setData(circleData);
        } else {
          setError(`No data found for circle: ${circle}`);
        }
      } catch (err) {
        setError("Failed to load overview data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [circle]);
  // Helper function to get trend for a specific metric
  const getTrend = (eventType: string) => {
    if (!eventsData || eventsData.length === 0 || !timePeriod || !data) {
      return {
        direction: "stable" as const,
        hasData: false,
        changePercentage: 0,
        changeValue: 0,
        previousValue: 0,
        currentValue: 0,
      };
    }

    // Use comparative trends when compare mode is enabled
    if (compareMode && ["current-week", "current-month"].includes(timePeriod)) {
      return calculateComparativeTrend(
        eventsData,
        eventType,
        data.state,
        timePeriod
      );
    }

    // Use regular trends for non-compare mode
    const boundaries = getPeriodBoundaries(timePeriod);
    if (!boundaries) {
      return {
        direction: "stable" as const,
        hasData: false,
        changePercentage: 0,
        changeValue: 0,
        previousValue: 0,
        currentValue: 0,
      };
    }

    const { startDate, endDate } = boundaries;
    return calculateTrend(
      eventsData,
      eventType,
      data.state,
      startDate,
      endDate
    );
  };

  if (isLoading) return <NationalDashboardSkeleton />;
  if (error)
    return <div className="text-destructive text-center p-8">{error}</div>;
  if (!data) return <div className="text-center p-8">No data available</div>;

  // Helper function to safely convert values to numbers
  const toNumber = (value: string | number): number => {
    if (typeof value === "number") return value;
    if (!value || value === "") return 0;
    const cleaned = value.toString().replace(/[^\d.-]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Get trends for relevant metrics
  const hotoTrend = getTrend("hotoGPsDone");
  const surveyTrend = getTrend("physicalSurveyGPsDone");
  const desktopSurveyTrend = getTrend("desktopSurveyDone");
  const uptimeTrend = getTrend("gPs >98%Uptime");
  const ftthTrend = getTrend("activeFtthConnections");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <CircleSVG circleId={circle} size={96} />
          <h1 className="text-6xl font-bold">{getCircleName(circle)}</h1>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Tabs
            value={timePeriod || ""}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            className="hidden md:block"
          >
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="current-week">Current Week</TabsTrigger>
              {compareMode ? null : (
                <TabsTrigger value="last-week">Last Week</TabsTrigger>
              )}
              <TabsTrigger value="current-month">Current Month</TabsTrigger>
              {compareMode ? null : (
                <TabsTrigger value="last-month">Last Month</TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          <Select
            value={timePeriod || ""}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          >
            <SelectTrigger className="md:hidden">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="current-week">Current Week</SelectItem>
              <SelectItem value="last-week">Last Week</SelectItem>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={() => {
                setCompareMode(!compareMode);
                if (!compareMode) {
                  if (timePeriod === "last-week") {
                    setTimePeriod("current-week");
                  }
                  if (timePeriod === "last-month") {
                    setTimePeriod("current-month");
                  }
                }
              }}
              disabled={
                !timePeriod ||
                !["current-week", "current-month"].includes(timePeriod)
              }
            />
            <Label htmlFor="compare-mode" className="text-sm">
              Compare
            </Label>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Project Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mb-8">
          <StatusCard
            title="PIA Status"
            value={data.pia}
            icon={<Building2 />}
            description="Project Implementation Agency"
            className="bg-blue-50 dark:bg-blue-950/20"
          />
          <StatusCard
            title="SNOC Status"
            value={data.snocStatus}
            icon={<CheckCircle />}
            description={`Target: ${data.snocTargetDate}`}
            className="bg-amber-50 dark:bg-amber-950/20"
          />
          <StatusCard
            title="Total GPs in Scope"
            value={data.gPsTotal}
            icon={<Map />}
            description="Total Gram Panchayats to be covered"
            className="bg-slate-50 dark:bg-slate-950/20"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Survey Progress
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mb-8">
          <StatusCard
            title="Desktop Survey Progress"
            value={
              toNumber(data.desktopSurveyTarget) > 0
                ? (data.desktopSurveyDone /
                    toNumber(data.desktopSurveyTarget)) *
                  100
                : 0
            }
            icon={<Icon icon="mdi:desktop-mac" className="h-4 w-4" />}
            description={`${data.desktopSurveyDone.toLocaleString()}/${toNumber(data.desktopSurveyTarget).toLocaleString()} completed`}
            className="bg-indigo-50 dark:bg-indigo-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              desktopSurveyTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(desktopSurveyTrend.changePercentage)
                        : Math.round(desktopSurveyTrend.changeValue),
                    direction:
                      desktopSurveyTrend.direction === "up"
                        ? "up"
                        : desktopSurveyTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                    ...(compareMode &&
                      ["current-week", "current-month"].includes(timePeriod) &&
                      "currentTotal" in desktopSurveyTrend && {
                        currentTotal: desktopSurveyTrend.currentTotal,
                        previousTotal: desktopSurveyTrend.previousTotal,
                        currentDailyRate: desktopSurveyTrend.currentDailyRate,
                        previousDailyRate: desktopSurveyTrend.previousDailyRate,
                      }),
                  }
                : undefined
            }
          />
          <StatusCard
            title="Physical Survey Progress"
            value={
              data.physicalSurveyGPsTodo > 0
                ? (data.physicalSurveyGPsDone / data.physicalSurveyGPsTodo) *
                  100
                : 0
            }
            icon={<FileText />}
            description={`${data.physicalSurveyGPsDone.toLocaleString()}/${data.physicalSurveyGPsTodo.toLocaleString()} completed`}
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              surveyTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(surveyTrend.changePercentage)
                        : Math.round(surveyTrend.changeValue),
                    direction:
                      surveyTrend.direction === "up"
                        ? "up"
                        : surveyTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                    ...(compareMode &&
                      ["current-week", "current-month"].includes(timePeriod) &&
                      "currentTotal" in surveyTrend && {
                        currentTotal: surveyTrend.currentTotal,
                        previousTotal: surveyTrend.previousTotal,
                        currentDailyRate: surveyTrend.currentDailyRate,
                        previousDailyRate: surveyTrend.previousDailyRate,
                      }),
                  }
                : undefined
            }
          />
          <StatusCard
            title="HOTO Progress"
            value={
              data.hotoGPsTodo > 0
                ? (data.hotoGPsDone / data.hotoGPsTodo) * 100
                : 0
            }
            icon={<Icon icon="lineicons:handshake" className="h-4 w-4" />}
            description={`${data.hotoGPsDone.toLocaleString()}/${data.hotoGPsTodo.toLocaleString()} completed`}
            className="bg-emerald-50 dark:bg-emerald-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              hotoTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(hotoTrend.changePercentage)
                        : Math.round(hotoTrend.changeValue),
                    direction:
                      hotoTrend.direction === "up"
                        ? "up"
                        : hotoTrend.direction === "down"
                          ? "down"
                          : "neutral",
                    period:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? `vs prev ${timePeriod.includes("week") ? "week" : "month"} (%)`
                        : timePeriod.replace("-", " "),
                    ...(compareMode &&
                      ["current-week", "current-month"].includes(timePeriod) &&
                      "currentTotal" in hotoTrend && {
                        currentTotal: hotoTrend.currentTotal,
                        previousTotal: hotoTrend.previousTotal,
                        currentDailyRate: hotoTrend.currentDailyRate,
                        previousDailyRate: hotoTrend.previousDailyRate,
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
          Infrastructure Status
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mb-8">
          <StatusCard
            title="OFC Total Length"
            value={data.ofcTotalKMs}
            icon={<Cable />}
            description="Total OFC route length (KMs)"
            className="bg-orange-50 dark:bg-orange-950/20"
            valueFormatter={(value) => `${value.toLocaleString()} km`}
          />

          <StatusCard
            title="FTTH Connections"
            value={data.activeFtthConnections}
            icon={<Building2 />}
            description="Active FTTH connections"
            className="bg-indigo-50 dark:bg-indigo-950/20"
            trend={
              ftthTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(ftthTrend.changePercentage)
                        : Math.round(ftthTrend.changeValue),
                    direction:
                      ftthTrend.direction === "up"
                        ? "up"
                        : ftthTrend.direction === "down"
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
            value={
              data.gPsTotal > 0
                ? (data["gPs >98%Uptime"] / data.gPsTotal) * 100
                : 0
            }
            icon={<Wifi />}
            description={`${data["gPs >98%Uptime"].toLocaleString()}/${data.gPsTotal.toLocaleString()} GPs`}
            className="bg-purple-50 dark:bg-purple-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
            trend={
              uptimeTrend.hasData && timePeriod
                ? {
                    value:
                      compareMode &&
                      ["current-week", "current-month"].includes(timePeriod)
                        ? Math.round(uptimeTrend.changePercentage)
                        : Math.round(uptimeTrend.changeValue),
                    direction:
                      uptimeTrend.direction === "up"
                        ? "up"
                        : uptimeTrend.direction === "down"
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
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Commissioning Status
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatusCard
            title="GPS Commissioned Target"
            value={data.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone}
            icon={<Zap />}
            description="Target GPs to be commissioned"
            className="bg-yellow-50 dark:bg-yellow-950/20"
          />
          <StatusCard
            title="GPS Commissioned Done"
            value={toNumber(
              data.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone
            )}
            icon={<CheckCircle />}
            description="GPs already commissioned"
            className="bg-green-50 dark:bg-green-950/20"
          />
          <StatusCard
            title="Commissioning Progress"
            value={
              data.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone > 0
                ? (toNumber(
                    data.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone
                  ) /
                    data.noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone) *
                  100
                : 0
            }
            icon={<Zap />}
            description="Overall commissioning progress"
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Cable className="h-5 w-5" />
          OFC Breakdown
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatusCard
            title="Existing OFC"
            value={data.ofcExistingKMs}
            icon={<Cable />}
            description="Existing OFC infrastructure"
            className="bg-gray-50 dark:bg-gray-950/20"
            valueFormatter={(value) => `${value.toLocaleString()} km`}
          />
          <StatusCard
            title="New OFC"
            value={data.ofcNewKms}
            icon={<Cable />}
            description="New OFC to be laid"
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => `${value.toLocaleString()} km`}
          />
          <StatusCard
            title="New OFC Progress"
            value={
              data.ofcNewKms > 0
                ? ((data.ofcLaidKMs - data.ofcExistingKMs) / data.ofcNewKms) *
                  100
                : 0
            }
            icon={<CheckCircle />}
            description="New OFC laying progress"
            className="bg-green-50 dark:bg-green-950/20"
            valueFormatter={(value) => `${Math.max(0, value).toFixed(1)}%`}
          />
        </div>
      </div>
    </div>
  );
}
