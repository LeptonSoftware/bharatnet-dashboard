import { cn } from "@rio.js/ui/lib/utils";
import { Card } from "@rio.js/ui/components/card";
import { Table, flexRender } from "@tanstack/react-table";
import {
  Building2,
  Users,
  CheckCircle2,
  ClipboardCheck,
  Signal,
  Network,
  Router,
  MapPin,
  MapPinned,
} from "lucide-react";

interface AestheticCardProps<TData> {
  row: TData;
  index: number;
  table: Table<TData>;
}

export function AestheticCard<TData>({
  row,
  table,
}: AestheticCardProps<TData>) {
  const cells =
    table
      .getRowModel()
      .rows.find((r) => r.original === row)
      ?.getVisibleCells() || [];

  // Helper function to get icon for a field
  const getFieldIcon = (title: string) => {
    const iconProps = { className: "h-4 w-4 text-muted-foreground/70" };
    switch (title.toLowerCase()) {
      case "pia":
        return <Building2 {...iconProps} />;
      case "total gps":
        return <MapPin {...iconProps} />;
      case "hoto":
        return <CheckCircle2 {...iconProps} />;
      case "physical survey":
        return <ClipboardCheck {...iconProps} />;
      case "gps with >98% uptime":
        return <Signal {...iconProps} />;
      case "ftth connections":
        return <Network {...iconProps} />;
      case "ofc (kms)":
        return <Router {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };

  // Helper function to format cell content
  const formatCellContent = (content: string) => {
    // Check if content contains a split of existing and new values
    if (content.includes("existing") && content.includes("new")) {
      const parts = content.split(",").map((part) => part.trim());
      return (
        <div className="flex flex-col space-y-1">
          {parts.map((part, idx) => (
            <span key={idx} className="text-sm text-right">
              {part}
            </span>
          ))}
        </div>
      );
    }
    // Check if content contains a fraction (e.g., "9,386/9,337")
    if (content.includes("/")) {
      const [numerator, denominator] = content.split("/");
      return (
        <div className="flex items-baseline space-x-1 justify-end">
          <span className="text-sm font-medium">{numerator}</span>
          <span className="text-xs text-muted-foreground/70">/</span>
          <span className="text-sm text-muted-foreground">{denominator}</span>
        </div>
      );
    }
    // Default rendering
    return <span className="text-right block">{content}</span>;
  };

  // Helper function to get column title
  const getColumnTitle = (column: any) => {
    if (typeof column.columnDef.header === "function") {
      const headerProps = column.columnDef.header({ column });
      return headerProps?.props?.title || column.id;
    }
    return column.columnDef.header?.toString() || column.id;
  };

  // Get state/UT and icon cells
  const stateCell = cells.find((cell) => {
    const title = getColumnTitle(cell.column);
    return title.toLowerCase() === "state/ut";
  });

  const iconCell = cells.find((cell) => {
    const title = getColumnTitle(cell.column);
    return title.toLowerCase() === "icon";
  });

  // Filter out state/UT and icon from the main cells
  const contentCells = cells.filter((cell) => {
    const title = getColumnTitle(cell.column);
    return !["state/ut", "icon"].includes(title.toLowerCase());
  });

  // Create pairs of cells for the grid layout
  const cellPairs = contentCells.reduce<Array<typeof cells>>(
    (result, cell, index) => {
      if (index % 2 === 0) {
        result.push(contentCells.slice(index, index + 2));
      }
      return result;
    },
    []
  );

  return (
    <Card
      className={cn(
        "overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/80",
        "dark:from-gray-900/50 dark:to-gray-950/30",
        "shadow-md hover:shadow-lg transition-all duration-300",
        "backdrop-blur-sm backdrop-filter",
        "rounded-2xl"
      )}
    >
      {/* Header Section */}
      {stateCell && (
        <div className="p-4 flex items-center space-x-3 bg-gradient-to-r from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
          <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shadow-sm">
            <MapPinned className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {flexRender(
                stateCell.column.columnDef.cell,
                stateCell.getContext()
              )}
            </h3>
            <p className="text-xs text-muted-foreground/70">State/UT Details</p>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-5 space-y-5">
        {cellPairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="grid grid-cols-2 gap-6">
            {pair.map((cell) => {
              const column = cell.column;
              const content = flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              );
              const title = getColumnTitle(column);

              return (
                <div
                  key={column.id}
                  className="group p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors duration-200">
                        {getFieldIcon(title)}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                        {title}
                      </span>
                    </div>
                    <div className="font-medium">
                      {typeof content === "string"
                        ? formatCellContent(content)
                        : content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
