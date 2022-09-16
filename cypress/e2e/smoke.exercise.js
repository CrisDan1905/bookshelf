// 🐨 you'll want a fake user to register as:
import {buildUser} from '../support/generate'

describe('smoke', () => {
  it('should allow a typical user flow', () => {
    const fakeUser = buildUser()
    cy.visit('/')
    cy.findByRole('button', {name: /register/i}).click()
    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox', {name: /username/i}).type(fakeUser.username)
      cy.findByLabelText(/password/i).type(fakeUser.password)
      cy.findByRole('button', {name: /register/i}).click()
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /discover/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findByRole('searchbox').type('time {enter}')
      //   🐨 within the listitem with the name of your book, find the button
      //      named "add to list" and click it.
      cy.findByRole('listitem', {name: /The Phantom Tolbooth/i}).within(() => {
        cy.findByRole('button', {name: /add to list/i}).click()
      })
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /reading list/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('link', {name: /The Phantom Tolbooth/i}).click()

      cy.findByRole('textbox', {name: /notes/i}).type('testing notes')

      cy.findByLabelText(/loading/i).should('exist')
      cy.findByLabelText(/loading/i).should('not.exist')

      cy.findByRole('button', {name: /mark as read/i}).click()

      cy.findByRole('radio', {name: /5 stars/i}).click({force: true})
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 1)
      cy.findByRole('radio', {name: /5 stars/i}).should('be.checked')
      cy.findByRole('link', {name: /The Phantom Tolbooth/i}).click()

      cy.findByRole('button', {name: /remove from list/i}).click()

      cy.findByRole('textbox', {name: /notes/i}).should('not.exist')
      cy.findByRole('radio', {name: /5 stars/i}).should('not.exist')
    })

    cy.findByRole('navigation').within(() => {
      cy.findByRole('link', {name: /finished books/i}).click()
    })

    cy.findByRole('main').within(() => {
      cy.findAllByRole('listitem').should('have.length', 0)
    })
  })
})
