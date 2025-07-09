import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";

interface SurveyProgressProps {
  title: string;
  completedKm: number;
  totalKm: number;
}

export function SurveyProgress({
  title,
  completedKm,
  totalKm,
}: SurveyProgressProps) {
  // Calculate progress percentage
  const completionPercentage = (completedKm / (totalKm || 1)) * 100;

  // Calculate completion rate (km per day)
  const startDate = new Date("2025-04-01");
  const now = new Date();
  const daysSinceStart = Math.max(
    1,
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dailyCompletionRate = completedKm / daysSinceStart;

  // Calculate estimated completion date
  const remainingKm = totalKm - completedKm;
  const daysToComplete = remainingKm / (dailyCompletionRate || 1);
  const estimatedCompletionDate = new Date();
  estimatedCompletionDate.setDate(
    estimatedCompletionDate.getDate() + daysToComplete
  );

  return (
    <Card className="col-span-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">{completedKm.toFixed(1)}</span>
              <span className="text-muted-foreground"> of </span>
              <span className="font-medium">{totalKm.toFixed(1)}</span>
              <span className="text-muted-foreground"> km surveyed</span>
            </div>
            <div className="font-medium">
              {completionPercentage.toFixed(1)}%
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">
                {dailyCompletionRate.toFixed(1)} km/day
              </span>{" "}
              survey rate
            </div>
            <div>
              Est. completion:{" "}
              <span className="font-medium text-foreground">
                {estimatedCompletionDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
