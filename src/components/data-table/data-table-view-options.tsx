"use no memo";

import { Icon } from "@iconify/react/dist/iconify.js";
import type { Table } from "@tanstack/react-table";
import { Check, ChevronsUpDown, Settings2 } from "lucide-react";
import * as React from "react";

import { Button } from "@rio.js/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@rio.js/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rio.js/ui/components/popover";
import { Tabs, TabsList, TabsTrigger } from "@rio.js/ui/components/tabs";
import { cn } from "@rio.js/ui/lib/utils";

import { useDataTableContext } from "./data-table-provider";

interface DataTableViewOptionsProps<TData> {}

export function DataTableViewOptions<
  TData,
>({}: DataTableViewOptionsProps<TData>) {
  "use no memo";
  const { view, setView, table } = useDataTableContext();
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide()
        ),
    [table]
  );

  return (
    <>
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="list">
            <Icon icon="tabler:list" />
          </TabsTrigger>
          <TabsTrigger value="grid">
            <Icon icon="tabler:layout-grid" />
          </TabsTrigger>
          <TabsTrigger value="map">
            <Icon icon="tabler:map" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label="Toggle columns"
            role="combobox"
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 />
            View
            <ChevronsUpDown className="ml-auto opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 p-0">
          <Command>
            <CommandInput placeholder="Search columns..." />
            <CommandList>
              <CommandEmpty>No columns found.</CommandEmpty>
              <CommandGroup>
                {columns.map((column) => (
                  <CommandItem
                    key={column.id}
                    onSelect={() =>
                      column.toggleVisibility(!column.getIsVisible())
                    }
                  >
                    <span className="truncate">
                      {column.columnDef.meta?.label ?? column.id}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        column.getIsVisible() ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
