describe('Login page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('displays the platform title', () => {
    cy.contains('AI Support Platform').should('be.visible')
  })

  it('displays the sign in button', () => {
    cy.contains('Sign in').should('be.visible')
  })

  it('sign in button links to auth endpoint', () => {
    cy.get('a[href="/auth/login"]').should('exist')
  })
})
