import { ProjectProgress } from "@/types"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card"
import { Progress } from "@rio.js/ui/components/progress"

interface ProgressBarProps {
  progress: ProjectProgress
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <Card className="col-span-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle>Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">{progress.approvedBlocks}</span>
              <span className="text-muted-foreground"> of </span>
              <span className="font-medium">{progress.totalBlocks}</span>
              <span className="text-muted-foreground"> blocks approved</span>
            </div>
            <div className="font-medium">
              {progress.completionPercentage.toFixed(1)}%
            </div>
          </div>
          <Progress value={progress.completionPercentage} className="h-2" />
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">
                {Math.round(progress.approvalRate)} blocks/month
              </span>{" "}
              approval rate
            </div>
            <div>
              Est. completion:{" "}
              <span className="font-medium text-foreground">
                {progress.estimatedCompletionDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
