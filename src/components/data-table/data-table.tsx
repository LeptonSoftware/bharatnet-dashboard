import { DataTableGrid, DataTableGridProps } from "./data-table-grid";
import { DataTableList } from "./data-table-list";
import { useDataTableContext } from "./data-table-provider";
import { NationalMap } from "@/components/data-table/national-map";
import { NationalRowData } from "@/types";

export function DataTable<TData>({
  children,
  ...props
}: { children: React.ReactNode } & DataTableGridProps<TData>) {
  "use no memo";
  const { view, table } = useDataTableContext();

  if (view === "map") {
    return (
      <div className="space-y-4">
        {children}
        <NationalMap
          data={
            table
              .getFilteredRowModel()
              .rows.map((row) => row.original) as NationalRowData[]
          }
        />
      </div>
    );
  }

  return view === "grid" ? (
    <DataTableGrid {...props}>{children}</DataTableGrid>
  ) : (
    <DataTableList>{children}</DataTableList>
  );
}
