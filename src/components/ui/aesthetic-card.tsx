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
  Cable,
  LayoutDashboard,
  FileText,
  CheckCircle,
  Wifi,
  Zap,
} from "lucide-react";
import { CircleSVG } from "../circle-svg";
import { Icon } from "@iconify/react";
import { Button } from "@rio.js/ui/components/button";
import { Link } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@rio.js/ui/components/sheet";
import { NationalRowData } from "@/types";

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
      className="py-0!"
      // className={cn(
      //   "overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/80",
      //   "dark:from-gray-900/50 dark:to-gray-950/30",
      //   "shadow-md hover:shadow-lg transition-all duration-300",
      //   "backdrop-blur-sm backdrop-filter",
      //   "rounded-2xl"
      // )}
    >
      <div className="flex flex-col bg-muted py-6 relative">
        <Link to={`/${row.abbreviation}`} className="group">
          <div className="flex items-center justify-center">
            <CircleSVG circleId={row.state} size={96} />
          </div>
          <div className="text-2xl font-bold text-center group-hover:underline">
            {row.state}
          </div>
        </Link>

        <Sheet>
          <SheetTrigger asChild className="absolute top-0 right-2">
            <Button variant="ghost" size="icon">
              <Icon icon="mdi:pencil" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <AestheticCardEdit row={row} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Content Section */}
      <div className="p-2 space-y-2">
        {cellPairs.map((pair, pairIndex) => (
          <div key={pairIndex} className="grid grid-cols-1 gap-0">
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
                  className="group p-1 px-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors duration-200 border-b border-gray-200 dark:border-gray-700"
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
                    <div className="font-medium [&>*]:items-end [&>*]:text-right [&>*]:text-sm!">
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

import { useId, useState } from "react";

import { Input } from "@rio.js/ui/components/input";
import { Label } from "@rio.js/ui/components/label";

function InputWithAddon({
  label,
  placeholder,
  addon,
}: {
  label: string;
  placeholder: string;
  addon?: string;
}) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex rounded-md shadow-xs">
        <Input
          id={id}
          className="-me-px rounded-e-none shadow-none"
          placeholder={placeholder}
          type="text"
        />
        <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-e-md border px-3 text-sm">
          {addon}
        </span>
      </div>
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  addon,
  value,
  icon: Icon,
  ...props
}: {
  label: string;
  placeholder: string;
  addon?: string;
  value: string;
  icon: React.ElementType;
}) {
  const id = useId();
  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground/70" />
          {label}
        </div>
      </Label>
      <div className="flex rounded-md shadow-xs">
        <Input
          id={id}
          value={value}
          className="-me-px shadow-none"
          placeholder={placeholder}
          type="text"
          {...props}
        />
      </div>
    </div>
  );
}

const DISPLAY_FIELDS = [
  { key: "hotoGPsDone", label: "HOTO GPs Done", icon: CheckCircle },
  {
    key: "physicalSurveyGPsDone",
    label: "Physical Survey GPs Done",
    icon: FileText,
  },
  {
    key: "desktopSurveyDone",
    label: "Desktop Survey Done",
    icon: LayoutDashboard,
  },
  { key: "gPs >98%Uptime", label: "GPs >98% Uptime", icon: Wifi },
  {
    key: "activeFtthConnections",
    label: "Active FTTH Connections",
    icon: Building2,
  },
  {
    key: "noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone",
    label: "GPs Commissioned in Ring",
    icon: Zap,
  },
  { key: "ofcLaidKMs", label: "OFC Laid (KMs)", icon: Cable },
];

function AestheticCardEdit({ row }: { row: NationalRowData }) {
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  return (
    <>
      <SheetHeader>
        <SheetTitle>
          <div className="flex items-center gap-2 justify-start">
            <CircleSVG circleId={row.state} className="m-0" size={32} />
            <span>{row.state}</span>
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6 flex flex-col px-4">
        {DISPLAY_FIELDS.map((field) => (
          <TextInput
            key={field.key}
            label={field.label}
            icon={field.icon}
            placeholder={field.label}
            onChange={(e) => {
              setEditedValues({
                ...editedValues,
                [field.key]: e.target.value,
              });
            }}
            type="number"
            value={editedValues[field.key] ?? row[field.key]}
          />
        ))}
      </div>
      <SheetFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          className="bg-teal-600"
          disabled={Object.keys(editedValues).length === 0}
        >
          Save
        </Button>
      </SheetFooter>
    </>
  );
}
