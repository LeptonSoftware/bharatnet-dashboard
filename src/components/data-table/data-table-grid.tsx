import { Table, flexRender } from "@tanstack/react-table";
import type * as React from "react";

import { cn } from "@rio.js/ui/lib/utils";

import { DataTablePagination } from "./data-table-pagination";
import { useDataTableContext } from "./data-table-provider";

export interface DataTableGridProps<TData> extends React.ComponentProps<"div"> {
  /**
   * Component or render function to display each row as a card
   */
  cardComponent?: React.ComponentType<{
    row: TData;
    index: number;
    table: Table<TData>;
  }>;
  /**
   * Render function for custom card layout
   */
  renderCard?: (row: TData, index: number) => React.ReactNode;
  /**
   * CSS class for the grid container
   */
  gridClassName?: string;
  /**
   * CSS class for individual cards
   */
  cardClassName?: string;
  /**
   * Number of columns for different breakpoints
   */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  /**
   * Gap between cards
   */
  gap?: "sm" | "md" | "lg" | "xl";
  /**
   * Content to display when no data is available
   */
  emptyState?: React.ReactNode;
}

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

function getGridColsClass(columns?: DataTableGridProps<any>["columns"]) {
  const classes = ["grid"];

  if (columns?.sm) classes.push(`grid-cols-${columns.sm}`);
  else classes.push("grid-cols-1");

  if (columns?.md) classes.push(`sm:grid-cols-${columns.md}`);
  else classes.push("sm:grid-cols-2");

  if (columns?.lg) classes.push(`md:grid-cols-${columns.lg}`);
  else classes.push("md:grid-cols-3");

  if (columns?.xl) classes.push(`lg:grid-cols-${columns.xl}`);
  else classes.push("lg:grid-cols-4");

  if (columns?.["2xl"]) classes.push(`xl:grid-cols-${columns["2xl"]}`);

  return classes.join(" ");
}

function DefaultCard<TData>({
  row,
  table,
  index,
  cardClassName,
}: {
  row: any;
  index: number;
  table: Table<TData>;
  cardClassName?: string;
}) {
  "use no memo";
  const visibleColumns = table.getVisibleLeafColumns();

  // Filter out the select and actions columns and handle them separately
  const selectColumn = visibleColumns.find((column) => column.id === "select");
  const actionsColumn = visibleColumns.find(
    (column) => column.id === "actions"
  );
  const dataColumns = visibleColumns.filter(
    (column) => column.id !== "select" && column.id !== "actions"
  );

  // Get the select and actions cells if they exist
  const selectCell = selectColumn
    ? row.getVisibleCells().find((cell: any) => cell.column.id === "select")
    : null;

  const actionsCell = actionsColumn
    ? row.getVisibleCells().find((cell: any) => cell.column.id === "actions")
    : null;

  return (
    <div
      className={cn(
        "rounded-md border p-4 shadow-sm transition-shadow hover:shadow-md relative",
        cardClassName
      )}
    >
      {/* Select checkbox in top right corner */}
      {selectCell && (
        <div className="absolute top-3 right-3">
          {flexRender(
            selectCell.column.columnDef.cell,
            selectCell.getContext()
          )}
        </div>
      )}

      {/* Actions dropdown in bottom right corner */}
      {actionsCell && (
        <div className="absolute bottom-3 right-3">
          {flexRender(
            actionsCell.column.columnDef.cell,
            actionsCell.getContext()
          )}
        </div>
      )}

      <div className="space-y-3">
        {dataColumns.map((column) => {
          const cell = row
            .getVisibleCells()
            .find((cell: any) => cell.column.id === column.id);
          if (!cell) return null;

          // Get the column header
          const header =
            typeof column.columnDef.header === "function"
              ? column.columnDef.header(
                  table
                    .getHeaderGroups()[0]
                    .headers.find((h) => h.column.id === column.id)
                    ?.getContext() || ({} as any)
                )
              : column.columnDef.header;

          // Skip if header is null/undefined
          if (!header) return null;

          return (
            <div key={column.id} className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {typeof header === "string" ? header : column.id}
              </span>
              <div className="text-sm">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DataTableGrid<TData>({
  cardComponent: CardComponent,
  renderCard,
  gridClassName,
  cardClassName,
  columns,
  gap = "md",
  emptyState,
  children,
  className,
  ...props
}: DataTableGridProps<TData>) {
  "use no memo";
  const { table } = useDataTableContext<TData>();

  const rows = table.getRowModel().rows;

  // Default empty state
  const defaultEmptyState = (
    <div className="flex h-32 w-full items-center justify-center rounded-md border border-dashed">
      <p className="text-sm text-muted-foreground">No results found.</p>
    </div>
  );

  // Default card component that uses column definitions

  return (
    <div className={cn("flex w-full flex-col gap-2.5", className)} {...props}>
      {children}

      {rows?.length ? (
        <div
          className={cn(
            getGridColsClass(columns),
            gapClasses[gap],
            "w-full",
            gridClassName
          )}
        >
          {rows.map((row, index) => {
            // If renderCard is provided, use it
            if (renderCard) {
              return (
                <div key={row.id} className={cardClassName}>
                  {renderCard(row.original as TData, index)}
                </div>
              );
            }

            // If CardComponent is provided, use it
            if (CardComponent) {
              return (
                <CardComponent
                  key={row.id}
                  row={row.original as TData}
                  index={index}
                  table={table}
                />
              );
            }

            // Use default card component
            return (
              <DefaultCard
                key={row.id}
                row={row}
                index={index}
                table={table}
                cardClassName={cardClassName}
              />
            );
          })}
        </div>
      ) : (
        emptyState || defaultEmptyState
      )}

      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {/* {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar} */}
      </div>
    </div>
  );
}
