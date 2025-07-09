import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";
import { cn } from "@rio.js/ui/lib/utils";

interface StatusCardProps {
  title: string;
  value: number;
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
        <div className="flex items-baseline gap-2">
          <div className="text-xl sm:text-2xl font-bold truncate">
            {valueFormatter(value)}
          </div>
          {/* Trend section preserved for later use
          {trend && (
            <div className={cn(
              "text-[0.9em] font-medium flex items-center gap-1",
              trend.direction === "up" && "text-emerald-500",
              trend.direction === "down" && "text-red-500"
            )}>
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}
              {trend.period && (
                <span className="text-muted-foreground">vs {trend.period}</span>
              )}
            </div>
          )}
          */}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
