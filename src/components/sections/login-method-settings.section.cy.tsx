import { composeStories } from "@storybook/react-vite";
import * as stories from "./login-method-settings.section.stories";
import LoginMethodSettingsSection from "./login-method-settings.section";

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
});
