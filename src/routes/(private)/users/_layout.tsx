import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(private)/users/_layout')({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem("AccessToken");
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
