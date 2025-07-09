import { PageHeader } from "@/components/page-header";
import { InsightsTable } from "./insights-table";

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/logo.png" className="w-4 h-4" />,
          },
        ]}
      />
      <div className="p-6 overflow-y-auto">
        <InsightsTable />
      </div>
    </>
  );
}
