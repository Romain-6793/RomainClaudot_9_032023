import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import BillsUI from '../views/BillsUI.js'
import Logout from "./Logout.js"


// Why is the class unnamed ?
// Where is the default export ?

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
    // $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'>
    // ${BillsUIErr}</div>`)
    // $('#modaleFile').find(".vertical-navbar").attr("class", "vertical-navbar-hidden")
    // $('#modaleFile').modal('show')
    const modal = $("#modaleFile");
    modal.find(".modal-body").html(`<div style='text-align: center;'>${BillsUIErr}</div>`);
    modal.find(".vertical-navbar").addClass("vertical-navbar-hidden");
    modal.show();
    modal.hide();

    return BillsUIErr
  }

  handleClickIconEye = (icon) => {

    // for an icon x clicked, you're gonna get its url by getAttribute.
    // the width of the image is formated by the Math.floor method.

    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)

    console.log(icon)
    console.log(billUrl)

    // const billName = $('#file-name-admin').attr("data-bill-filename")

    // The following lines are written with jQuery, it modifies the content of a modal and displays it

    // First, the element with the ID "modaleFile" is selected, then are searched every element 
    // having the modal-body className inside. Then a new string is generated with a div and an img
    // inside. Here we use our two const : billUrl and imgWidth.

    // Finally, we display the modal element, that was masked before, 
    // by calling the modal('show') method on the selected element with the "modaleFile" ID.

    $('#modaleFile').find(".modal-body")
      .html(`<div style='text-align: center;' class="bill-proof-container">
    <img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
    if (billUrl.includes("null")) {
      this.handleBillErr()
    }

    // No jQuery Version

    // const modaleFile = document.querySelector('#modaleFile');

    // const modalBody = modaleFile.querySelector('.modal-body');

    // const container = document.createElement('div');
    // container.classList.add('bill-proof-container');
    // container.style.textAlign = 'center';

    // const image = document.createElement('img');
    // image.width = imgWidth;
    // image.src = billUrl;
    // image.alt = 'Bill';

    // container.appendChild(image);
    // modalBody.appendChild(container);

    // modaleFile.classList.add('show');

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
          const bills = snapshot.sort((a, b) => new Date(b.date) - new Date(a.date)).map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch (e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e, 'for', doc)
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
