import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";

import { useObserver, useRio } from "@rio.js/client";
import { ScrollArea } from "@rio.js/ui/components/scroll-area";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { SectionCards } from "@/components/section-cards";

import data from "../home/data.json";
import { NationalDashboard } from "../[circleId]/dashboard/national-dashboard";

export default function HomePage() {
  using _ = useObserver();
  const rio = useRio();
  const me = rio.auth.me;
  const navigate = useNavigate();

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
          { title: "Dashboard" },
        ]}
      />
      <NationalDashboard />
    </>
  );
}
