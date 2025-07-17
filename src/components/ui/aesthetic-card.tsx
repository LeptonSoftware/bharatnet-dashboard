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
  ChevronDownIcon,
  LayoutDashboardIcon,
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

interface AestheticCardProps<TData extends NationalRowData> {
  row: TData;
  index: number;
  table: Table<TData>;
}

export function AestheticCard<TData extends NationalRowData>({
  row,
  table,
}: AestheticCardProps<TData>) {
  const cells =
    table
      .getRowModel()
      .rows.find((r) => r.original === row)
      ?.getVisibleCells() || [];

  const { circleRoles } = useNationalDashboard();

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
      className="py-0! group/card is-card"
      // className={cn(
      //   "overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/80",
      //   "dark:from-gray-900/50 dark:to-gray-950/30",
      //   "shadow-md hover:shadow-lg transition-all duration-300",
      //   "backdrop-blur-sm backdrop-filter",
      //   "rounded-2xl"
      // )}
    >
      <div className="flex flex-col bg-muted rounded-t-md py-6 relative">
        <Link
          to={`/${(row as NationalRowData).abbreviation}`}
          className="group"
        >
          <div className="flex items-center justify-center">
            <CircleSVG circleId={(row as NationalRowData).state} size={96} />
          </div>
          <div className="text-2xl font-bold text-center group-hover:underline">
            {(row as NationalRowData).state}
          </div>
        </Link>

        <Sheet>
          <SheetTrigger
            asChild
            className="absolute text-gray-500 top-0 right-2"
          >
            <Button variant="ghost" size="icon">
              <Icon icon="iconamoon:history-duotone" />
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <AestheticCardHistory row={row} />
          </SheetContent>
        </Sheet>
        {circleRoles?.role === "viewer" ? null : (
          <Sheet>
            <SheetTrigger
              asChild
              className="absolute text-gray-500 top-8 right-2"
            >
              <Button variant="ghost" size="icon">
                <Icon icon="mdi:pencil" />
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <AestheticCardEdit row={row} />
            </SheetContent>
          </Sheet>
        )}
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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Input } from "@rio.js/ui/components/input";
import { Label } from "@rio.js/ui/components/label";
import { Calendar } from "@rio.js/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rio.js/ui/components/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@rio.js/ui/components/alert-dialog";
import { ScrollArea } from "@rio.js/ui/components/scroll-area";
import { Badge } from "@rio.js/ui/components/badge";
import { Separator } from "@rio.js/ui/components/separator";
import { useCircleEvents, deleteEvent, EventLogData } from "@/hooks/use-events";
import { formatDistanceToNow, format } from "date-fns";
import {
  Trash2,
  Calendar as CalendarIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { toast } from "@rio.js/ui/components/toast";
import { useNationalDashboard } from "@/hooks/use-national-dashboard";

// API functions for updating dashboard and creating events
async function updateDashboard(
  row: NationalRowData,
  updates: Record<string, any>
) {
  const url = `https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/dashboard/${row.id}`;
  const body = {
    dashboard: { ...row, ...updates },
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to update dashboard: ${response.statusText}`);
  }

  return response.json();
}

async function createEvent(event: {
  circle: string;
  event: string;
  data: number;
  timestamp: string;
}) {
  const url =
    "https://api.sheety.co/632604ca09353483222880568eb0ebe2/bharatnetMonitoringDashboard/events";
  const body = {
    event: event,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to create event: ${response.statusText}`);
  }

  return response.json();
}

