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
            {trend.period && (
              <span className="text-muted-foreground">in {trend.period}</span>
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
