import LoginMethodSettingsSection from "./login-method-settings.section";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("LoginMethodSettingsSection", () => {
  it("should render", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    cy.intercept("GET", "**/profile", {
      statusCode: 200,
      body: {
        message: "ok",
        data: {
          email: "user@example.com",
          loginMethods: [],
          hasPassword: true,
          hasPasskey: false,
          passkeyCount: 0,
        },
      },
    }).as("getProfile");
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <LoginMethodSettingsSection />
      </QueryClientProvider>,
    );
    cy.get("h1").should("contain", "Login Methods");
    cy.get("[data-testid=register-passkey-button]").should("exist");
  });

  it("should show passkey count and add-another when user has passkeys", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    cy.intercept("GET", "**/profile", {
      statusCode: 200,
      body: {
        message: "ok",
        data: {
          email: "user@example.com",
          loginMethods: [],
          hasPassword: true,
          hasPasskey: true,
          passkeyCount: 2,
        },
      },
    }).as("getProfile");
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <LoginMethodSettingsSection />
      </QueryClientProvider>,
    );
    cy.get("[data-testid=passkey-count]").should("contain", "2 saved");
    cy.get("[data-testid=register-passkey-button]")
      .should("exist")
      .and("contain", "Add another passkey");
  });

  it("should show Register Passkey button when user has no passkey", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    cy.intercept("GET", "**/profile", {
      statusCode: 200,
      body: {
        message: "ok",
        data: {
          email: "user@example.com",
          loginMethods: [],
          hasPassword: true,
          hasPasskey: false,
          passkeyCount: 0,
        },
      },
    }).as("getProfile");
    cy.mount(
      <QueryClientProvider client={queryClient}>
        <LoginMethodSettingsSection />
      </QueryClientProvider>,
    );
    cy.get("[data-testid=register-passkey-button]")
      .should("exist")
      .and("contain", "Register Passkey");
  });
});
