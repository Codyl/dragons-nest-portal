import type { RouterContext } from "@/App";
import NewDeviceModal from "@/components/modals/new-device.modal";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/_private")({
  beforeLoad: async ({ context, location }) => {
    const authContext = context as RouterContext;
    const isAuthenticated = await authContext.checkAuth();

    if (!isAuthenticated) {
      throw redirect({
        to: "/verify-username",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {

  return <>
    {(!localStorage.getItem("AddedDeviceKey") && !localStorage.getItem("IsOptedOut")) && <NewDeviceModal />}
    <Outlet />
  </>;
}
