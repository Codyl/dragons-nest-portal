/// <reference types="cypress" />
// ***********************************************
// Custom commands for E2E (app) tests.
// ***********************************************

const AUTH_API_BASE = 'http://localhost:8080';

/**
 * Parse Set-Cookie header(s) and return { name, value, options } for cy.setCookie.
 * Ensures cookies are set for domain 'localhost' so the app (5173) can send them to the API (8080).
 */
function parseSetCookie(header: string | string[] | undefined): Array<{ name: string; value: string; options: Cypress.SetCookieOptions }> {
  if (!header) return [];

  const raw = Array.isArray(header) ? header : [header];
  const result: Array<{ name: string; value: string; options: Cypress.SetCookieOptions }> = [];
  for (const line of raw) {
    const parts = line.split(';').map((p) => p.trim());
    const [nameVal] = parts;
    if (!nameVal || !nameVal.includes('=')) continue;

    const eq = nameVal.indexOf('=');
    const name = nameVal.slice(0, eq);
    const value = nameVal.slice(eq + 1);
    const options: Cypress.SetCookieOptions = { domain: 'localhost', path: '/', httpOnly: true, sameSite: 'strict' };
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.toLowerCase().startsWith('max-age=')) options.maxAge = parseInt(part.split('=')[1], 10);

      if (part.toLowerCase() === 'secure') options.secure = true;
    }
    result.push({ name, value, options });
  }
  return result;
}

/**
 * Log in via auth API (verify-username + initiate-login) and set auth cookies for domain localhost
 * so the browser is authenticated when visiting the app. Use before cy.visit() in flow tests.
 */
Cypress.Commands.add('loginViaApi', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${AUTH_API_BASE}/auth/verify-username`,
    body: { email: username },
    headers: { 'Content-Type': 'application/json' },
    failOnStatusCode: true,
  }).then((verifyRes) => {
    const session = (verifyRes.body as { data?: { Session?: string } })?.data?.Session;
    expect(session, 'verify-username should return Session').to.be.a('string');
    return cy.request({
      method: 'POST',
      url: `${AUTH_API_BASE}/auth/initiate-login`,
      body: { username, password, session },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: true,
    });
  }).then((loginRes) => {
    const setCookie = (loginRes.headers as Record<string, string | string[]>)['set-cookie']
      ?? (loginRes.headers as Record<string, string | string[]>)['Set-Cookie'];
    const cookies = parseSetCookie(setCookie);
    for (const c of cookies) {
      cy.setCookie(c.name, c.value, c.options);
    }
  });
});

/** Complete the /account-setup wizard when that URL is shown (before welcome). */
Cypress.Commands.add('completeAccountSetupIfShown', () => {
  cy.url().then((url) => {
    if (!url.includes('/account-setup')) {
      return;
    }

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="birthDate"]').type('2010-06-01');
    cy.get('[data-testid="input-state"]').select('ca');
    cy.get('[data-testid="input-zip"]').type('90210');
    cy.get('[data-testid="input-phone"]').type('5551234567');
    cy.get('[data-testid="avatar-dragon"]').click();
    cy.contains('button', 'Continue').click();

    cy.get('[data-testid="interest-reading"]').click();
    cy.contains('button', 'Continue').click();

    cy.contains('button', 'Continue').click();

    cy.url({ timeout: 15000 }).should('include', '/welcome');
  });
});

/** Click through first-login welcome when present (e.g. MailSlurp users without loginViaApi). */
Cypress.Commands.add('dismissWelcomeIfShown', () => {
  cy.get('body').then(($body) => {
    const btn = $body.find('[data-testid="welcome-continue"]');
    if (btn.length) {
      cy.wrap(btn).click();
    }
  });
});

/**
 * Request helper for auth API. Use in endpoint tests and when building session for flow tests.
 */
Cypress.Commands.add('authApiRequest', (method: string, path: string, body?: object) => {
  return cy.request({
    method,
    url: `${AUTH_API_BASE}${path}`,
    ...(body !== undefined && { body, headers: { 'Content-Type': 'application/json' } }),
    failOnStatusCode: false,
  });
});