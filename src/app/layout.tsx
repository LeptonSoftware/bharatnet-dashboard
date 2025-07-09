import { Outlet, useRouteError } from "react-router"

export function ErrorBoundary() {
  const error = useRouteError() as Error
  return <div>Error Occured: {error.message}</div>
}

export default function Layout() {
  return <Outlet />
}
