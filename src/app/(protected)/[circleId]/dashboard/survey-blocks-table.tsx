import { useState } from "react";
import { SurveyData } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";
import { Badge } from "@rio.js/ui/components/badge";
import { Search } from "lucide-react";
import { Input } from "@rio.js/ui/components/input";

interface SurveyBlocksTableProps {
  data: SurveyData[];
  type: "feasibility" | "hoto";
}

export function SurveyBlocksTable({ data, type }: SurveyBlocksTableProps) {
  const [filterValue, setFilterValue] = useState("");

  const columns: ColumnDef<SurveyData>[] = [
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }) => (
        <div className="min-w-[140px]">{row.getValue("district")}</div>
      ),
    },
    {
      accessorKey: "block",
      header: "Block",
      cell: ({ row }) => (
        <div className="min-w-[140px]">{row.getValue("block")}</div>
      ),
    },
    {
      accessorKey: "totalGp",
      header: "GPs",
      cell: ({ row }) => {
        return <div className="text-right">{row.getValue("totalGp")}</div>;
      },
    },
    {
      accessorKey:
        type === "feasibility" ? "feasibilityStatus" : "hotoSurveyStatus",
      header: "Survey Status",
      cell: ({ row }) => {
        const status = row.getValue(
          type === "feasibility" ? "feasibilityStatus" : "hotoSurveyStatus"
        ) as string;

        if (!status) return <Badge variant="outline">Not Started</Badge>;

        if (status.toLowerCase().includes("done")) {
          return <Badge className="bg-emerald-500">Completed</Badge>;
        }

        if (
          status.toLowerCase().includes("wip") ||
          status.toLowerCase().includes("progress")
        ) {
          return <Badge className="bg-blue-500">In Progress</Badge>;
        }

        return <Badge variant="outline">{status}</Badge>;
      },
    },
    {
      accessorKey:
        type === "feasibility" ? "feasibilityOfcDone" : "hotoOfcDone",
      header: "Completed (km)",
      cell: ({ row }) => {
        const value =
          (row.getValue(
            type === "feasibility" ? "feasibilityOfcDone" : "hotoOfcDone"
          ) as number) ?? 0;
        return (
          <div className="text-right">{Number(value)?.toFixed(1) || "0.0"}</div>
        );
      },
    },
    {
      accessorKey:
        type === "feasibility" ? "feasibilityOfcPending" : "hotoOfcPending",
      header: "Pending (km)",
      cell: ({ row }) => {
        const value = row.getValue(
          type === "feasibility" ? "feasibilityOfcPending" : "hotoOfcPending"
        ) as number;
        return (
          <div className="text-right">{Number(value)?.toFixed(1) || "0.0"}</div>
        );
      },
    },
  ];

  const filteredData = data.filter((item) => {
    const searchTerm = filterValue.toLowerCase();
    const district = (item.district || "").toLowerCase();
    const block = (item.block || "").toLowerCase();
    return district.includes(searchTerm) || block.includes(searchTerm);
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter blocks..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <div className="overflow-y-auto pretty-scroll max-h-[600px]">
            <table className="w-full min-w-[800px] caption-bottom text-sm">
              <thead className="sticky top-0 bg-muted border-b [&_tr]:border-b-0">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {typeof column.header === "function"
                        ? column.header({})
                        : column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-4 align-middle">
                        {column.cell?.({
                          row: {
                            getValue: () =>
                              row[column.accessorKey as keyof SurveyData],
                          },
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
