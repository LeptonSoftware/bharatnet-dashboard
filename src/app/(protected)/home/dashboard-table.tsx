import { Suspense, useEffect, useState } from "react";
import { fetchNationalData, fetchUserCircleRoles } from "@/lib/api";
import { NationalRowData } from "@/types";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { CircleSVG } from "@/components/circle-svg";
import { circleMap } from "@/lib/utils";
import { Link } from "react-router";
import { cn } from "@rio.js/ui/lib/utils";
import { DataTableProvider } from "@/components/data-table/data-table-provider";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Skeleton } from "@rio.js/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rio.js/ui/components/select";
import { Table } from "lucide-react";
import { AestheticCard } from "@/components/ui/aesthetic-card";
import { useNationalDashboard } from "@/hooks/use-national-dashboard";

function TableSkeleton() {
  return (
    <div className="space-y-4 flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-[200px]" />
          </div>
          <Skeleton className="h-9 w-[100px]" />
        </div>
        <div className="border rounded-lg">
          <div className="border-b bg-muted/50 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardTable() {
  // Use the national dashboard hook
  const { data, circleRoles, isLoading, error } = useNationalDashboard();

  if (isLoading) return <TableSkeleton />;
  if (error)
    return (
      <div className="text-destructive text-center p-8">
        {error.message || "Failed to load national data"}
      </div>
    );
  if (!data.length)
    return <div className="text-center p-8">No data available</div>;

  // Define columns for the states table
  const columns: ColumnDef<NationalRowData>[] = [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => (
        <div className="w-12 flex justify-center">
          <Suspense>
            <CircleSVG circleId={row.original.state} />
          </Suspense>
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State/UT" />
      ),
      cell: ({ row }) => {
        if (
          Object.keys(circleMap).includes(
            row.original.abbreviation.toLowerCase()
          )
        ) {
          return (
            <Link
              className="font-medium text-blue-500 hover:underline text-wrap min-w-[200px]"
              to={`/${row.original.abbreviation}`}
            >
              {row.getValue("state")}
            </Link>
          );
        }
        return (
          <div className="font-medium text-wrap min-w-[200px]">
            {row.getValue("state")}
          </div>
        );
      },
    },
    {
      accessorKey: "pia",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="PIA"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => {
        const pia = row.original.pia;
        const isNotPia =
          pia.toLowerCase().includes("tender") ||
          pia.toLowerCase().includes("bids");
        return (
          <div
            className={cn(
              "font-medium text-center",
              isNotPia && "text-destructive"
            )}
          >
            {pia}
          </div>
        );
      },
    },
    {
      accessorKey: "agreementSigningDate",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Agreement Signing Date"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("agreementSigningDate") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "gPsTotal",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total GPs"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => {
        const total = row.original.gPsTotal;
        const newGPs = row.original.gPsNew;
        const existing = row.original.gPsExisting;

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-medium tabular-nums">
              {total.toLocaleString()}
            </div>
            <div className="text-xs">
              <span className="text-blue-600">
                {existing.toLocaleString()} existing
              </span>
              <span className="text-muted-foreground">, </span>
              <span className="text-emerald-600">
                {newGPs.toLocaleString()} new
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "ofcTotalKMs",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="OFC (KMs)"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => {
        const total = row.original.ofcTotalKMs;
        const existing = row.original.ofcExistingKMs;
        const newKms = row.original.ofcNewKms;

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-medium tabular-nums">
              {total.toLocaleString()}
            </div>
            <div className="text-xs">
              <span className="text-blue-600">
                {existing.toLocaleString()} existing
              </span>
              <span className="text-muted-foreground">, </span>
              <span className="text-emerald-600">
                {newKms.toLocaleString()} new
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "financialProgress",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Financial Progress"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => {
        const value = row.getValue("financialProgress");
        if (!value) return <div className="text-center">N/A</div>;

        // Ensure value is string and handle the split
        const parts = String(value).split("\n");
        const amount = parts[0] || "N/A";
        const date = parts[1] || "";

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="font-medium">₹ {amount}</div>
            {date && (
              <div className="text-xs text-muted-foreground">{date}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "snocStatus",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="SNOC Status"
          className="mx-auto"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center text-wrap min-w-[200px]">
          {row.getValue("snocStatus") || "N/A"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 flex flex-col ">
      <DataTableProvider
        columns={columns as any}
        data={data.map((item) => ({ ...item, id: item.id.toString() }))}
        defaultView="grid"
        skeletonRow={{
          id: "skeleton",
          sNo: 0,
          state: "",
          abbreviation: "",
          pia: "",
          agreementSigningDate: "",
          gPsTotal: 0,
          gPsNew: 0,
          gPsExisting: 0,
          hotoGPsTodo: 0,
          hotoGPsDone: 0,
          hotoKMsDone: 0,
          hotoKMsTodo: 0,
          physicalSurveyGPsTodo: 0,
          physicalSurveyGPsDone: 0,
          physicalSurveyKMsTodo: 0,
          physicalSurveyKMsDone: 0,
          desktopSurveyTarget: 0,
          desktopSurveyDone: 0,
          snocTargetDate: "",
          snocStatus: "",
          "gPs >98%Uptime": 0,
          activeFtthConnections: 0,
          noOfGPsCommissionedInRingAndVisibleInCNocOrEmsMilestone: 0,
          noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone: 0,
          ofcTotalKMs: 0,
          ofcExistingKMs: 0,
          ofcNewKms: 0,
          ofcLaidKMs: 0,
        }}
      >
        <DataTable cardComponent={AestheticCard}>
          <DataTableAdvancedToolbar>
            <DataTableFilterList />
            <DataTableSortList />
          </DataTableAdvancedToolbar>
        </DataTable>
      </DataTableProvider>
    </div>
  );
}
