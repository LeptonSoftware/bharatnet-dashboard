import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useNavigate } from "react-router";
import { useState } from "react";

import { useObserver, useRio } from "@rio.js/client";

import { PageHeader } from "@/components/page-header";

import { NationalDashboard } from "../[circleId]/dashboard/national-dashboard";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rio.js/ui/components/select";
import { SelectContent } from "@rio.js/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@rio.js/ui/components/tabs";
import { ChartBar } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TimePeriod } from "@/lib/trends";

export default function HomePage() {
  using _ = useObserver();
  const rio = useRio();
  const me = rio.auth.me;
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(null);

  useCopilotReadable({
    description: "The current user's name",
    value: me?.user_metadata.full_name,
  });

  useCopilotReadable({
    description: "The current user's email",
    value: me?.email,
  });

  useCopilotReadable({
    description: "Today's date",
    value: new Date().toLocaleDateString(),
  });

  useCopilotAction({
    name: "logout",
    description: "Logout the current user",
    async handler() {
      await rio.auth.logout();
      navigate("/login");
    },
  });

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
      alert("Alert: " + message);
    },
  });

  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/logo.png" className="h-4 w-4" />,
          },
          { title: "Dashboard", icon: <Icon icon="tabler:dashboard" /> },
        ]}
      >
        <Tabs
          value={timePeriod || ""}
          onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          className="hidden md:block ml-auto"
        >
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="current-week">Current Week</TabsTrigger>
            <TabsTrigger value="last-week">Last Week</TabsTrigger>
            <TabsTrigger value="current-month">Current Month</TabsTrigger>
            <TabsTrigger value="last-month">Last Month</TabsTrigger>
          </TabsList>
        </Tabs>
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
      </PageHeader>
      <NationalDashboard timePeriod={timePeriod} />
    </>
  );
}
