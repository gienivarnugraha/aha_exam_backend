describe("Authentication", () => {
  beforeEach(() => {
    cy.task("deleteUser");
  });

  it("login with email and password", () => {
    cy.task("createUser").then(($user) => {
      cy.intercept("POST", "/login").as("login");

      cy.visit("/login");

      cy.get('[data-cy="email"]').type(Cypress.env("gmailAccount"));
      cy.get('[data-cy="password"]').type("Password123!");
      cy.get('[data-cy="submit"]').click();

      cy.wait("@login").then(({ response }) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.have.a.property("accesstoken");
        expect(response.body).to.have.a.property("user");
      });

      cy.window().its("$nuxt.$auth.state.loggedIn").should("eq", true);

      cy.get("[data-cy='welcome']").should(
        "have.text",
        "Welcome to dashboard!"
      );
      cy.get("[data-cy='verified-name']")
        .get(" .v-list-item__title")
        .should("contain", $user.name);
      cy.get("[data-cy='verified-email']").should("contain", $user.email);
    });
  });

  it("register using email and password", () => {
    cy.intercept("POST", "/register").as("register");

    cy.visit("/register");

    cy.get('[data-cy="name"]').type("test");
    cy.get('[data-cy="email"]').type(Cypress.env("gmailAccount"));
    cy.get('[data-cy="password"]').type("Password123!");
    cy.get('[data-cy="password-confirm"]').type("Password123!");
    cy.get('[data-cy="submit"]').click();

    cy.wait("@register").then(({ response }) => {
      expect(response.statusCode).to.equal(201);
      expect(response.body.message).to.include(
        `Verification token has been sent to: ${Cypress.env("gmailAccount")}`
      );
      let token = response.body.token;

      cy.get("[data-cy='register-success']").should(
        "contain",
        `Verification token has been sent to: ${Cypress.env("gmailAccount")}`
      );

      cy.task("findToken", token).then(($token) => {
        console.log("findtoken", $token);
        cy.request("POST", `${Cypress.env("apiUrl")}/token_verification`, {
          token: $token,
        }).then((response) => {
          console.log(response);
          expect(response.status).to.eq(200);
          expect(response.body).to.have.a.property("accesstoken");
        });
      });
    });
  });

  after(() => {
    cy.task("deleteUser");
  });
});
