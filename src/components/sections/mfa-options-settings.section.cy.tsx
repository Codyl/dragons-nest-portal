import { composeStories } from "@storybook/react-vite";
import * as stories from "./mfa-options-settings.section.stories";
import MFAOptionsSettingsSection from "./mfa-options-settings.section";

const { Default } = composeStories(stories);

const usersMeNoTOTP = {
  message: "User retrieved successfully",
  data: {
    email: "test@example.com",
    softwareTokenMfaEnabled: false,
    preferredMfa: undefined,
  },
};

const usersMeTOTPEnabled = {
  message: "User retrieved successfully",
  data: {
    email: "test@example.com",
    softwareTokenMfaEnabled: true,
    preferredMfa: "SOFTWARE_TOKEN_MFA",
  },
};

describe("MFAOptionsSettingsSection", () => {
  it("should render", () => {
    cy.intercept("GET", "**/users/me", { statusCode: 200, body: usersMeNoTOTP });
    cy.mount(<MFAOptionsSettingsSection />);
    cy.contains("h1", "User MFA Options Settings").should("exist");
    cy.contains("button", "Setup").should("exist");
  });

  it("should render via Storybook story", () => {
    cy.mountStory(Default);
    cy.contains("h1", "User MFA Options Settings").should("exist");
  });

  it("should show Remove button when TOTP is enabled", () => {
    cy.intercept("GET", "**/users/me", { statusCode: 200, body: usersMeTOTPEnabled });
    cy.mount(<MFAOptionsSettingsSection />);
    cy.contains("button", "Remove").should("exist");
  });

  it("should open remove confirmation and call mfa-preference on Remove", () => {
    cy.intercept("GET", "**/users/me", { statusCode: 200, body: usersMeTOTPEnabled }).as("getUser");
    cy.intercept("POST", "**/users/me/mfa-preference", {
      statusCode: 200,
      body: { message: "MFA preferences updated successfully", data: {} },
    }).as("mfaPreference");
    cy.mount(<MFAOptionsSettingsSection />);
    cy.contains("button", "Remove").click();
    cy.contains("Remove Authenticator App MFA?").should("be.visible");
    cy.contains("button", "Remove").last().click();
    cy.get("@mfaPreference").should("have.been.calledOnce");
    cy.get("@mfaPreference").its("request.body").should("deep.include", { softwareTokenMfaEnabled: false });
  });

  it("should open setup modal when Setup is clicked", () => {
    cy.intercept("GET", "**/users/me", { statusCode: 200, body: usersMeNoTOTP });
    cy.intercept("POST", "**/auth/mfa/generate-authenticator-secret", {
      statusCode: 200,
      body: {
        data: {
          Session: "new-session",
          qrString: "otpauth://totp/Test:test@example.com?secret=TEST&issuer=Test",
        },
      },
    });
    cy.mount(<MFAOptionsSettingsSection />);
    cy.contains("button", "Setup").click();
    cy.contains("Scan QR Code").should("be.visible");
  });
});
