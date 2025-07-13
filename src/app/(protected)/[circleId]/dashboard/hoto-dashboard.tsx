import { useEffect, useState } from "react";
import { SurveyData, NationalRowData } from "@/types";
import { fetchData } from "@/lib/api";
import { getCircleName } from "@/lib/utils";
import {
  calculateSurveySummaryStats,
  getSurveyDistrictSummaries,
  getSurveyProgressData,
  getSurveyStatusDistribution,
} from "@/lib/survey-utils";
import { StatusCard } from "./status-card";
import { SurveyOverviewChart } from "./survey-overview-chart";
import { SurveyDistrictProgress } from "./survey-district-progress";
import { SurveyBlocksTable } from "./survey-blocks-table";
import { SurveyProgress } from "./survey-progress";
import { SurveyDashboardSkeleton } from "./loading-skeleton";
import { SurveyTimeline } from "./survey-timeline";
import { useNationalDashboard } from "@/hooks/use-national-dashboard";
import {
  CheckCircle,
  Clock,
  FileQuestion,
  Map,
  Cable,
  Router,
  LayoutDashboard,
  Building2,
  Table,
} from "lucide-react";

interface HotoDashboardProps {
  circle: string;
}

const parseDate = (date: string) => {
  const [day, month, year] = date.split(".");
  return new Date(Number(year), Number(month) - 1, Number(day));
};

