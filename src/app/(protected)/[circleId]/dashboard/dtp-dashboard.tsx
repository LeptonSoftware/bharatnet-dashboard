import { useEffect, useState } from "react";
import { BlockData } from "@/types";
import { fetchData } from "@/lib/api";
import {
  calculateSummaryStats,
  getDistrictSummaries,
  getApprovalTimeData,
  getDtpStatusDistribution,
  calculateProjectProgress,
} from "@/lib/data-utils";
import { StatusCard } from "./status-card";
import { OverviewChart } from "./overview-chart";
import { DistrictProgress } from "./district-progress";
import { BlocksTable } from "./blocks-table";
import { DtpDashboardSkeleton } from "./loading-skeleton";
import {
  CheckCircle,
  FileText,
  FileQuestion,
  Map,
  LayoutDashboard,
  Building2,
  Table,
} from "lucide-react";

interface DtpDashboardProps {
  circle: string;
}

export function DtpDashboard({ circle }: DtpDashboardProps) {
  const [data, setData] = useState<BlockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const response = await fetchData(circle, "dtp");
        const circleData = response[`${circle}Dtp`] as BlockData[];
        // Filter out any null or undefined entries before setting the state
        const validData = (circleData || []).filter(
          (item): item is BlockData => item != null
        );
        setData(validData);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [circle]);

  if (isLoading) return <DtpDashboardSkeleton />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!data.length)
    return <div className="text-center p-8">No data available</div>;

  const stats = calculateSummaryStats(data);
  const districts = getDistrictSummaries(data);
  const progress = calculateProjectProgress(data);
  const approvalTimeData = getApprovalTimeData(data);
  const statusDistribution = getDtpStatusDistribution(data);

  // Calculate total submitted (including approved) with default values
  const totalSubmitted = (stats.submitted || 0) + (stats.approved || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5" />
          Desktop Planning Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatusCard
            title="Total Blocks"
            value={stats.total}
            icon={<Map />}
            description="Total number of blocks in the project"
          />
          <StatusCard
            title="Submitted"
            value={totalSubmitted}
            icon={<FileText />}
            description={`${stats.approved || 0} approved, ${stats.submitted || 0} pending approval`}
            className="bg-blue-50 dark:bg-blue-950/20"
            trend={
              stats.weeklySubmitted
                ? {
                    value: stats.weeklySubmitted,
                    direction: "up",
                    period: "last week",
                  }
                : undefined
            }
          />
          <StatusCard
            title="Approved"
            value={stats.approved || 0}
            icon={<CheckCircle />}
            description="Blocks with approved Desktop Planning"
            className="bg-emerald-50 dark:bg-emerald-950/20"
            trend={
              stats.weeklyApproved
                ? {
                    value: stats.weeklyApproved,
                    direction: "up",
                    period: "last week",
                  }
                : undefined
            }
          />
          <StatusCard
            title="On Hold"
            value={stats.onHold || 0}
            icon={<FileQuestion />}
            description="Blocks currently on hold"
            className="bg-amber-50 dark:bg-amber-950/20"
            trend={
              stats.weeklyOnHold
                ? {
                    value: stats.weeklyOnHold,
                    direction: "up",
                    period: "last week",
                  }
                : undefined
            }
          />
        </div>
      </div>

      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-12">
        <OverviewChart
          approvalTimeData={approvalTimeData}
          statusDistribution={statusDistribution}
        />
        <DistrictProgress districts={districts} data={data} />
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Table className="h-5 w-5" />
          Desktop Planning Block-wise Details
        </h2>
        <BlocksTable data={data} />
      </div>
    </div>
  );
}
