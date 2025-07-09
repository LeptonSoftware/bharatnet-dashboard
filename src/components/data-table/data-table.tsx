import { DataTableGrid, DataTableGridProps } from "./data-table-grid"
import { DataTableList } from "./data-table-list"
import { useDataTableContext } from "./data-table-provider"

export function DataTable<TData>({
  children,
  ...props
}: { children: React.ReactNode } & DataTableGridProps<TData>) {
  "use no memo"
  const { view } = useDataTableContext()

  return view === "grid" ? (
    <DataTableGrid {...props}>{children}</DataTableGrid>
  ) : (
    <DataTableList>{children}</DataTableList>
  )
}
