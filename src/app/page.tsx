import { rio } from "@/lib/rio"
import { useCallback } from "react"
import { Navigate, redirect, useLocation, useNavigate } from "react-router"

import { Authenticated } from "@rio.js/auth"

export function loader() {
  if (!rio.auth.isLoggedIn()) {
    throw redirect("/login")
  }

  throw redirect("/home")
}

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const onUnauthenticated = useCallback(() => {
    navigate(`/login?to=${location.pathname}`, {
      viewTransition: true,
    })
  }, [navigate, location.pathname])

  return (
    <Authenticated onUnauthenticated={onUnauthenticated}>
      <Navigate to="/home" />
    </Authenticated>
  )
}
