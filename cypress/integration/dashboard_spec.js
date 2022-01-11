describe("testing password reset", () => {
  before(() => {
    cy.task("createUser");

    cy.visit("/login");
  });

  after(() => {
    cy.window().then((window) => {
      window.$nuxt.$auth.logout();
    });
    cy.task("deleteUser").then(() => {
      cy.clearCookie("accesstoken");
    });
  });

  beforeEach(function () {
    cy.request("POST", `${Cypress.env("apiUrl")}/login`, {
      email: Cypress.env("gmailAccount"),
      password: "Password123!",
    })
      .its("body")
      .as("currentUser");

    cy.window().then((window) => {
      window.$nuxt.$auth.setUser(this.currentUser.user);
      window.$nuxt.$auth.setUserToken(this.currentUser.accesstoken);
    });
    cy.visit("/");
    cy.intercept("PUT", `${Cypress.env("apiUrl")}/reset_password`).as("reset");
  });

  it("confirmation password is wrong", function () {
    cy.getCookie("accesstoken").should("exist");

    cy.get('[data-cy="reset-password"]')
      .click()
      .then(() => {
        cy.get('[data-cy="old-password"]').type("Password123!");
        cy.get('[data-cy="new-password"]').type("Adminnew123!");
        cy.get('[data-cy="confirm-password"]').type("FalsePassword123!");
        cy.get('[data-cy="submit"]').click();

        cy.wait("@reset").then(({ response }) => {
          expect(response.statusCode).to.eq(400);
          expect(response.body.error).to.eq(true);
          expect(response.body.message.errors).to.have.property(
            "confirmPassword"
          );
        });

        cy.get('[data-cy="confirm-password"]')
          .parents(".v-input__control")
          .find(".v-messages__message")
          .should(
            "contain",
            "The confirmPassword and newPassword fields must match."
          );
      });
  });

  it("old password is wrong", function () {
    cy.get('[data-cy="reset-password"]')
      .click()
      .then(() => {
        cy.get('[data-cy="old-password"]').type("Admin123!");
        cy.get('[data-cy="new-password"]').type("Adminnew123!");
        cy.get('[data-cy="confirm-password"]').type("Adminnew123!");
        cy.get('[data-cy="submit"]').click();

        cy.wait("@reset").then(({ response }) => {
          expect(response.statusCode).to.eq(400);
          expect(response.body.error).to.eq(true);
          expect(response.body.message.errors).to.have.property("oldPassword");
        });

        cy.get('[data-cy="old-password"]')
          .parents(".v-input__control")
          .find(".v-messages__message")
          .should("contain", "Your old password is wrong!");
      });
  });

  it("old password and new password is same", function () {
    cy.get('[data-cy="reset-password"]')
      .click()
      .then(() => {
        cy.get('[data-cy="old-password"]').type("Password123!");
        cy.get('[data-cy="new-password"]').type("Password123!");
        cy.get('[data-cy="confirm-password"]').type("Password123!");
        cy.get('[data-cy="submit"]').click();

        cy.wait("@reset").then(({ response }) => {
          expect(response.statusCode).to.eq(400);
          expect(response.body.error).to.eq(true);
          expect(response.body.message.errors).to.have.property("newPassword");
        });

        cy.get('[data-cy="new-password"]')
          .parents(".v-input__control")
          .find(".v-messages__message")
          .should(
            "contain",
            "The newPassword and oldPassword must be different."
          );
      });
  });

  it("weak password detected", function () {
    cy.get('[data-cy="reset-password"]')
      .click()
      .then(() => {
        cy.get('[data-cy="old-password"]').type("Password123!");
        cy.get('[data-cy="new-password"]').type("admin");
        cy.get('[data-cy="confirm-password"]').type("admin");

        cy.get('[data-cy="submit"]').click();

        cy.wait("@reset").then(({ response }) => {
          expect(response.body.error).to.eq(true);
          expect(response.body.message.errors).to.have.keys(
            "confirmPassword",
            "newPassword"
          );

          expect(
            response.body.message.errors.confirmPassword
          ).to.include.members([
            "Should contain uppercase character.",
            "Should contain special !@#$%^&* character.",
            "Should contain numeric character.",
          ]);

          expect(response.body.message.errors.newPassword).to.include.members([
            "Should contain uppercase character.",
            "Should contain special !@#$%^&* character.",
            "Should contain numeric character.",
          ]);
        });
      });
  });

  it("reset password", function () {
    cy.get('[data-cy="reset-password"]')
      .click()
      .then(() => {
        cy.wait(1000);

        cy.get('[data-cy="old-password"]').type("Password123!");
        cy.get('[data-cy="new-password"]').type("Admin123!");
        cy.get('[data-cy="confirm-password"]').type("Admin123!");

        cy.get('[data-cy="submit"]').click();

        cy.wait("@reset").then(({ response }) => {
          expect(response.statusCode).to.eq(200);
          expect(response.body.success).to.eq(true);
          expect(response.body.message).to.include("Password changed!");
        });

        cy.get('[data-cy="success-message"]').should(
          "contain",
          "Success resetting your password!"
        );
      });
  });
});
