import { UseDataTableProps, useDataTable } from "@/hooks/use-data-table";
import { ColumnDef, Table } from "@tanstack/react-table";
import { createContext, useContext, useMemo, useState } from "react";

export const DataTableContext = createContext<{
  table: Table<any>;
  shallow: boolean;
  debounceMs: number;
  throttleMs: number;
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
} | null>(null);

export function useDataTableContext<TData>() {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error(
      "useDataTableContext must be used within a DataTableProvider"
    );
  }
  return context as {
    table: Table<TData>;
    shallow: boolean;
    debounceMs: number;
    throttleMs: number;
    view: "grid" | "list";
    setView: (view: string) => void;
  };
}

export function DataTableProvider<TData extends { id: string }>({
  children,
  data,
  columns,
  isLoading,
  skeletonRow,
}: {
  children: React.ReactNode;
} & {
  data: TData[] | undefined;
  columns: ColumnDef<TData, any>[];
  isLoading?: boolean;
  skeletonRow: TData;
}) {
  "use no memo";
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        ...skeletonRow,
        id: `skeleton-${i}`,
      })),
    []
  );

  const [view, setView] = useState<"grid" | "list">("list");

  const table = useDataTable({
    data: isLoading ? skeletonRows : (data as TData[]),
    columns,
    pageCount: 1,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 20,
      },
    },
    getRowId: (row) => row.id,
  });

  return (
    <DataTableContext.Provider value={{ ...table, view, setView }}>
      {children}
    </DataTableContext.Provider>
  );
}
