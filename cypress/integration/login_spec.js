describe("Authentication", () => {
  beforeEach(() => {
    cy.task("deleteUser");
  });

  it("login with email and password", () => {
    cy.task("createUser").then(($user) => {
      cy.intercept("POST", "/user/login").as("login");

      cy.visit("/");

      cy.get('input[name="email"]').type(Cypress.env("gmailAccount"));
      cy.get('input[name="password"]').type("Password123!");
      cy.get('button[name="submit"]').click();

      cy.wait("@login").its("response.statusCode").should("eq", 201);

      cy.getCookie("access_token").should("exist");

      cy.url().should("include", "/user");

      cy.get("[data-cy='verified-name']").should(
        "have.text",
        "Welcome to dashboard"
      );
    });
  });

  it("register using email and password", () => {
    cy.intercept("POST", "/user/register").as("register");

    cy.visit("/register");

    cy.get('input[name="name"]').type("test");
    cy.get('input[name="email"]').type(Cypress.env("gmailAccount"));
    cy.get('input[name="password"]').type("Password123!");
    cy.get('button[name="submit"]').click();

    cy.wait("@register").its("response.statusCode").should("eq", 200);
  });

  after(() => {
    cy.task("deleteUser");
  });
});
