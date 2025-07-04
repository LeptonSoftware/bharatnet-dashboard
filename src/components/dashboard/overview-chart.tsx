import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface ChartData {
  labels: string[];
  data: number[];
}

interface OverviewChartProps {
  approvalTimeData: ChartData;
  statusDistribution: ChartData;
}

export function OverviewChart({
  approvalTimeData,
  statusDistribution,
}: OverviewChartProps) {
  // Using the same colors as in district progress
  const STATUS_COLORS = {
    approved: "#10B981",     // emerald-500
    'pending approval': "#3B82F6", // blue-500
    'on hold': "#EF4444",    // red-500
    pending: "#6B7280"       // gray-500
  };

  const monthlyData = approvalTimeData.labels.map((label, index) => ({
    month: label,
    count: approvalTimeData.data[index] || 0,
  }));

  const statusData = statusDistribution.labels.map((label, index) => ({
    name: label.charAt(0).toUpperCase() + label.slice(1),
    value: statusDistribution.data[index] || 0,
    color: STATUS_COLORS[label as keyof typeof STATUS_COLORS]
  }));

  return (
    <Card className="col-span-full xl:col-span-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          <CardTitle>Project Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Status Distribution</TabsTrigger>
            <TabsTrigger value="approvals">Approvals Over Time</TabsTrigger>
          </TabsList>
          <TabsContent value="status" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
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
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="approvals" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  name="Approvals"
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}