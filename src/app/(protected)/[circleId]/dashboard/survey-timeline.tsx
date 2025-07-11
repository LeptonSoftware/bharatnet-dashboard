import { format, addMonths } from "date-fns";
import {
  CalendarDays,
  Target,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { cn } from "@rio.js/ui/lib/utils";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Milestone {
  id: number;
  name: string;
  targetPercentage: number;
  date: Date;
  monthsFromStart: number;
}

interface SurveyTimelineProps {
  currentProgress: number; // Percentage of completion
  totalGpsInScope: number; // Total GPs to be surveyed
  agreementDate?: Date; // PIA agreement date
  milestoneType?: "feasibility" | "hoto"; // Type of milestones to show
  title?: string; // Custom title for the timeline
}

// Default agreement date if not provided
const DEFAULT_AGREEMENT_DATE = new Date(2025, 4, 1); // May 1, 2025 (month is 0-indexed)

function createMilestones(
  agreementDate: Date,
  type: "feasibility" | "hoto" = "feasibility"
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
    ];
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
  ];
}

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
      return (
        <Icon
          icon="material-symbols:check-circle"
          className="h-6 w-6 text-emerald-600"
        />
      );
    case "overdue":
      return (
        <Icon icon="mingcute:warning-fill" className="h-4 w-6 text-red-500" />
      );
    case "current":
      return (
        <Icon icon="ic:sharp-watch-later" className="h-6 w-6 text-blue-500" />
      );
    default:
      return (
        <Icon icon="ic:sharp-watch-later" className="h-6 w-6 text-gray-400" />
      );
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

// Function to calculate current expected target using linear interpolation
function calculateCurrentTarget(
  milestones: Milestone[],
  currentDate: Date,
  totalGps: number
): {
  expectedPercentage: number;
  expectedGps: number;
} {
  // Find the current milestone period
  const currentMilestone = milestones.find((m) => currentDate <= m.date);

  if (!currentMilestone) {
    // Past all milestones
    const lastMilestone = milestones[milestones.length - 1];
    return {
      expectedPercentage: lastMilestone.targetPercentage,
      expectedGps: Math.round(
        (lastMilestone.targetPercentage / 100) * totalGps
      ),
    };
  }

  const currentIndex = milestones.indexOf(currentMilestone);
  const previousMilestone =
    currentIndex > 0 ? milestones[currentIndex - 1] : null;

  if (!previousMilestone) {
    // Before first milestone
    const daysSinceStart =
      (currentDate.getTime() -
        milestones[0].date.getTime() +
        currentMilestone.monthsFromStart * 30 * 24 * 60 * 60 * 1000) /
      (1000 * 60 * 60 * 24);
    const totalDaysToMilestone = currentMilestone.monthsFromStart * 30;
    const progress = Math.max(
      0,
      Math.min(1, daysSinceStart / totalDaysToMilestone)
    );
    const expectedPercentage = progress * currentMilestone.targetPercentage;

    return {
      expectedPercentage,
      expectedGps: Math.round((expectedPercentage / 100) * totalGps),
    };
  }

  // Between two milestones - linear interpolation
  const totalDuration =
    currentMilestone.date.getTime() - previousMilestone.date.getTime();
  const elapsed = currentDate.getTime() - previousMilestone.date.getTime();
  const progress = Math.max(0, Math.min(1, elapsed / totalDuration));

  const expectedPercentage =
    previousMilestone.targetPercentage +
    (currentMilestone.targetPercentage - previousMilestone.targetPercentage) *
      progress;

  return {
    expectedPercentage,
    expectedGps: Math.round((expectedPercentage / 100) * totalGps),
  };
}

