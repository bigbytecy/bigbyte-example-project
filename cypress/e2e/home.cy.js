import home from '../selectors/home.sel'

describe('Home page', () => {
    it('contains correct elements when logged out', () => {
        cy.visit('')
        cy.contains('Global Feed').should('be.visible')
            .and('have.css', 'color', 'rgb(92, 184, 92)')
            .and('have.length', 1)
        cy.get(home.articles).should('be.visible')
            .and('have.length.at.least', 2)
        cy.get(home.sidebar).should('be.visible')
        cy.get(home.sidebarTags).should('be.visible')
            .and('have.length.at.least', 3)
    })

    it('contains correct elements when logged in', () => {
        const apiUrl = Cypress.env('apiUrl')

        // mock my feed data
        cy.intercept(`${apiUrl}/articles/feed?limit=3*`, {
            fixture: 'my_feed'
        }).as('feedRequest')
        cy.register()
        cy.visit('')
        cy.wait('@feedRequest')
        cy.get(home.feedTabs).should('be.visible')
            .and('have.length', 2)
        cy.get(home.articles).should('be.visible')
            .and('have.length', 1)
        cy.get(home.sidebarTags).should('be.visible')
            .and('have.length.at.least', 3)
    })

    it('can see popular tags', () => {
        const apiUrl = Cypress.env('apiUrl')

        // delay tag request so we can test "loading tags..." text
        cy.intercept(`${apiUrl}/tags`, (req) => {
            req.continue((res) => {
                res.send({
                    delay: 2000
                })
            })
        }).as('tagRequest')

        cy.visit('')
        cy.get(home.sidebar).should('be.visible')
            .and('contain', 'Popular Tags')
        cy.get(home.loadingTagsText).should('be.visible')
            .and('contain', 'Loading tags...')
        cy.get(home.sidebarTags).should('not.exist')
        cy.get(home.loadingTagsText).should('not.exist')
        cy.get(home.sidebarTags).should('be.visible')
            .and('have.length.at.least', 3)
    })
})
