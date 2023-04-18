
import { ROUTES_PATH } from '../constants/routes.js'
export let PREVIOUS_LOCATION = ''

// we use a class so as to test its methods in e2e tests
export default class Login {
  constructor({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store }) {
    this.document = document
    this.localStorage = localStorage
    this.onNavigate = onNavigate
    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION
    this.store = store
    const formEmployee = this.document.querySelector(`form[data-testid="form-employee"]`)
    formEmployee.addEventListener("submit", this.handleSubmitEmployee)
    const formAdmin = this.document.querySelector(`form[data-testid="form-admin"]`)
    formAdmin.addEventListener("submit", this.handleSubmitAdmin)
  }

  /* istanbul ignore next */

  handleSubmitEmployee = e => {
    e.preventDefault()

    // First the user object is created to be set in the localStorage

    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="employee-password-input"]`).value,
      status: "connected"
    }
    this.localStorage.setItem("user", JSON.stringify(user))

    // Then a jwt token is created
    // If the auth fails, createUser is called with the user object as an argument
    // If the auth succeed, the user is redirected to Bills page, the login page is set as 
    // previous location, and the body style of the document is set.

    this.login(user)

      /* istanbul ignore next */

      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Bills']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        this.document.body.style.backgroundColor = "#fff"
      })

  }

  handleSubmitAdmin = e => {
    e.preventDefault()

    // First the user object is created to be set in the localStorage

    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`).value,
      password: e.target.querySelector(`input[data-testid="admin-password-input"]`).value,
      status: "connected"
    }
    this.localStorage.setItem("user", JSON.stringify(user))

    // Then a jwt token is created
    // If the auth fails, createUser is called with the user object as an argument
    // If the auth succeed, the user is redirected to Dashboard page, the login page is set as 
    // previous location, and the body style of the document is set.

    /* istanbul ignore next */

    this.login(user)
      .catch(
        (err) => this.createUser(user)
      )
      .then(() => {
        this.onNavigate(ROUTES_PATH['Dashboard'])
        this.PREVIOUS_LOCATION = ROUTES_PATH['Dashboard']
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION
        document.body.style.backgroundColor = "#fff"
      })
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  login = (user) => {
    if (this.store) {
      return this.store
        .login(JSON.stringify({
          email: user.email,
          password: user.password,
        })).then(({ jwt }) => {
          localStorage.setItem('jwt', jwt)
        })
    } else {
      return null
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  createUser = (user) => {
    if (this.store) {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split('@')[0],
            email: user.email,
            password: user.password,
          })
        })
        .then(() => {
          console.log(`User with ${user.email} is created`)
          return this.login(user)
        })
    } else {
      return null
    }
  }
}
