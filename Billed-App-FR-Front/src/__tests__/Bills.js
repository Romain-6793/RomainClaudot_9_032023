/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { screen, waitFor } from "@testing-library/dom";
import router from "../app/Router.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true);

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('Then getBills should return sorted and formatted bills', async () => {

      const mockStore = {

        // mockReturnThis allows to simulate this.bills from my Bills(class) store.
        // mockResolvedValueOnce allows to simulate an API call and to resolve it once.

        bills: jest.fn().mockReturnThis(),
        list: jest.fn().mockResolvedValueOnce([
          {
            date: "2022-02-02",
            status: "pending",
            // add other relevant properties here
          },
          {
            date: "2022-01-01",
            status: "accepted",
            // add other relevant properties here
          },

        ])
      };
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billManager = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const formattedBills = [{
        date: "1 Jan. 22", status: "Accepté",
      }, { date: "2 Fév. 22", status: "En attente", }];

      // call the function being tested
      const getBills = await billManager.getBills();

      // assert that the function returns an array
      expect(Array.isArray(getBills)).toBe(true);

      // assert that the array has the same length as the test data
      expect(getBills.length).toBe(2);

      // assert that each bill has a formatted date and status
      expect(getBills[0]).toEqual(formattedBills[1]);
      expect(getBills[1]).toEqual(formattedBills[0]);

      // assert that the store's bills and list methods were called
      expect(mockStore.bills).toHaveBeenCalled();
      expect(mockStore.list).toHaveBeenCalled();
    });
    describe("When handleBillErr is called", () => {
      test("it displays an error modal with the correct message", () => {

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
        const handleBillErr = jest.fn(bills.handleBillErr)
        handleBillErr()

        const errorMessage = screen.getByTestId('error-message').textContent

        expect(handleBillErr).toHaveBeenCalled()

        expect(errorMessage).toMatch("Nous n'avons pas pu trouver le justificatif")

      });
    });
    describe("When handleIconEye is called", () => {
      test("Then a modal window should be open", () => {

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })

        // Create a mock icon with a data-bill-url attribute
        const icon = document.createElement("div");
        icon.setAttribute("data-bill-url", "https://example.com/bill-proof.jpg");

        // Call the handleClickIconEye function with the mock icon
        bills.handleClickIconEye(icon);

        // Verify that the modal window is visible
        const modalWindow = screen.getByTestId("modalContent");
        expect(modalWindow).toBeVisible();

        // // Verify that the img element in the modal window has the expected width
        const imgElement = screen.getByAltText("Bill");

        // Verify that the img element in the modal window has the expected source URL
        expect(imgElement).toHaveAttribute("src", "https://example.com/bill-proof.jpg");

      })
      test("If the billUrl includes 'null' handleBillErr should be called", () => {

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })

        const handleBillErrMock = jest.spyOn(bills, "handleBillErr");
        const nullIcon = document.createElement("i");
        nullIcon.setAttribute("data-bill-url", "http://example.com/bill/null");

        // action
        bills.handleClickIconEye(nullIcon);

        // assertion
        expect(handleBillErrMock).toHaveBeenCalled();

      })
    })
    describe('When I click on the new bill button', () => {
      test(('Then, I should be sent to the new bill page'), () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
        const handleClickNewBill = jest.fn(bills.handleClickNewBill)
        const btnNewBill = screen.getByTestId('btn-new-bill')
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)
        const pathname = ROUTES_PATH['NewBill']
        const html = ROUTES({
          pathname,
          data: [],
          loading: false,
          error: null,
        })
        document.body.innerHTML = html
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()

      })
    })

  })
})
