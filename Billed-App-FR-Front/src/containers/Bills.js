import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import BillsUI from '../views/BillsUI.js'
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    // Here, see the Logout instance as an event, that clears localStorage and redirects
    // to the Login page.
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
    // redirects to the NewBill page.
  }

  handleBillErr = () => {
    const BillsUIErr = BillsUI({
      data: null,
      loading: false,
      error: "Nous n'avons pas pu trouver le justificatif"
    })
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'>
    ${BillsUIErr}</div>`)
    $('#modaleFile').find(".vertical-navbar").attr("class", "vertical-navbar-hidden")
    if (typeof $('#modaleFile').modal === 'function') $('#modaleFile').modal('show')
  }

  handleClickIconEye = (icon) => {

    // for an icon x clicked, you're gonna get its url by getAttribute.
    // the width of the image is formated by the Math.floor method.

    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)

    // The following lines are written with jQuery, it modifies the content of a modal and displays it

    // First, the element with the ID "modaleFile" is selected, then are searched every element 
    // having the modal-body className inside. Then a new string is generated with a div and an img
    // inside. Here we use our two const : billUrl and imgWidth.

    // Finally, we display the modal element, that was masked before, 
    // by calling the modal('show') method on the selected element with the "modaleFile" ID.

    $('#modaleFile').find(".modal-body")
      .html(`<div style='text-align: center;' class="bill-proof-container">
    <img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    if (typeof $('#modaleFile').modal === 'function') $('#modaleFile').modal('show')
    if (billUrl.includes("null")) {
      this.handleBillErr()
    }
  }

  getBills = () => {
    if (this.store) {
      return this.store
        // bills is the method of the store object (itself a property of the "this" object) that returns
        // a list of bills.
        .bills()
        // The list function is called to get a snapshot of the bills
        .list()
        .then(snapshot => {
          const bills = snapshot.sort((a, b) => new Date(a.date) - new Date(b.date)).map(doc => {
            // const bills = snapshot.map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status),
                numberDate: Number(doc.date),
              }
            } catch {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              (err) => console.error(err)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          return bills
        })
    }
  }
}
