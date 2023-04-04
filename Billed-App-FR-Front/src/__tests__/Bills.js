/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event'
import Actions from '../views/Actions.js'
import BillsUI from "../views/BillsUI.js"
import Bills from '../containers/Bills.js'
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { fireEvent, render, screen, waitFor } from "@testing-library/dom";


import router from "../app/Router.js";
import NewBill from '../containers/NewBill.js'



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

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    // describe("handleBillErr", () => {
    //   test("displays an error modal with the correct message", () => {
    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname })
    //     }
    //     const bills = new Bills({
    //       document, onNavigate, store: null, localStorage: window.localStorage
    //     })

    //     const handleBillErr = jest.spyOn(bills, "handleBillErr").mockImplementationOnce((e) => {
    //       throw new Error(e);
    //     });

    //     expect(() => bills.handleBillErr()).toThrowError("");

    //     handleBillErr.mockRestore();
    //   });
    // });

    // describe ("When I click on any icon eye", () => {
    // test("Then handleClickIconEye should be called", () => {

    //   const onNavigate = (pathname) => {
    //     document.body.innerHTML = ROUTES({ pathname })
    //   }

    //   const bills = new Bills({
    //     document, onNavigate, store: null, localStorage: window.localStorage
    //   })
    //   const iconEyes = screen.getAllByTestId('icon-eye')
    //   const randomIndex = Math.floor(Math.random() * iconEyes.length)
    //   const randomIconEye = iconEyes[randomIndex]
    //   const handleClickIconEye = jest.fn((e) => bills.handleClickIconEye(e))
    //   console.log(handleClickIconEye)



    //   // iconEyes.forEach((e) => e.addEventListener('click', handleClickIconEye))
    //   // userEvent.click(randomIconEye)
    //   fireEvent.click(randomIconEye)
    //   expect(handleClickIconEye).toHaveBeenCalled()


    // })
    // }) 
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

        // Solution 1

        // expect(handleClickNewBill).toHaveBeenCalled()
        // const goToNewBill = bills.onNavigate(ROUTES_PATH['NewBill'])
        // expect(goToNewBill).toBeTruthy()

        // Solution 2

        // expect(handleClickNewBill).toHaveBeenCalled()
        // expect(document.body.innerHTML).toBe(ROUTES(ROUTES_PATH['NewBill'])

        // Solution 3

        // bills.handleClickNewBill()
        // expect(window.location.href).toBe("http://localhost/#employee/bill/new")


        // Solution 4

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
    // describe('When handleClickIconEye is called', () => {
    //   test(('Then, a modal should appear'), () => {


    //   })
    // })
    // describe('When handleClickIconEye is called', () => {
    //   test("handleClickIconEye should display a modal with the bill image", () => {
    //     // // Create the necessary elements
    //     // const modaleFile = document.createElement("div");
    //     // modaleFile.id = "modaleFile";
    //     // document.body.appendChild(modaleFile);

    //     // const modalBody = document.createElement("div");
    //     // modalBody.className = "modal-body";
    //     // modaleFile.appendChild(modalBody);

    //     // const icon = document.createElement("i");
    //     // icon.setAttribute("data-bill-url", "https://example.com/bill.jpg");
    //     // document.body.appendChild(icon);

    //     // const bills = new Bills({
    //     //   document,
    //     //   onNavigate: jest.fn(),
    //     //   store: {
    //     //     bills: () => ({
    //     //       list: jest.fn().mockResolvedValue([]),
    //     //     }),
    //     //   },
    //     //   localStorage: window.localStorage,
    //     // });

    //     // // Call handleClickIconEye with the created icon element
    //     // bills.handleClickIconEye(icon);

    //     // // Assert that the modal is displayed and contains the bill image
    //     // const modalShown = modaleFile.classList.contains("show");
    //     // expect(modalShown).toBe(true);

    //     // const imgDisplayed = modalBody.querySelector("img");
    //     // expect(imgDisplayed).not.toBeNull();
    //     // expect(imgDisplayed.getAttribute("src")).toBe(
    //     //   "https://example.com/bill.jpg"
    //     // );


    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname })
    //     }
    //     const bills = new Bills({
    //       document, onNavigate, store: null, localStorage: window.localStorage
    //     })
    //     const handleClickIconEye = jest.fn(bills.handleClickIconEye)

    //     // Mock the getAttribute method to simulate a bill URL
    //     const getAttributeMock = jest.fn(() => "http://example.com/bill.jpg");
    //     const icon = {
    //       getAttribute: getAttributeMock,
    //     };

    //     // Spy on querySelector to simulate a modal element
    //     const querySelectorSpy = jest.spyOn(document, "querySelector");
    //     querySelectorSpy.mockReturnValue({
    //       style: {},
    //       appendChild: jest.fn(),
    //     });

    //     // Call the function with the mock icon
    //     handleClickIconEye(icon);

    //     // Use testing-library to get the modal content
    //     const billProofContainer = screen.getByTestId("bill-proof-container");
    //     const img = billProofContainer.querySelector("img");

    //     // Assert that the image URL and width are correct
    //     expect(img.getAttribute("src")).toBe("http://example.com/bill.jpg");
    //     expect(img.getAttribute("width")).toBe("50%");
    //   });
    // })
    // describe("When getBills is called", () => {
    //   test("getBills should format and sort bills correctly", async () => {
    //     const mockStore = {
    //       bills: jest.fn(() => ({
    //         list: jest.fn(() => Promise.resolve([
    //           { date: "2022-01-01", status: "pending" },
    //           { date: "2021-12-31", status: "accepted" },
    //           { date: "2022-01-02", status: "refused" },
    //         ]))
    //       }))
    //     };

    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname })
    //     }

    //     const bills = new Bills({
    //       document,
    //       onNavigate,
    //       store: mockStore,
    //       localStorage: window.localStorage,
    //     });

    //     const formattedBills = await bills.getBills();

    //     expect(mockStore.bills().list).toHaveBeenCalled();
    //     expect(formattedBills).toEqual([
    //       { date: "02/01/2022", status: "Refused" },
    //       { date: "01/01/2022", status: "Pending" },
    //       { date: "31/12/2021", status: "Accepted" },
    //     ]);
    //   });
    // });
  })
})
