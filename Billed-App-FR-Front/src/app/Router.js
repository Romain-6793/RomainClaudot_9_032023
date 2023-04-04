import store from "./Store.js"
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"
import Bills from "../containers/Bills.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"

import BillsUI from "../views/BillsUI.js"
import DashboardUI from "../views/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

export default () => {

  // Here is the router. It will render specific innerHTML in the root div depending on the route you use.
  // With rootDiv down below we have the default HTML corresponding to the path "/"

  const rootDiv = document.getElementById('root')
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })

  // Down below we have the conditional render depending on the route used.

  console.log(window.history)

  window.onNavigate = (pathname) => {

    // "{}" empty object = state
    // pathname = unused
    // window.location.origin + pathname = url (new history's entry url)
    // The use of window.history.pushState is to push a new entry into the browser's history 
    // and as a result, update the displayed URL without refreshing the page.

    // "#0E5AE5"

    window.history.pushState(
      {},
      pathname,
      window.location.origin + pathname
    )

    // First series of conditions depending on the pathname

    if (pathname === ROUTES_PATH['Login']) {
      rootDiv.innerHTML = ROUTES({ pathname })
      console.log(rootDiv)
      document.body.style.backgroundColor = "pink"
      // when you log out, and you go back to Login
      new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })
    } else if (pathname === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      // Adds styles so the upper left layout icon is active
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      // Creates a new instance of Bills, stored in the const Bills
      const bills = new Bills({ document, onNavigate, store, localStorage })
      // Calls the getBills() method from the Bills class to modify the data with BillsUI
      bills.getBills().then(data => {
        rootDiv.innerHTML = BillsUI({ data })
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, store, localStorage })
        // Creates again a new Bills ??
      }).catch(error => {
        // In case of error, the html follows
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    } else if (pathname === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      console.log(rootDiv)
      // Here, an instance of NewBill is created just once and not in a method
      new NewBill({ document, onNavigate, store, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    } else if (pathname === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      console.log(rootDiv)
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        console.log(rootDiv)
        new Dashboard({ document, onNavigate, store, bills, localStorage })
        // Once again new Dashboard is created twince, once outside and once inside the method
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
        console.log(rootDiv)
      })
    }
  }

  // The window. onpopstate event is fired automatically by the browser when a user navigates between 
  // history states that a developer has set. This event is important to handle when you push to history 
  // object and then later retrieve information whenever the user presses the back/forward button of the 
  // browser.

  window.onpopstate = (e) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (window.location.pathname === "/" && !user) {
      // when after a logout, you click on previous.
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })
      console.log(rootDiv)
    }
    else if (user) {
      document.body.style.backgroundColor = "green"

      onNavigate(PREVIOUS_LOCATION)
    }
  }

  // Twice the same code, one after pushState, one after onpopstate, why ?

  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })
    document.body.style.backgroundColor = "red"
    // default, when you launch live server / when you open the navigator
  } else if (window.location.hash !== "") {
    if (window.location.hash === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      console.log(rootDiv)
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, store, localStorage })
      bills.getBills().then(data => {
        rootDiv.innerHTML = BillsUI({ data })
        console.log(rootDiv)
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, store, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
        console.log(rootDiv)
      })
    } else if (window.location.hash === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      console.log(rootDiv)
      new NewBill({ document, onNavigate, store, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    } else if (window.location.hash === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      console.log(rootDiv)
      const bills = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        console.log(rootDiv)
        new Dashboard({ document, onNavigate, store, bills, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
        console.log(rootDiv)
      })
    }
  }

  return null
}

