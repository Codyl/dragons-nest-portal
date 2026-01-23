import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-auth";

export const Route = createFileRoute("/(private)/_layout")({
  beforeLoad: ({ location }) => {
    console.log("beforeLoad in (private)/_layout is running", location);
    requireAuth({ location });
  },
  component: RouteComponent,
});

function RouteComponent() {
  console.log("RouteComponent");
  return <Outlet />;
}
