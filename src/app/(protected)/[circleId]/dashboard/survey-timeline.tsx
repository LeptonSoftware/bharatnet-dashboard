import { format, addMonths } from "date-fns";
import {
  CalendarDays,
  Target,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { cn } from "@rio.js/ui/lib/utils";

interface Milestone {
  id: number;
  name: string;
  targetPercentage: number;
  date: Date;
  monthsFromStart: number;
}

interface SurveyTimelineProps {
  currentProgress: number; // Percentage of completion
}

const T0_DATE = new Date(2025, 4, 1); // May 1, 2025 (month is 0-indexed)

const MILESTONES: Milestone[] = [
  {
    id: 1,
    name: "Milestone I",
    targetPercentage: 5,
    date: addMonths(T0_DATE, 3),
    monthsFromStart: 3,
  },
  {
    id: 2,
    name: "Milestone II",
    targetPercentage: 15,
    date: addMonths(T0_DATE, 6),
    monthsFromStart: 6,
  },
  {
    id: 3,
    name: "Milestone III",
    targetPercentage: 40,
    date: addMonths(T0_DATE, 9),
    monthsFromStart: 9,
  },
  {
    id: 4,
    name: "Milestone IV",
    targetPercentage: 95,
    date: addMonths(T0_DATE, 12),
    monthsFromStart: 12,
  },
];

function getMilestoneStatus(
  milestone: Milestone,
  currentProgress: number,
  currentDate: Date
) {
  const isPast = currentDate > milestone.date;
  const isAchieved = currentProgress >= milestone.targetPercentage;

  if (isAchieved) return "completed";
  if (isPast && !isAchieved) return "overdue";
  if (
    currentDate <= milestone.date &&
    currentProgress < milestone.targetPercentage
  )
    return "upcoming";
  return "current";
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "overdue":
      return <Circle className="h-4 w-4 text-red-500" />;
    case "current":
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500";
    case "overdue":
      return "bg-red-500";
    case "current":
      return "bg-blue-500";
    default:
      return "bg-gray-300";
  }
}

export function SurveyTimeline({ currentProgress }: SurveyTimelineProps) {
  const currentDate = new Date();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Survey Timeline & Milestones</h2>
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Current Progress:{" "}
          <span className="font-semibold text-blue-600">
            {currentProgress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Desktop horizontal timeline */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Horizontal timeline line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-start">
            {MILESTONES.map((milestone, index) => {
              const status = getMilestoneStatus(
                milestone,
                currentProgress,
                currentDate
              );

              return (
                <div
                  key={milestone.id}
                  className="flex flex-col items-center text-center max-w-48"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 mb-4",
                      getStatusColor(status)
                    )}
                  ></div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      {getStatusIcon(status)}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {milestone.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Target className="h-3 w-3" />
                      {milestone.targetPercentage}% target
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {format(milestone.date, "MMM d, yyyy")}
                    </div>

                    {/* Progress bar for this milestone */}
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-auto">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          status === "completed"
                            ? "bg-emerald-500"
                            : status === "overdue"
                              ? "bg-red-500"
                              : status === "current"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                        )}
                        style={{
                          width: `${Math.min(100, (currentProgress / milestone.targetPercentage) * 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {status === "completed" && "✓ Achieved"}
                      {status === "overdue" && "⚠ Behind"}
                      {status === "current" && "🎯 Current"}
                      {status === "upcoming" && "📅 Upcoming"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="lg:hidden">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="space-y-6">
            {MILESTONES.map((milestone, index) => {
              const status = getMilestoneStatus(
                milestone,
                currentProgress,
                currentDate
              );

              return (
                <div
                  key={milestone.id}
                  className="relative flex items-start gap-4"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900",
                      getStatusColor(status)
                    )}
                  ></div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(status)}
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {milestone.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="h-3 w-3" />
                        {milestone.targetPercentage}% target
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Target Date:{" "}
                      <span className="font-medium">
                        {format(milestone.date, "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Progress bar for this milestone */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          status === "completed"
                            ? "bg-emerald-500"
                            : status === "overdue"
                              ? "bg-red-500"
                              : status === "current"
                                ? "bg-blue-500"
                                : "bg-gray-300"
                        )}
                        style={{
                          width: `${Math.min(100, (currentProgress / milestone.targetPercentage) * 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {status === "completed" && "✓ Target achieved"}
                      {status === "overdue" && "⚠ Behind schedule"}
                      {status === "current" && "🎯 Current target"}
                      {status === "upcoming" && "📅 Upcoming milestone"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overall progress summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Overall Timeline Progress
          </span>
          <span className="font-semibold">
            {format(T0_DATE, "MMM d, yyyy")} →{" "}
            {format(addMonths(T0_DATE, 12), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
