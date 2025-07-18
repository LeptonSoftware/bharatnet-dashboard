import { PieChartIcon } from "lucide-react"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@rio.js/ui/components/tabs"

interface ChartData {
  labels: string[]
  data: number[]
}

interface SurveyOverviewChartProps {
  blockDistribution: ChartData
  kmDistribution: ChartData
}

export function SurveyOverviewChart({
  blockDistribution,
  kmDistribution,
}: SurveyOverviewChartProps) {
  // Using the same colors as in district progress
  const STATUS_COLORS = {
    completed: "#10B981", // emerald-500
    ongoing: "#3B82F6", // blue-500
    pending: "#6B7280", // gray-500
  }

  const KM_COLORS = {
    surveyed: "#A855F7", // purple-500
    remaining: "#6B7280", // gray-500
  }

  const blockData = blockDistribution.labels.map((label, index) => ({
    name:
      label === "completed"
        ? "Completed"
        : label === "ongoing"
          ? "In Progress"
          : "Pending",
    value: blockDistribution.data[index] || 0,
    color: STATUS_COLORS[label as keyof typeof STATUS_COLORS],
  }))

  const kmData = kmDistribution.labels.map((label, index) => ({
    name: label === "surveyed" ? "Surveyed" : "Remaining",
    value: kmDistribution.data[index] || 0,
    color: KM_COLORS[label as keyof typeof KM_COLORS],
  }))

  return (
    <Card className="col-span-full lg:col-span-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          <CardTitle>Survey Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kilometers">
          <TabsList className="mb-4">
            <TabsTrigger value="kilometers">Route Length</TabsTrigger>
            <TabsTrigger value="blocks">Block Status</TabsTrigger>
          </TabsList>
          <TabsContent value="kilometers" className="flex-none h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kmData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) =>
                    `${name}: ${value.toFixed(1)} km (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {kmData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="blocks" className="h-[300px] flex-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={blockData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {blockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
