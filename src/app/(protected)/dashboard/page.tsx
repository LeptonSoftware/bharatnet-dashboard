import { TimePeriod } from "@/lib/trends"
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core"
import { Icon } from "@iconify/react/dist/iconify.js"
import { ChartBar } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"

import { useObserver, useRio } from "@rio.js/client"
import { Label } from "@rio.js/ui/components/label"
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rio.js/ui/components/select"
import { SelectContent } from "@rio.js/ui/components/select"
import { Switch } from "@rio.js/ui/components/switch"
import { Tabs, TabsList, TabsTrigger } from "@rio.js/ui/components/tabs"

import { PageHeader } from "@/components/page-header"

import { NationalDashboard } from "../[circleId]/dashboard/national-dashboard"

export default function HomePage() {
  using _ = useObserver()
  const rio = useRio()
  const me = rio.auth.me
  const navigate = useNavigate()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(null)
  const [compareMode, setCompareMode] = useState(false)

  useCopilotReadable({
    description: "The current user's name",
    value: me?.user_metadata.full_name,
  })

  useCopilotReadable({
    description: "The current user's email",
    value: me?.email,
  })

  useCopilotReadable({
    description: "Today's date",
    value: new Date().toLocaleDateString(),
  })

  useCopilotAction({
    name: "logout",
    description: "Logout the current user",
    async handler() {
      await rio.auth.logout()
      navigate("/login")
    },
  })

  useCopilotAction({
    name: "showAlert",
    description: "Show an alert",
    parameters: [
      {
        name: "message",
        description: "The message to show",
        type: "string",
      },
    ],
    handler({ message }) {
      alert("Alert: " + message)
    },
  })

  useCopilotAction({
    name: "set-time-period-selector",
    description: "Set the time period selector",
    parameters: [
      {
        name: "timePeriod",
        description:
          "The time period to set, eg. today, current-week, last-week, current-month, last-month",
        type: "string",
      },
    ],
    handler({ timePeriod }) {
      setTimePeriod(timePeriod as TimePeriod)
    },
  })

  useCopilotAction({
    name: "set-compare-mode",
    description: "Set the compare mode",
    parameters: [
      {
        name: "compareMode",
        description: "The compare mode to set",
        type: "boolean",
      },
    ],
    handler({ compareMode }) {
      setCompareMode(compareMode)
    },
  })

  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/bharatnet-logo.png" className="h-4" />,
          },
          { title: "Dashboard", icon: <Icon icon="tabler:dashboard" /> },
        ]}
      >
        <div className="flex items-center gap-4 ml-auto">
          <Tabs
            value={timePeriod || ""}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            className="hidden md:block"
          >
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="current-week">Current Week</TabsTrigger>
              {compareMode ? null : (
                <TabsTrigger value="last-week">Last Week</TabsTrigger>
              )}
              <TabsTrigger value="current-month">Current Month</TabsTrigger>
              {compareMode ? null : (
                <TabsTrigger value="last-month">Last Month</TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          <div className="items-center space-x-2 hidden md:flex">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={() => {
                setCompareMode(!compareMode)
                if (!compareMode) {
                  if (timePeriod === "last-week") {
                    setTimePeriod("current-week")
                  }
                  if (timePeriod === "last-month") {
                    setTimePeriod("current-month")
                  }
                }
              }}
              disabled={
                !timePeriod ||
                !["current-week", "current-month"].includes(timePeriod)
              }
            />
            <Label htmlFor="compare-mode" className="text-sm">
              Compare
            </Label>
          </div>
        </div>
      </PageHeader>
      <div className="flex flex-row items-center justify-center gap-4 px-4 py-2 border-b md:hidden">
        <Select
          value={timePeriod || ""}
          onValueChange={(value) => setTimePeriod(value as TimePeriod)}
        >
          <SelectTrigger className="md:hidden">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="current-week">Current Week</SelectItem>
            <SelectItem value="last-week">Last Week</SelectItem>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch
            id="compare-mode"
            checked={compareMode}
            onCheckedChange={() => {
              setCompareMode(!compareMode)
              if (!compareMode) {
                if (timePeriod === "last-week") {
                  setTimePeriod("current-week")
                }
                if (timePeriod === "last-month") {
                  setTimePeriod("current-month")
                }
              }
            }}
            disabled={
              !timePeriod ||
              !["current-week", "current-month"].includes(timePeriod)
            }
          />
          <Label htmlFor="compare-mode" className="text-sm">
            Compare
          </Label>
        </div>
      </div>
      <NationalDashboard timePeriod={timePeriod} compareMode={compareMode} />
    </>
  )
}
