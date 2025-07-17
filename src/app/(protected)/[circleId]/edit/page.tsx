import { useQuery } from "@tanstack/react-query";
import { fetchNationalData, fetchUserCircleRoles } from "@/lib/api";
import { Button } from "@rio.js/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@rio.js/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rio.js/ui/components/select";
import { Input } from "@rio.js/ui/components/input";
import {
  Pencil,
  CheckCircle,
  FileText,
  Cable,
  Wifi,
  Building2,
  Zap,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@rio.js/ui/lib/utils";
import { PageHeader } from "@/components/page-header";
import { CircleSVG } from "@/components/circle-svg";
import { getCircleName } from "@/lib/utils";
import { useParams } from "react-router";

// Add CircleRole type
interface CircleRole {
  id: number;
  created_at: string;
  user_id: string;
  circles: Array<{ circle: string }>;
  role: string;
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

export default function FormPage() {
  const { circleId } = useParams();
  const [selectedCircle, setSelectedCircle] = useState<string>(circleId!);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});

  const { data: circleRoles, isLoading: isLoadingCircles } = useQuery({
    queryKey: ["userCircleRoles"],
    queryFn: () => fetchUserCircleRoles(),
  });

  const { data: nationalData, isLoading: isLoadingNational } = useQuery({
    queryKey: ["nationalData", selectedCircle],
    queryFn: () => fetchNationalData(),
  });

  // Select first circle by default when data loads
  useEffect(() => {
    if (circleRoles?.circles?.[0]?.circle && !selectedCircle) {
      setSelectedCircle(circleRoles.circles[0].circle);
    }
  }, [circleRoles, selectedCircle]);

  const selectedCircleData = nationalData?.find(
    (row) => row.abbreviation === selectedCircle
  );

  if (isLoadingCircles || isLoadingNational) {
    return <div className="p-8">Loading...</div>;
  }

  const formatValue = (value: any): string => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value?.toString() || "N/A";
  };

  const handleValueChange = (key: string, value: string) => {
    const numericValue = value.replace(/,/g, "");
    setEditedValues((prev) => ({
      ...prev,
      [key]: numericValue,
    }));
  };

  const hasChanges = Object.keys(editedValues).length > 0;

  const handleUpdate = () => {
    // This would be where you handle the update
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/logo.png" className="w-4 h-4" />,
          },
          {
            title: getCircleName(circleId!),
            icon: <CircleSVG circleId={circleId!} size={16} />,
          },
        ]}
      />
      <div className="flex-1 space-y-8 p-8 pt-6 overflow-y-auto">
        <div className="flex flex-row gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Circle Data Form
            </h2>
            <p className="text-muted-foreground">
              View and edit circle-specific data
            </p>
          </div>

          <div className="flex items-center justify-end flex-1">
            <div className="flex items-center gap-2 justify-end">
              <label className="text-md font-medium text-muted-foreground">
                Circle:
              </label>
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose circle" />
                </SelectTrigger>
                <SelectContent>
                  {circleRoles?.circles?.map(
                    (circleObj: { circle: string }) => (
                      <SelectItem
                        key={circleObj.circle}
                        value={circleObj.circle}
                      >
                        {circleObj.circle}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {/* Data Display Card */}
          {selectedCircleData && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Suspense fallback={null}>
                      <CircleSVG
                        circleId={selectedCircleData.state}
                        className="mx-0"
                      />
                    </Suspense>
                    <div>
                      <CardTitle className="text-2xl">
                        {selectedCircleData.state} Circle Data
                      </CardTitle>
                      <p className="text-muted-foreground mt-1">
                        Current statistics and metrics for this circle
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    {DISPLAY_FIELDS.map(({ key, label, icon: Icon }) => {
                      const originalValue =
                        selectedCircleData[
                          key as keyof typeof selectedCircleData
                        ];
                      const displayValue = editedValues[key] ?? originalValue;

                      return (
                        <div key={key} className="space-y-2 p-6">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <label className="text-base font-medium text-muted-foreground">
                              {label}
                            </label>
                          </div>
                          <div className="relative group">
                            <Input
                              type="text"
                              value={formatValue(displayValue)}
                              onChange={(e) =>
                                handleValueChange(key, e.target.value)
                              }
                              className="text-3xl font-bold tracking-tight bg-transparent border-none p-0 h-auto focus-visible:ring-0 cursor-text"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Pencil className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                {hasChanges && (
                  <Button
                    onClick={handleUpdate}
                    className="bg-green-600 hover:bg-green-700 w-fit text-sm z-10"
                  >
                    Update Data
                  </Button>
                )}
              </div>
            </>
          )}

          {!selectedCircleData && (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-muted-foreground text-lg">
                    Please select a circle to view its data
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
