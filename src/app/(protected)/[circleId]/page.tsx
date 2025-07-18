import { getCircleName } from "@/lib/utils"
import { useParams } from "react-router"

import { CircleSVG } from "@/components/circle-svg"
import { PageHeader } from "@/components/page-header"

import { Dashboard } from "./dashboard"

export default function DashboardPage() {
  const { circleId } = useParams()
  return (
    <>
      <PageHeader
        breadcrumbs={[
          {
            title: "BharatNet",
            icon: <img src="/bharatnet-logo.png" className="h-4" />,
          },
          {
            title: getCircleName(circleId!),
            icon: <CircleSVG circleId={circleId!} size={16} />,
          },
        ]}
      />
      <Dashboard />
    </>
  )
}
