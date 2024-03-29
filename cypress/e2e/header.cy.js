import header from '../selectors/header.css'

describe('Header', () => {
    it('contains correct elements when logged out', () => {
        // when visit is empty, it will visit baseUrl (set in cypress.config.js)
        cy.visit('')
        cy.get(header.navbarLinks).should('be.visible')
            .and('have.length', 3)
            .and('contain', 'Home')
            .and('contain', 'Login')
            .and('contain', 'Sign up')
    })

    it('contains correct elements when logged in', () => {
        cy.register()
        cy.visit('')
        cy.get(header.navbarLinks).should('be.visible')
            .and('have.length', 3)
            .and('contain', 'Home')
            .and('contain', 'New Article')
            .and('contain', 'cy')
    })
})
