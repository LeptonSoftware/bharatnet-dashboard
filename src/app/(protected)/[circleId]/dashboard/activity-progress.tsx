import { ProjectProgress } from "@/types"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card"

interface ActivityProgressProps {
  progress: ProjectProgress
}

export function ActivityProgress({ progress }: ActivityProgressProps) {
  return (
    <Card className="col-span-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle>Desktop Planning Progress</CardTitle>
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
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
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
