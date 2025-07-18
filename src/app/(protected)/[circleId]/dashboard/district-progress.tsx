import { BlockData, DistrictSummary } from "@/types"
import {
  AlertCircle,
  BarChart3,
  Building2,
  Cable,
  CheckCircle,
  Clock,
  FileText,
  HardHat,
  Map as MapIcon,
  Search,
} from "lucide-react"
import { useState } from "react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card"
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

interface DistrictProgressProps {
  districts: DistrictSummary[]
  data: BlockData[]
}

export function DistrictProgress({ districts, data }: DistrictProgressProps) {
  const [search, setSearch] = useState("")

  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(search.toLowerCase()),
  )

  const displayDistricts = search ? filteredDistricts : districts.slice(0, 5)

  return (
    <Card className="col-span-full lg:col-span-6">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>District Progress</CardTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search districts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {displayDistricts.length > 0 ? (
            displayDistricts.map((district, index) => {
              const blockProgress = Math.round(
                ((district.approved + district.submitted) / district.total) *
                  100,
              )
              const totalKm = district.existingKm + district.plannedKm
              const existingPercent = (district.existingKm / totalKm) * 100
              const plannedPercent = (district.plannedKm / totalKm) * 100

              const districtBlocks = data.filter(
                (block) =>
                  block.nameOfDistrict.toLowerCase() ===
                  district.name.toLowerCase(),
              )

              return (
                <div key={district.name}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold">
                          {district.name}
                        </div>
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="p-1 hover:bg-muted bg-transparent group rounded-md">
                              <MapIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                            </button>
                          </SheetTrigger>
                          <SheetContent className="w-screen sm:max-w-2xl p-0">
                            <SheetHeader className="p-6 pb-0">
                              <SheetTitle>District Blocks</SheetTitle>
                              <SheetDescription>
                                All blocks in {district.name}
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                              <BlockMap blocks={districtBlocks} />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {district.approved} of {district.total} blocks
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Blocks Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Planning Status</span>
                          </div>
                          <span className="font-medium">
                            {blockProgress}% processed
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full flex w-full gap-1 h-2">
                            <div
                              className="bg-emerald-500"
                              style={{
                                width: `${(district.approved / district.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-blue-500"
                              style={{
                                width: `${(district.submitted / district.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-red-500"
                              style={{
                                width: `${(district.onHold / district.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 text-xs">
                          <div className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Approved: {district.approved}</span>
                          </div>
                          <div className="text-blue-500 flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Submitted: {district.submitted}</span>
                          </div>
                          <div className="text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>On Hold: {district.onHold}</span>
                          </div>
                          <div className="text-right text-gray-500 flex items-center gap-1 justify-end">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Pending: {district.pending}</span>
                          </div>
                        </div>
                      </div>

                      {/* Network Size */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            <span>Network Size</span>
                          </div>
                          <span className="font-medium">
                            {totalKm.toFixed(1)} km total
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full flex w-full gap-1 h-2">
                            <div
                              className="bg-purple-500"
                              style={{ width: `${existingPercent}%` }}
                            />
                            <div
                              className="bg-indigo-400"
                              style={{ width: `${plannedPercent}%` }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 text-xs">
                          <div className="text-purple-500 flex items-center gap-1">
                            <Cable className="h-3.5 w-3.5" />
                            <span>
                              Existing: {district.existingKm.toFixed(1)} km
                            </span>
                          </div>
                          <div className="text-right text-indigo-500 flex items-center gap-1 justify-end">
                            <HardHat className="h-3.5 w-3.5" />
                            <span>
                              Planned: {district.plannedKm.toFixed(1)} km
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < displayDistricts.length - 1 && (
                    <div className="mt-8 border-t border-border" />
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No districts found
            </div>
          )}
          {!search && districts.length > 5 && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              Showing top 5 districts
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
