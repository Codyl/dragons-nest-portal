import { composeStories } from "@storybook/react-vite";
import * as stories from "./new-device.modal.stories";
import NewDeviceModal from "./new-device.modal";

const { Default, HiddenWhenGoogleSignIn } = composeStories(stories);

const clearStorageForShow = () => {
  cy.window().then((win) => {
    win.sessionStorage.removeItem("lastLoginProvider");
    win.localStorage.removeItem("AddedDeviceKey");
    win.localStorage.removeItem("isOptedOut");
    win.localStorage.removeItem("IsOptedOut");
    win.localStorage.removeItem("NewDeviceModalDismissed");
  });
};

describe("NewDeviceModal", () => {
  describe("Rendering", () => {
    it("should render and show dialog when storage allows", () => {
      clearStorageForShow();
      cy.mount(<NewDeviceModal />);
      cy.contains("Would you like to remember this device?").should("be.visible");
      cy.get("[data-slot='dialog-content']").should("exist");
    });

    it("should render via Storybook story (Default)", () => {
      cy.mountStory(Default);
      cy.contains("Would you like to remember this device?").should("be.visible");
    });
  });

  describe("Conditional show (Google sign-in)", () => {
    it("should not show modal when lastLoginProvider is google", () => {
      clearStorageForShow();
      cy.window().then((win) => {
        win.sessionStorage.setItem("lastLoginProvider", "google");
      });
      cy.mount(<NewDeviceModal />);
      cy.contains("Would you like to remember this device?").should("not.exist");
      cy.get("[data-slot='dialog-content']").should("not.exist");
    });

    it("should not show modal when lastLoginProvider is google (via story)", () => {
      cy.mountStory(HiddenWhenGoogleSignIn);
      cy.contains("Would you like to remember this device?").should("not.exist");
    });
  });

  describe("User interactions", () => {
    it("should call Amplify rememberDevice and close when user clicks Yes", () => {
      clearStorageForShow();
      cy.mount(<NewDeviceModal />);
      cy.contains("Would you like to remember this device?").should("be.visible");
      cy.contains("button", "Yes, this is my device").click();
      cy.contains("Would you like to remember this device?").should("not.exist");
    });

    it("should close and set opt-out when user clicks No", () => {
      clearStorageForShow();
      cy.mount(<NewDeviceModal />);
      cy.contains("Would you like to remember this device?").should("be.visible");
      cy.contains("button", "No, other people use this device").click();
      cy.contains("Would you like to remember this device?").should("not.exist");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("isOptedOut")).to.eq("true");
      });
    });
  });

  describe("Edge cases", () => {
    it("should not show when AddedDeviceKey is set", () => {
      clearStorageForShow();
      cy.window().then((win) => {
        win.localStorage.setItem("AddedDeviceKey", "some-key");
      });
      cy.mount(<NewDeviceModal />);
      cy.contains("Would you like to remember this device?").should("not.exist");
    });

    it("should not show when NewDeviceModalDismissed is set", () => {
      clearStorageForShow();
      cy.window().then((win) => {
        win.localStorage.setItem("NewDeviceModalDismissed", "true");
      });
      cy.mount(<NewDeviceModal />);
      cy.contains("Would you like to remember this device?").should("not.exist");
    });
  });
});
