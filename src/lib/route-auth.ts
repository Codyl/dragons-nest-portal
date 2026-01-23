import { redirect } from "@tanstack/react-router";

export function requireAuth({ location }: { location: { href: string } }) {
  console.log("requireAuth check running", location);
  const token = localStorage.getItem("AccessToken");
  if (!token) {
    throw redirect({
      to: "/login",
      search: {
        redirect: location.href,
      },
    });
  }
}
