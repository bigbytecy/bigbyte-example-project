import editor from '../selectors/editor.css'
import article from '../selectors/article.css'

describe('Article', () => {
    const seeMoreLink = 'https://github.com/bigbytecy/bigbyte-example-project'

    beforeEach(() => {
        cy.register().then((response) => {
            // we need username in one of the tests
            // in cypress we can just use wrap instead of const
            cy.wrap(response.username).as('username')
        })
    })

    it('can create a new article', () => {
        // post title needs to be random
        const randomPostTitle = `My post title ${Math.random().toString().slice(2, 11)}`

        cy.visit('/editor/')
        cy.get(editor.titleField).type(randomPostTitle)
        cy.get(editor.aboutField).type('Cypress')
        cy.get(editor.bodyField).type(`Simple automation project ${seeMoreLink}`)
        cy.get(editor.publishButton).click()
        cy.get(article.title).should('be.visible')
            .and('have.text', randomPostTitle)
    })

    it('can add tags to article', () => {
        const randomPostTitle = `My post title ${Math.random().toString().slice(2, 11)}`

        cy.visit('/editor/')
        cy.get(editor.titleField).type(randomPostTitle)
        cy.get(editor.aboutField).type('Cypress')
        cy.get(editor.bodyField).type(`Simple automation project ${seeMoreLink}`)
        cy.get(editor.tagsField).type('bigbyte,cypress,training')
        cy.get(editor.publishButton).click()
        cy.get(article.title).should('be.visible')
            .and('have.text', randomPostTitle)
        cy.get(article.tags).should('be.visible')
            .and('have.length', 3)
            .and('contain', 'bigbyte')
            .and('contain', 'cypress')
            .and('contain', 'training')
    })

    it('logged out user can see article page', function () {
        cy.createArticle().then(({ slug }) => {
            // log out to visit article as logged out user
            cy.clearCookies()
            cy.clearLocalStorage()
            cy.visit(`/article/${slug}`)
        })
        cy.get(article.title).should('be.visible')
        cy.get(article.banner).should('be.visible')
        cy.get(article.author).should('be.visible')
            .and('have.text', this.username)
        cy.get(article.followButton).should('be.visible')
            .and('contain', 'Followers')
        cy.get(article.favoriteButton).should('be.visible')
        cy.get(article.body).should('be.visible')
        cy.get(article.commentTextForLoggedOutUsers).should('be.visible')
            .and('contain', 'Sign in or Sign up to add comments on this article')
        cy.get(article.actions).should('be.visible')
    })

    it('can edit an article', () => {
        // we already know if creating an article works or not from the first test
        // we can now use a shortcut (cy.createArticle() command) to test other scenarios
        cy.createArticle().then(({ slug, title }) => {
            const titleUrl = title.split(' ').join('-').toLowerCase()
            cy.visit(`/editor/${slug}`)
            cy.get(editor.titleField).should('be.visible')
            // to check field value, use have.value not have.text
                .and('have.value', title)
            cy.get(editor.aboutField).should('be.visible')
                .and('have.value', seeMoreLink)
            cy.get(editor.bodyField).clear()
                .type(`Test can edit an article. ${seeMoreLink}`)
            cy.get(editor.publishButton).click()
            cy.url().should('contain', `/article/${titleUrl}`)
            cy.get(article.title).should('be.visible')
            cy.get(article.body).should('be.visible')
                .and('have.text', `Test can edit an article. ${seeMoreLink}`)
        })
    })

    it('can delete an article', () => {
        // same here - we don't need to create an article from UI, we already know it works
        // intercept is just listening this specific request
        cy.intercept('DELETE', '/api/articles/**').as('deleteRequest')
        cy.createArticle().then(({ slug }) => {
            cy.visit(`/article/${slug}`)
        })
        cy.get(article.title).should('be.visible')
        cy.get(article.deleteButton).click()
        // wait for request we're listening to happen before continuing with the test
        cy.wait('@deleteRequest')
        cy.url().should('eq', `${Cypress.config('baseUrl')}/`)
    })
})
