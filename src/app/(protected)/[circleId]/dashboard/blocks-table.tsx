import { BlockData } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { Map as MapIcon, Search } from "lucide-react"
import { useState } from "react"

import { Badge } from "@rio.js/ui/components/badge"
import { Card, CardContent, CardHeader } from "@rio.js/ui/components/card"
import { Input } from "@rio.js/ui/components/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@rio.js/ui/components/sheet"

import { BlockMap } from "./block-map"

interface BlocksTableProps {
  data: BlockData[]
}

export function BlocksTable({ data }: BlocksTableProps) {
  const [filterValue, setFilterValue] = useState("")

  const columns: ColumnDef<BlockData>[] = [
    {
      accessorKey: "nameOfDistrict",
      header: "District",
      cell: ({ row }) => (
        <div className="min-w-[140px]">{row.getValue("nameOfDistrict")}</div>
      ),
    },
    {
      accessorKey: "nameOfBlock",
      header: "Block",
      cell: ({ row }) => (
        <div className="min-w-[140px] flex items-center gap-2">
          <span>{row.getValue("nameOfBlock")}</span>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-1 hover:bg-muted bg-transparent group rounded-md">
                <MapIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-screen sm:max-w-2xl p-0">
              <SheetHeader className="p-6 pb-0">
                <SheetTitle>Block Location</SheetTitle>
                <SheetDescription>
                  {row.original.nameOfBlock}, {row.original.nameOfDistrict}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <BlockMap blocks={[row.original]} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ),
    },
    {
      accessorKey: "noOfGp",
      header: "GPs",
      cell: ({ row }) => {
        return <div className="text-right">{row.getValue("noOfGp")}</div>
      },
    },
    {
      accessorKey: "dtpStatus",
      header: "Desktop Planning Status",
      cell: ({ row }) => {
        const status = row.getValue("dtpStatus") as string

        if (!status) return <Badge variant="outline">Pending</Badge>

        if (status.toLowerCase().includes("approved")) {
          return <Badge className="bg-emerald-500">Approved</Badge>
        }

        if (status.toLowerCase().includes("submitted")) {
          return <Badge className="bg-blue-500">Submitted</Badge>
        }

        if (status.toLowerCase().includes("hold")) {
          return <Badge variant="destructive">Hold</Badge>
        }

        return <Badge variant="outline">{status}</Badge>
      },
    },
    {
      accessorKey: "existingOfc",
      header: "Existing (km)",
      cell: ({ row }) => {
        const value = row.getValue("existingOfc") as number
        return (
          <div className="text-right">{Number(value)?.toFixed(1) || "0.0"}</div>
        )
      },
    },
    {
      accessorKey: "proposedOfc",
      header: "Planned (km)",
      cell: ({ row }) => {
        const value = row.getValue("proposedOfc") as number
        return (
          <div className="text-right">{Number(value)?.toFixed(1) || "0.0"}</div>
        )
      },
    },
  ]

  const filteredData = data.filter((item) => {
    const searchTerm = filterValue.toLowerCase()
    const district = (item.nameOfDistrict || "").toLowerCase()
    const block = (item.nameOfBlock || "").toLowerCase()
    return district.includes(searchTerm) || block.includes(searchTerm)
  })

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter blocks..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <div className="overflow-y-auto pretty-scroll max-h-[600px]">
            <table className="w-full min-w-[800px] caption-bottom text-sm">
              <thead className="sticky top-0 bg-muted border-b [&_tr]:border-b-0">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                    >
                      {typeof column.header === "function"
                        ? column.header({})
                        : column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-4 align-middle">
                        {column.cell?.({
                          row: {
                            getValue: () =>
                              row[column.accessorKey as keyof BlockData],
                            original: row,
                          },
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
