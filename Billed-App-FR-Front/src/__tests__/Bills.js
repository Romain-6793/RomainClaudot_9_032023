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

    ////////////////////////////////////////////////////////////////////////////////////////////////

    test('Then getBills should return sorted and formatted bills', async () => {

      // First, we simulate a store, in order to mock, the bills() and list() methods.

      const mockStore = {

        // mockReturnThis mocks the ApiEntity bills from the store as bills is an ApiEntity instance
        // mockedResolvedValueOnce mocks the list method (get method from the api entity),
        // Here, we simulate a successful api get request.

        // NB : the first two are relevant but from latest to earliest, so we have to sort them right
        // the third is to be rejected in order to test the "catch" option

        bills: jest.fn().mockReturnThis(),
        list: jest.fn().mockResolvedValueOnce([
          {
            date: "2022-02-02",
            numberDate: "2022-02-02",
            status: "pending",
            // ...
          },
          {
            date: "2022-01-01",
            numberDate: "2022-01-01",
            status: "accepted",
            // ...
          },
          {
            date: "rmflkùgldksùmfgk",
            numberDate: "rmflkùgldksùmfgk",
            status: "refused",
            // ...
          },
        ])
      };

      // Here we create billManager, the new Bills instance, we define its store as mockStore,
      // so we test the data we want

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billManager = new Bills({
        document,
        onNavigate,
        store: mockStore,
      })

      const formattedBills = [
        {
          date: "1 Jan. 22",
          numberDate: NaN,
          status: "Accepté",
        },
        {
          date: "2 Fév. 22",
          numberDate: NaN,
          status: "En attente",
        },
        {
          date: "rmflkùgldksùmfgk",
          numberDate: "rmflkùgldksùmfgk",
          status: "Refusé",
        }];

      // call the function being tested (with an await because my test implies an async function)
      const getBills = await billManager.getBills();

      // assert that the function returns an array
      expect(Array.isArray(getBills)).toBe(true);

      // assert that the array has the same length as the test data
      expect(getBills.length).toBe(3);

      // assert that each bill has a formatted date and status
      expect(getBills[0]).toEqual(formattedBills[0]);
      expect(getBills[1]).toEqual(formattedBills[1]);
      expect(getBills[2]).toEqual(formattedBills[2]);

      // The third couln't be sorted as it is not the right format

      // assert that the store's bills and list methods were called
      expect(mockStore.bills).toHaveBeenCalled();
      expect(mockStore.list).toHaveBeenCalled();
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////

    describe("When handleBillErr is called", () => {
      test("it displays an error modal with the correct message", () => {

        // First, we create an instance of bills

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bills = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage
        })

        // Then we mock handleBillErr and we call it

        const handleBillErr = jest.fn(bills.handleBillErr)
        handleBillErr()

        // Then we get the errorMessage with getByTestId

        const errorMessage = screen.getByTestId('error-message').textContent

        // We expect the function to have been called and we expect the error message to match 
        // the expected message

        expect(handleBillErr).toHaveBeenCalled()

        expect(errorMessage).toMatch("Nous n'avons pas pu trouver le justificatif")

      });
    });
    describe("When handleClickIconEye is called", () => {
      test("Then a modal window should be open", () => {

        // First, we create an instance of bills

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

      ////////////////////////////////////////////////////////////////////////////////////////////////

      test("If the billUrl includes 'null' handleBillErr should be called", () => {

        // First, we create an instance of bills

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })

        // We spy on handleBillErrMock to check if it has been called

        const handleBillErrMock = jest.spyOn(bills, "handleBillErr");

        // We create a "null icon" with an attribute data-bill-url including "null"

        const nullIcon = document.createElement("div");
        nullIcon.setAttribute("data-bill-url", "http://example.com/bill/null");

        // We call the function with nullIcon as a parameter

        bills.handleClickIconEye(nullIcon);

        // Since the function is called we expect the spied function to have been called
        expect(handleBillErrMock).toHaveBeenCalled();

      })
    })

    /////////////////////////////////////////////////////////////////////////////////////////////

    describe('When I click on the new bill button', () => {
      test(('Then, I should be sent to the new bill page'), () => {

        // First, we create an instance of bills

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bills = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })

        // Then we mock handleClickNewBill with jest.fn
        // We get the button by test Id and since it is clicked it triggers handleclickNewBill
        // We can check we are on the right page it with the text "Envoyer une note de frais"

        const handleClickNewBill = jest.fn(bills.handleClickNewBill)

        const btnNewBill = screen.getByTestId('btn-new-bill')
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()

      })
    })

  })
})
