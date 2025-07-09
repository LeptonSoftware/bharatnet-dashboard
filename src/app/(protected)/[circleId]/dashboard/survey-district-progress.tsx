import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";
import { Input } from "@rio.js/ui/components/input";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Cable,
  Router,
  Building2,
  Map as MapIcon,
} from "lucide-react";
import { SurveyDistrictSummary, SurveyData } from "@/types";
import { BlockMap } from "./block-map";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@rio.js/ui/components/sheet";

interface SurveyDistrictProgressProps {
  districts: SurveyDistrictSummary[];
  data: SurveyData[];
}

export function SurveyDistrictProgress({
  districts,
  data,
}: SurveyDistrictProgressProps) {
  const [search, setSearch] = useState("");

  const filteredDistricts = districts.filter((district) =>
    district.name.toLowerCase().includes(search.toLowerCase())
  );

  const displayDistricts = search ? filteredDistricts : districts.slice(0, 5);

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
                ((district.completed + district.ongoing) / district.total) * 100
              );
              const kmProgress = Math.round(
                (district.completedKm / district.totalKm) * 100
              );

              const districtBlocks = data.filter(
                (block) =>
                  block.district.toLowerCase() === district.name.toLowerCase()
              );

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
                        {district.completed} of {district.total} blocks
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Blocks Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <BarChart3 className="h-4 w-4" />
                            <span>Blocks Progress</span>
                          </div>
                          <span className="font-medium">{blockProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full flex w-full gap-1 h-2">
                            <div
                              className="bg-emerald-500"
                              style={{
                                width: `${(district.completed / district.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-blue-500"
                              style={{
                                width: `${(district.ongoing / district.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 text-xs">
                          <div className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Completed: {district.completed}</span>
                          </div>
                          <div className="text-center text-blue-500 flex items-center gap-1 justify-center">
                            <Clock className="h-3.5 w-3.5" />
                            <span>In Progress: {district.ongoing}</span>
                          </div>
                          <div className="text-right text-gray-500 flex items-center gap-1 justify-end">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>Pending: {district.pending}</span>
                          </div>
                        </div>
                      </div>

                      {/* Route Length Progress */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Cable className="h-4 w-4" />
                            <span>Route Length Progress</span>
                          </div>
                          <span className="font-medium">{kmProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-purple-500"
                            style={{ width: `${kmProgress}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 text-xs">
                          <div className="text-purple-500 flex items-center gap-1">
                            <Cable className="h-3.5 w-3.5" />
                            <span>
                              Surveyed: {district.completedKm.toFixed(1)} km
                            </span>
                          </div>
                          <div className="text-right text-gray-500 flex items-center gap-1 justify-end">
                            <Router className="h-3.5 w-3.5" />
                            <span>
                              Remaining:{" "}
                              {(
                                district.totalKm - district.completedKm
                              ).toFixed(1)}{" "}
                              km
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
              );
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
  );
}
