import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";
import { cn } from "@rio.js/ui/lib/utils";

interface StatusCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    period?: string;
    currentTotal?: number;
    previousTotal?: number;
    currentDailyRate?: number;
    previousDailyRate?: number;
  };
  valueFormatter?: (value: number) => string;
}

export function StatusCard({
  title,
  value,
  description,
  icon,
  className,
  trend,
  valueFormatter = (value) => value.toLocaleString(),
}: StatusCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {trend && (
          <div className="space-y-2">
            <div
              className={cn(
                "text-[0.9em] font-medium flex items-center gap-1 text-xl sm:text-2xl",
                trend.direction === "up" && "text-emerald-500",
                trend.direction === "down" && "text-red-500",
                trend.direction === "neutral" && "text-gray-500"
              )}
            >
              {trend.direction === "up" && (
                <Icon icon="iconamoon:trend-up-bold" />
              )}
              {trend.direction === "down" && (
                <Icon icon="iconamoon:trend-down-bold" />
              )}
              {trend.direction === "neutral" && (
                <Icon icon="material-symbols:trending-flat-rounded" />
              )}
              {trend.value > 0 ? "+" : trend.value < 0 ? "" : ""}
              {trend.value}
              {trend.period && trend.period.includes("(%)") ? "%" : ""}
              {trend.period && (
                <span className="text-muted-foreground">
                  in {trend.period.replace(" (%)", "")}
                </span>
              )}
            </div>

            {trend.currentTotal !== undefined &&
              trend.previousTotal !== undefined && (
                <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-1">
                  <div className="flex justify-between">
                    <span>Current total:</span>
                    <span className="font-mono">
                      {trend.currentTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous total:</span>
                    <span className="font-mono">
                      {trend.previousTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

            {trend.currentDailyRate !== undefined &&
              trend.previousDailyRate !== undefined && (
                <div className="text-xs text-muted-foreground border-b pb-1 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Current daily rate:</span>
                    <span className="font-mono">
                      {trend.currentDailyRate.toFixed(1)}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous daily rate:</span>
                    <span className="font-mono">
                      {trend.previousDailyRate.toFixed(1)}/day
                    </span>
                  </div>
                </div>
              )}
          </div>
        )}
        <div className="flex items-baseline gap-2">
          <div
            className={cn(
              "text-xl sm:text-2xl font-bold truncate",
              trend && "text-muted-foreground sm:text-base text-base"
            )}
          >
            {typeof value === "number" ? valueFormatter(value) : value}
          </div>
        </div>

        {description && (
          <p className="text-base text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
