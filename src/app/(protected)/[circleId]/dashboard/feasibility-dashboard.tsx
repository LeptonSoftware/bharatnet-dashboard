import { useEffect, useState } from "react";
import { SurveyData } from "@/types";
import { fetchData } from "@/lib/api";
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
import { SurveyDashboardSkeleton } from "./loading-skeleton";
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

interface FeasibilityDashboardProps {
  circle: string;
}

export function FeasibilityDashboard({ circle }: FeasibilityDashboardProps) {
  const [data, setData] = useState<SurveyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const response = await fetchData(circle, "survey");
        const circleData = response[`${circle}Survey`] as SurveyData[];

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

  if (isLoading) return <SurveyDashboardSkeleton />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!data.length)
    return <div className="text-center p-8">No data available</div>;

  const stats = calculateSurveySummaryStats(data, "feasibility", circle);
  const districts = getSurveyDistrictSummaries(data, "feasibility", circle);
  const statusDistribution = getSurveyStatusDistribution(data, "feasibility");
  const kmDistribution = {
    labels: ["surveyed", "remaining"],
    data: [stats.completedKm || 0, stats.pendingKm || 0],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Feasibility Survey Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="Total Blocks"
            value={stats.total}
            icon={<Map />}
            description="Total number of blocks in the project"
          />
          <StatusCard
            title="Completed"
            value={stats.completed || 0}
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
            value={stats.pending || 0}
            icon={<FileQuestion />}
            description="Blocks pending survey"
            className="bg-amber-50 dark:bg-amber-950/20"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Cable className="h-5 w-5" />
          Survey Coverage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="Total Route Length"
            value={stats.totalPlannedKm}
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
              ((stats.completedKm || 0) / (stats.totalPlannedKm || 1)) * 100
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
          Feasibility Survey Block-wise Details
        </h2>
        <SurveyBlocksTable data={data} type="feasibility" />
      </div>
    </div>
  );
}
