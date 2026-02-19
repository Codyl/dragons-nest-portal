import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Cody Lillywhite" },
      { name: "description", content: "Privacy policy and how we handle your data." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p>
        No Mobile information will be shared with third parties/affiliates for
        marketing/promotional purposes.
      </p>
    </div>
  );
}
