import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"
import DashboardUI from '../views/DashboardUI.js'

// The Dashboard concerns the admin.

// Here is the function filteredBills, first, it checks if data exists and if it is not an empty array,
// otherwise it should return an empty array.
// Second, if it exists and has length, it should filter by status. I-e render a new array with the 
// corresponding status.
// It also listens if the application is in prod environment.
// If so, the e-mail associated to the bills must be different than the USERS_TEST 
// emails or the userEmail stored in localStorage.

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

// Here we have the card component and the first and last names that are picked from the mail.

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
  <div class="card-wrapper">
    <label for='${bill.id}-check' class="card-label">
      <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
        <div class='bill-card-name-container'>
          <div class='bill-card-name'> ${firstName} ${lastName} </div>
          <span class='bill-card-grey'> ... </span>
          </div>
          <div class='name-price-container'>
          <span> ${bill.name} </span>
          <span> ${bill.amount} € </span>
          </div>
        <div class='date-type-container'>
          <span> ${formatDate(bill.date)} </span>
          <span> ${bill.type} </span>
        </div>
        </div>
    </label>
    <input type=checkbox id="${bill.id}-check" class="card-checkbox">
  </div>
  `)
}

// Here we have the cards, where we will see if there is data and length, then, for each bill
// a card (component above) will be mapped.
// The result is concatenated into a single string with no separators.

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    new Logout({ localStorage, onNavigate })
  }

  handleBillErr = () => {
    const DashboardUIErr = DashboardUI({
      data: null,
      loading: false,
      error: "Nous n'avons pas pu trouver le justificatif"
    })
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'>
    ${DashboardUIErr}</div>`)
    $('#modaleFileAdmin1').find(".vertical-navbar").attr("class", "vertical-navbar-hidden")
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const billName = $('#file-name-admin').attr("data-bill-filename")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
    if (billName === "null") {
      this.handleBillErr()
    }
  }

  handleEditTicket(e, bill, bills) {

    // Le premier this.id est undefined, puis this.id est toujours égal au bill.id précédent
    // this.id === bill.id seulement quand je change de liste puis reviens sur le même item
    // c'est là qu'est la clé
    // this.id === bill.id aussi quand je clique 2 fois sur le même item de la même liste

    const isChecked = document.getElementById(`${bill.id}-check`).checked

    if (!isChecked) {
      // The following lines purpose is to uncheck everything that is not the current bill
      $(`#${bill.id}-check`).on('change', function () {
        $(`.card-checkbox`).not(this).prop('checked', false);
      });
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      $('#icon-eye-d').click(this.handleClickIconEye)
      $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
      $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
    }
    else {

      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
    }
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index !== index) this.counter = 0
    if (this.index === undefined || this.index !== index) this.index = index
    if (this.counter % 2 === 0) {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' })
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))))
      this.counter++
    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' })
      $(`#status-bills-container${this.index}`)
        .html("")
      this.counter++
    }

    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })

    return bills

  }

  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          const bills = snapshot
            .map(doc => ({
              id: doc.id,
              ...doc,
              date: doc.date,
              status: doc.status
            }))
          return bills
        })
        .catch(error => {
          throw error;
        })
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then(bill => bill)
        .catch(() => { })
    }
  }
}