export function SurveyTimeline({
  currentProgress,
  totalGpsInScope,
  agreementDate,
  milestoneType = "feasibility",
  title,
}: SurveyTimelineProps) {
  const currentDate = new Date();
  const startDate = agreementDate || DEFAULT_AGREEMENT_DATE;
  const milestones = createMilestones(startDate, milestoneType);
  const currentTarget = calculateCurrentTarget(
    milestones,
    currentDate,
    totalGpsInScope
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">
          {title || "Survey Timeline & Milestones"}
        </h2>
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          Current Progress:{" "}
          <span className="font-semibold text-blue-600">
            {currentProgress.toFixed(1)}%
          </span>
          <span className="mx-2">|</span>
          Today's Target:{" "}
          <span className="font-semibold text-amber-600">
            {currentTarget.expectedPercentage.toFixed(1)}% (
            {currentTarget.expectedGps} GPs)
          </span>
        </div>
      </div>

      {/* Desktop horizontal timeline */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Horizontal timeline line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-start relative">
            {milestones.map((milestone, index) => {
              const status = getMilestoneStatus(
                milestone,
                currentProgress,
                currentDate
              );
              const targetGps = Math.round(
                (milestone.targetPercentage / 100) * totalGpsInScope
              );

              return (
                <div
                  key={milestone.id}
                  className="flex flex-col items-center text-center max-w-48"
                >
                  {/* Timeline dot */}

                  {/* Content */}
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-center">
                      {getStatusIcon(status)}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {milestone.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Target className="h-3 w-3" />
                      {milestone.targetPercentage}% ({targetGps} GPs)
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

            {/* Today indicator */}
            {(() => {
              const today = currentDate.getTime();

              // Find which milestone period we're in
              let currentMilestoneIndex = -1;
              let previousMilestoneIndex = -1;

              for (let i = 0; i < milestones.length; i++) {
                if (today <= milestones[i].date.getTime()) {
                  currentMilestoneIndex = i;
                  previousMilestoneIndex = i - 1;
                  break;
                }
              }

              // If we're past all milestones, place at the end
              if (currentMilestoneIndex === -1) {
                return (
                  <div
                    className="absolute top-4 w-0.5 h-8 bg-red-500 z-20"
                    style={{
                      left: "100%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600 bg-white dark:bg-gray-900 px-2 py-1 rounded border whitespace-nowrap">
                      Today
                    </div>
                  </div>
                );
              }

              // Calculate position between milestones
              const periodStartDate =
                previousMilestoneIndex >= 0
                  ? milestones[previousMilestoneIndex].date.getTime()
                  : startDate.getTime();
              const periodEndDate =
                milestones[currentMilestoneIndex].date.getTime();
              const progressBetweenMilestones =
                (today - periodStartDate) / (periodEndDate - periodStartDate);

              // Calculate timeline positions (milestones are evenly spaced)
              const startPosition =
                previousMilestoneIndex >= 0
                  ? (previousMilestoneIndex / (milestones.length - 1)) * 100
                  : 0;
              const endPosition =
                (currentMilestoneIndex / (milestones.length - 1)) * 100;

              const position =
                startPosition +
                progressBetweenMilestones * (endPosition - startPosition);

              if (position >= 0 && position <= 100) {
                return (
                  <div
                    className="absolute top-4 w-0.5 h-8 bg-red-500 z-20"
                    style={{
                      left: `${position}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600 bg-white dark:bg-gray-900 px-2 py-1 rounded border whitespace-nowrap">
                      <span className="font-semibold">Today:</span> (
                      {format(currentDate, "MMM d, yyyy")})
                    </div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600 bg-white dark:bg-gray-900 px-2 py-1 rounded border whitespace-nowrap">
                      <span className="font-semibold">Target:</span>{" "}
                      {currentTarget.expectedPercentage.toFixed(1)}% (
                      {currentTarget.expectedGps} GPs) <br />
                      <span className="font-semibold">Progress:</span>{" "}
                      {currentProgress.toFixed(1)}%
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="lg:hidden">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          <div className="space-y-6">
            {milestones.map((milestone, index) => {
              const status = getMilestoneStatus(
                milestone,
                currentProgress,
                currentDate
              );
              const targetGps = Math.round(
                (milestone.targetPercentage / 100) * totalGpsInScope
              );

              return (
                <div
                  key={milestone.id}
                  className="relative flex items-start gap-4"
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6 ml-8">
                    <div className="flex items-center gap-3 mb-2 relative">
                      <span className="absolute -ml-8">
                        {getStatusIcon(status)}
                      </span>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {milestone.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="h-3 w-3" />
                        {milestone.targetPercentage}% ({targetGps} GPs)
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
            {format(startDate, "MMM d, yyyy")} →{" "}
            {format(
              addMonths(startDate, milestoneType === "hoto" ? 6 : 12),
              "MMM d, yyyy"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
