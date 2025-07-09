"use client"

import type { Table } from "@tanstack/react-table"
import type * as React from "react"

import { cn } from "@rio.js/ui/lib/utils"

import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { useDataTableContext } from "./data-table-provider"

interface DataTableAdvancedToolbarProps extends React.ComponentProps<"div"> {}

export function DataTableAdvancedToolbar({
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps) {
  "use no memo"
  const { table } = useDataTableContext()
  console.log("table", table)
  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions />
      </div>
    </div>
  )
}
