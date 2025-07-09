import { PageHeader } from "@/components/page-header";
import { Dashboard } from "./dashboard";
import { useParams } from "react-router";
import { getCircleName } from "@/lib/utils";

export default function DashboardPage() {
  const { circleId } = useParams();
  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/logo.png" className="w-4 h-4" />,
          },
          { title: getCircleName(circleId!) },
        ]}
      />
      <Dashboard />
    </>
  );
}