export function HotoDashboard({ circle }: HotoDashboardProps) {
  const [data, setData] = useState<SurveyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the national dashboard hook
  const {
    data: nationalData,
    isLoading: nationalLoading,
    error: nationalError,
  } = useNationalDashboard();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Only fetch survey data
        const surveyResponse = await fetchData(circle, "survey");
        const circleData = surveyResponse[`${circle}Survey`] as SurveyData[];
        setData(
          circleData?.filter(
            (item) => Boolean(item.sNo) && item.block != "B-1"
          ) || []
        );
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [circle]);

  // Show loading if either survey data or national data is loading
  if (isLoading || nationalLoading) return <SurveyDashboardSkeleton />;

  // Show error if either failed
  if (error) return <div className="text-destructive">{error}</div>;
  if (nationalError)
    return (
      <div className="text-destructive">
        {nationalError.message || "Failed to load national data"}
      </div>
    );

  if (!data.length)
    return <div className="text-center p-8">No data available</div>;

  const stats = calculateSurveySummaryStats(data, "hoto");
  const districts = getSurveyDistrictSummaries(data, "hoto");
  const statusDistribution = getSurveyStatusDistribution(data, "hoto");
  const kmDistribution = {
    labels: ["surveyed", "remaining"],
    data: [stats.completedKm || 0, stats.pendingKm || 0],
  };

  // Calculate current progress percentage for timeline using HOTO GP data from national dashboard
  const getHotoGpProgress = () => {
    const circleName = getCircleName(circle);
    const circleNationalData = nationalData.find(
      (item) => item.state === circleName || item.abbreviation === circle
    );

    if (circleNationalData && circleNationalData.hotoGPsTodo > 0) {
      return (
        (circleNationalData.hotoGPsDone / circleNationalData.hotoGPsTodo) * 100
      );
    }

    // Fallback to KM-based calculation if GP data is not available
    return ((stats.completedKm || 0) / (stats.totalExistingKm || 1)) * 100;
  };

  const currentProgress = getHotoGpProgress();

  // Get circle national data for timeline
  const getCircleNationalData = () => {
    const circleName = getCircleName(circle);
    return nationalData.find(
      (item) => item.state === circleName || item.abbreviation === circle
    );
  };

  const circleNationalData = getCircleNationalData();

  return (
    <div className="space-y-6">
      <SurveyTimeline
        currentProgress={currentProgress}
        totalGpsInScope={circleNationalData?.hotoGPsTodo || 0}
        agreementDate={
          circleNationalData?.agreementSigningDate
            ? parseDate(circleNationalData.agreementSigningDate)
            : undefined
        }
        milestoneType="hoto"
        title="HOTO Timeline & Milestones"
      />
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          HOTO Survey Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="Total Blocks"
            value={circleNationalData?.blocks}
            icon={<Map />}
            description="Total number of blocks in the project"
          />
          <StatusCard
            title="Completed"
            value={circleNationalData?.hotoBlocksDone ?? (stats.completed || 0)}
            icon={<CheckCircle />}
            description="Blocks with completed survey"
            className="bg-emerald-50 dark:bg-emerald-950/20"
          />
          <StatusCard
            title="In Progress"
            value={stats.ongoing || 0}
            icon={<Clock />}
            description="Blocks with ongoing survey"
            className="bg-blue-50 dark:bg-blue-950/20"
          />
          <StatusCard
            title="Pending"
            value={
              circleNationalData?.hotoBlocksPending ?? (stats.pending || 0)
            }
            icon={<FileQuestion />}
            description="Blocks pending survey"
            className="bg-amber-50 dark:bg-amber-950/20"
          />
        </div>
      </div>

      {/* GP Progress Section */}
      {(() => {
        if (circleNationalData) {
          return (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                GP HOTO Progress (Timeline Basis)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <StatusCard
                  title="Total GPs for HOTO"
                  value={circleNationalData.hotoGPsTodo}
                  icon={<Map />}
                  description="Total Gram Panchayats for handover"
                />
                <StatusCard
                  title="GPs Handed Over"
                  value={circleNationalData.hotoGPsDone}
                  icon={<CheckCircle />}
                  description="Gram Panchayats with completed handover"
                  className="bg-emerald-50 dark:bg-emerald-950/20"
                />
                <StatusCard
                  title="GPs Remaining"
                  value={
                    circleNationalData.hotoGPsTodo -
                    circleNationalData.hotoGPsDone
                  }
                  icon={<Clock />}
                  description="Gram Panchayats pending handover"
                  className="bg-blue-50 dark:bg-blue-950/20"
                />
                <StatusCard
                  title="HOTO Progress"
                  value={currentProgress}
                  icon={<FileQuestion />}
                  description="GP handover completion percentage"
                  className="bg-purple-50 dark:bg-purple-950/20"
                  valueFormatter={(value) => `${value.toFixed(1)}%`}
                />
              </div>
            </div>
          );
        }
        return null;
      })()}

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Cable className="h-5 w-5" />
          Survey Coverage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="Total Route Length"
            value={stats.totalExistingKm}
            icon={<Map />}
            description="Total route length to survey (km)"
            valueFormatter={(value) => value.toFixed(1)}
          />
          <StatusCard
            title="Completed"
            value={stats.completedKm || 0}
            icon={<Cable />}
            description="Route length surveyed (km)"
            className="bg-emerald-50 dark:bg-emerald-950/20"
            valueFormatter={(value) => value.toFixed(1)}
          />
          <StatusCard
            title="Pending"
            value={stats.pendingKm || 0}
            icon={<Router />}
            description="Remaining route length (km)"
            className="bg-blue-50 dark:bg-blue-950/20"
            valueFormatter={(value) => value.toFixed(1)}
          />
          <StatusCard
            title="Progress"
            value={
              ((stats.completedKm || 0) / (stats.totalExistingKm || 1)) * 100
            }
            icon={<FileQuestion />}
            description="Survey completion percentage"
            className="bg-purple-50 dark:bg-purple-950/20"
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        </div>
      </div>

      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-12">
        <SurveyOverviewChart
          blockDistribution={statusDistribution}
          kmDistribution={kmDistribution}
        />
        <SurveyDistrictProgress districts={districts} data={data} />
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Table className="h-5 w-5" />
          HOTO Survey Block-wise Details
        </h2>
        <SurveyBlocksTable data={data} type="hoto" />
      </div>
    </div>
  );
}
