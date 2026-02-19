import { composeStories } from "@storybook/react-vite";
import * as stories from "./login-method-settings.section.stories";
import LoginMethodSettingsSection, { UNLINK_GOOGLE_NEEDS_PASSWORD_MESSAGE } from "./login-method-settings.section";

const { Default } = composeStories(stories);

describe("LoginMethodSettingsSection", () => {
  it("should render", () => {
    cy.mount(<LoginMethodSettingsSection />);
    cy.contains("h1", "Login Methods").should("exist");
    cy.contains("button", "Change Password").should("exist");
    cy.contains("button", "Register Passkey").should("exist");
  });

  it("should render via Storybook story (reuses story setup)", () => {
    cy.mountStory(Default);
    cy.contains("h1", "Login Methods").should("exist");
    cy.contains("button", "Register Passkey").should("exist");
  });

  it("should show Register Passkey button and trigger options request on click", () => {
    cy.intercept("POST", "**/users/me/passkey/register/options", {
      statusCode: 200,
      body: {
        message: "Registration options",
        data: {
          challenge: "mock-challenge",
          rp: { name: "Auth App", id: "localhost" },
          user: { id: "uid", name: "test@example.com", displayName: "test@example.com" },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "none",
          excludeCredentials: [],
          authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
        },
      },
    }).as("passkeyOptions");
    cy.mount(<LoginMethodSettingsSection />);
    cy.contains("button", "Register Passkey").click();
    cy.get("@passkeyOptions").should("have.been.calledOnce");
  });

  it("should show loading state when Register Passkey is clicked", () => {
    cy.intercept("POST", "**/users/me/passkey/register/options", (req) => {
      req.reply({
        delay: 500,
        statusCode: 200,
        body: {
          message: "Registration options",
          data: {
            challenge: "mock-challenge",
            rp: { name: "Auth App", id: "localhost" },
            user: { id: "uid", name: "test@example.com", displayName: "test@example.com" },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "none",
            excludeCredentials: [],
            authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
          },
        },
      });
    });
    cy.mount(<LoginMethodSettingsSection />);
    cy.contains("button", "Register Passkey").click();
    cy.contains("Completing passkey registration…").should("exist");
  });

  it("should show Connect button for Google when not linked and call link-google on click", () => {
    cy.intercept("GET", "**/users/me", {
      statusCode: 200,
      body: {
        message: "User retrieved successfully",
        data: { email: "user@example.com", loginMethods: [] },
      },
    }).as("getUser");
    cy.intercept("POST", "**/users/me/link-google", {
      statusCode: 200,
      body: { message: "Google account linked successfully", data: {} },
    }).as("linkGoogle");
    cy.mount(<LoginMethodSettingsSection />);
    cy.get("@getUser").should("have.been.called");
    cy.contains("button", "Connect").click();
    cy.get("@linkGoogle").should("have.been.calledOnce");
    cy.get("@linkGoogle").its("request.body").should("deep.include", { credential: "mock-google-credential" });
  });

  it("should show link-google success message after successful link", () => {
    cy.intercept("GET", "**/users/me", {
      statusCode: 200,
      body: {
        message: "User retrieved successfully",
        data: { email: "user@example.com", loginMethods: [] },
      },
    });
    cy.intercept("POST", "**/users/me/link-google", {
      statusCode: 200,
      body: { message: "Google account linked successfully", data: {} },
    });
    cy.mount(<LoginMethodSettingsSection />);
    cy.contains("button", "Connect").click();
    cy.get("[data-testid=link-google-success]").should("contain", "Google account linked successfully");
  });

  it("should show password-required message in popover when Google linked but user has no password", () => {
    cy.intercept("GET", "**/users/me", {
      statusCode: 200,
      body: {
        message: "User retrieved successfully",
        data: { email: "user@example.com", loginMethods: ["GOOGLE"], hasPassword: false },
      },
    });
    cy.mount(<LoginMethodSettingsSection />);
    cy.get("[data-testid=unlink-google-disabled]").should("exist");
    cy.get("[data-testid=unlink-google-trigger]").trigger("mouseenter");
    cy.get("[data-testid=unlink-google-password-required]")
      .should("be.visible")
      .and("contain", UNLINK_GOOGLE_NEEDS_PASSWORD_MESSAGE);
  });

  it("should call unlink-google on Remove and show success when user has password", () => {
    cy.intercept("GET", "**/users/me", {
      statusCode: 200,
      body: {
        message: "User retrieved successfully",
        data: { email: "user@example.com", loginMethods: ["GOOGLE"], hasPassword: true },
      },
    }).as("getUser");
    cy.intercept("POST", "**/users/me/unlink-google", {
      statusCode: 200,
      body: { message: "Google account disconnected successfully", data: {} },
    }).as("unlinkGoogle");
    cy.mount(<LoginMethodSettingsSection />);
    cy.contains("button", "Remove").click();
    cy.get("@unlinkGoogle").should("have.been.calledOnce");
    cy.get("[data-testid=unlink-google-success]").should("contain", "Google account disconnected successfully");
  });

  it("should show password-required error when Remove returns 400 without password", () => {
    cy.intercept("GET", "**/users/me", {
      statusCode: 200,
      body: {
        message: "User retrieved successfully",
        data: { email: "user@example.com", loginMethods: ["GOOGLE"], hasPassword: true },
      },
    });
    cy.intercept("POST", "**/users/me/unlink-google", {
      statusCode: 400,
      body: { message: UNLINK_GOOGLE_NEEDS_PASSWORD_MESSAGE, data: { code: "PASSWORD_REQUIRED" } },
    }).as("unlinkGoogle");
    cy.mount(<LoginMethodSettingsSection />);
    cy.contains("button", "Remove").click();
    cy.get("@unlinkGoogle").should("have.been.calledOnce");
    cy.get("[data-testid=unlink-google-password-required-error]").should("contain", UNLINK_GOOGLE_NEEDS_PASSWORD_MESSAGE);
  });
});