function AestheticCardHistory({ row }: { row: NationalRowData }) {
  const queryClient = useQueryClient();
  const { data: events, isLoading, error } = useCircleEvents(row.state);
  const { circleRoles } = useNationalDashboard();

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  const handleDeleteEvent = (eventId: number) => {
    deleteMutation.mutate(eventId);
  };

  const getEventIcon = (eventType: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (eventType.toLowerCase()) {
      case "hotoGPsDone".toLowerCase():
        return (
          <CheckCircle {...iconProps} className="h-4 w-4 text-green-600" />
        );
      case "physicalSurveyGPsDone".toLowerCase():
        return <FileText {...iconProps} className="h-4 w-4 text-blue-600" />;
      case "desktopSurveyDone".toLowerCase():
        return (
          <LayoutDashboard {...iconProps} className="h-4 w-4 text-purple-600" />
        );
      case "gPs >98%Uptime".toLowerCase():
        return <Wifi {...iconProps} className="h-4 w-4 text-emerald-600" />;
      case "activeFtthConnections".toLowerCase():
        return <Network {...iconProps} className="h-4 w-4 text-orange-600" />;
      case "ofcLaidKMs".toLowerCase():
        return <Cable {...iconProps} className="h-4 w-4 text-cyan-600" />;
      default:
        return <Activity {...iconProps} className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventDisplayName = (eventType: string) => {
    const eventMap: Record<string, string> = {
      hotoGPsDone: "HOTO GPs Done",
      physicalSurveyGPsDone: "Physical Survey GPs Done",
      desktopSurveyDone: "Desktop Survey Done",
      "gPs >98%Uptime": "GPs >98% Uptime",
      activeFtthConnections: "Active FTTH Connections",
      noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone:
        "GPs Commissioned in Ring",
      ofcLaidKMs: "OFC Laid (KMs)",
    };
    return eventMap[eventType] || eventType;
  };

  const getTrendDirection = (events: EventLogData[], index: number) => {
    if (index === events.length - 1) return null; // No previous event
    const currentValue = events[index].data;
    const previousValue = events[index + 1].data;

    if (currentValue > previousValue) return "up";
    if (currentValue < previousValue) return "down";
    return "stable";
  };

  const getTrendIcon = (direction: string | null) => {
    const iconProps = { className: "h-3 w-3" };
    switch (direction) {
      case "up":
        return <TrendingUp {...iconProps} className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown {...iconProps} className="h-3 w-3 text-red-500" />;
      case "stable":
        return <Minus {...iconProps} className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive">Failed to load events history</div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-lg font-medium">No Events Yet</h3>
        <p className="text-muted-foreground">
          No events have been recorded for this circle.
        </p>
      </div>
    );
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>
          <div className="flex gap-2 items-start flex-col">
            <div className="flex items-center gap-2">
              <CircleSVG circleId={row.state} className="m-0" size={32} />
              <span>{row.state} Events History</span>
            </div>
            <Badge variant="secondary">{events.length} events</Badge>
          </div>
        </SheetTitle>
      </SheetHeader>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-3 p-4">
          {events.map((event, index) => {
            const trendDirection = getTrendDirection(events, index);
            return (
              <div
                key={event.id}
                className="group relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-background border">
                      {getEventIcon(event.event)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">
                          {getEventDisplayName(event.event)}
                        </h4>
                        {getTrendIcon(trendDirection)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-primary">
                          {event.data.toLocaleString()}
                        </span>
                        {trendDirection && trendDirection !== "stable" && (
                          <Badge
                            variant={
                              trendDirection === "up"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {trendDirection === "up" ? "+" : "-"}
                            {Math.abs(
                              event.data - events[index + 1]?.data || 0
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{format(event.date, "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(event.date, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {circleRoles?.role === "viewer" ? null : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this event? This
                            action cannot be undone.
                            <div className="mt-2 p-3 rounded-lg bg-muted">
                              <div className="font-medium">
                                {getEventDisplayName(event.event)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Value: {event.data} •{" "}
                                {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteEvent(event.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}

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
  onChange,
  type = "text",
  ...props
}: {
  label: string;
  placeholder: string;
  addon?: string;
  value: string;
  icon: React.ElementType;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
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
          type={type}
          onChange={onChange}
          {...props}
        />
      </div>
    </div>
  );
}

const DISPLAY_FIELDS = [
  {
    key: "hotoGPsDone",
    label: "HOTO GPs Done",
    icon: CheckCircle,
    type: "number",
  },
  {
    key: "physicalSurveyGPsDone",
    label: "Physical Survey GPs Done",
    icon: FileText,
    type: "number",
  },
  {
    key: "desktopSurveyDone",
    label: "Desktop Survey Done",
    icon: LayoutDashboard,
    type: "number",
  },
  {
    key: "gPs >98%Uptime",
    label: "GPs >98% Uptime",
    icon: Wifi,
    type: "number",
  },
  {
    key: "activeFtthConnections",
    label: "Active FTTH Connections",
    icon: Building2,
    type: "number",
  },
  {
    key: "noOfGPsCommissionedInRingAndVisibleInCNocOrEmsDone",
    label: "GPs Commissioned in Ring",
    icon: Zap,
    type: "number",
  },
  { key: "ofcLaidKMs", label: "OFC Laid (KMs)", icon: Cable, type: "number" },
  {
    key: "snocStatus",
    label: "SNOC Status",
    icon: LayoutDashboardIcon,
    type: "text",
  },
];

function AestheticCardEdit({ row }: { row: NationalRowData }) {
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Record<string, any> }) => {
      // Update dashboard
      await updateDashboard(row, updates);

      // Create events for each changed field
      const timestamp = format(date, "dd.MM.yy");
      const eventPromises = Object.entries(updates).map(([key, value]) => {
        // Only create events for numeric fields that have changed
        if (key !== "id" && key !== "sNo") {
          return createEvent({
            circle: row.state,
            event: key,
            data: value,
            timestamp: timestamp,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(eventPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["national-data"] });
      queryClient.invalidateQueries({ queryKey: ["national-dashboard"] });
      toast.success("Dashboard updated successfully");
      setSheetOpen(false);
      setEditedValues({});
    },
    onError: (error) => {
      toast.error(`Failed to update dashboard: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (Object.keys(editedValues).length === 0) {
      toast.error("No changes to save");
      return;
    }

    updateMutation.mutate({ updates: editedValues });
  };

  const getValue = (key: string) => {
    return editedValues[key] ?? (row as any)[key] ?? "";
  };

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
        <div className="*:not-first:mt-2">
          <Label htmlFor={"date"}>
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:calendar"
                className="h-4 w-4 text-muted-foreground/70"
              />
              Date
            </div>
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-full justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date) {
                    setDate(date);
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        {DISPLAY_FIELDS.map((field) => (
          <TextInput
            key={field.key}
            label={field.label}
            icon={field.icon}
            placeholder={field.label}
            onChange={(e) => {
              const fieldType = field.type || "number";
              const value =
                fieldType === "text" ? e.target.value : Number(e.target.value);
              setEditedValues({
                ...editedValues,
                [field.key]: value,
              });
            }}
            type={field.type || "number"}
            value={getValue(field.key).toString()}
          />
        ))}
      </div>
      <SheetFooter>
        <Button variant="outline" onClick={() => setSheetOpen(false)}>
          Cancel
        </Button>
        <Button
          className="bg-teal-600"
          disabled={
            Object.keys(editedValues).length === 0 || updateMutation.isPending
          }
          onClick={handleSave}
        >
          {updateMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </SheetFooter>
    </>
  );
}
