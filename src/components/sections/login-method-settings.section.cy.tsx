import LoginMethodSettingsSection from "./login-method-settings.section";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("LoginMethodSettingsSection", () => {
  it("should render", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(["user", "me"], {
      message: "ok",
      data: {
        email: "user@example.com",
        loginMethods: [],
        hasPassword: true,
        hasPasskey: false,
        passkeyCount: 0,
      },
    });
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <LoginMethodSettingsSection />
      </QueryClientProvider>,
    );
    cy.get("h1").should("contain", "Login Methods");
    cy.contains("Email & Password").should("be.visible");
  });
});
