import { PageHeader } from "@/components/page-header";
import { DashboardTable } from "./dashboard-table";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/bharatnet-logo.png" className="h-4" />,
          },
        ]}
      />
      <div className="p-6 overflow-y-auto">
        <DashboardTable />
      </div>
    </>
  );
}
