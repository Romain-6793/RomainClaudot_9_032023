/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js"
import { mockedBills } from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI({ error: null })
      document.body.innerHTML = html
      //to-do write assertion
    })
    describe("When I change the file to join to my form", () => {
      test("it should trigger no alert if it has the right extension", () => {

        // First we call the localStorage to simulate the fact that the user is connected

        localStorage.setItem("user", JSON.stringify({ email: "test@test.com" }))

        const jsdomAlert = window.alert;  // remember the jsdom alert
        window.alert = () => { };  // provide an empty implementation for window.alert

        // mockResolvedValueOnce allows me to simulate a promised resolved (.then)

        const createMock = jest.fn().mockResolvedValueOnce({ fileUrl: "http://test.com", key: "test-key" })

        // storeMock will allow me to call createMock, which is the mock of newBill.store.bills.create
        // by using create the storeMock is simulating the post method

        const storeMock = { bills: jest.fn(() => ({ create: createMock })) };

        // we pass the file as a value of the files property of the inputMock object

        const file = new File(["file content"], "test.png", { type: "image/png" });
        const inputMock = { value: "C:\\fakepath\\test.png", files: [file] };
        const alertMock = jest.spyOn(window, "alert");
        const preventDefaultMock = jest.fn();

        const newBill = new NewBill({
          document,
          store: storeMock,
        });

        // here we call handleChangeFile, with a target value and a preventDefault, to simulate
        // the function with the value we set above

        const mockHCF = jest.fn(newBill.handleChangeFile({
          target: inputMock,
          preventDefault: preventDefaultMock
        }))

        mockHCF()


        // Finally we test two things, 1) If the alert hasn't been called
        // 2) If the functions triggered by handleChange file are called


        expect(alertMock).not.toHaveBeenCalled();

        expect(preventDefaultMock).toHaveBeenCalled();
        expect(storeMock.bills).toHaveBeenCalled();
        expect(createMock).toHaveBeenCalled()
        window.alert = jsdomAlert;  // restore the jsdom alert
      });
      test("it should show an alert and reset input value when file has a wrong extension", () => {

        const jsdomAlert = window.alert;  // remember the jsdom alert
        window.alert = () => { };  // provide an empty implementation for window.alert

        // by using create the storeMock is simulating the post method

        const storeMock = { bills: jest.fn(() => ({ create: jest.fn() })) };

        const inputMock = { value: "C:\\fakepath\\test.txt", files: [new File(["file content"], "test.txt", { type: "text/plain" })] };
        const preventDefaultMock = jest.fn();
        const alertMock = jest.spyOn(window, "alert");


        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
          document,
          store: storeMock,
          onNavigate: onNavigate,
        });

        newBill.handleChangeFile({ target: inputMock, preventDefault: preventDefaultMock });

        // We check if the post method has been called, if not, it means that we did not have the right 
        // extension
        // It also means that the alert is to be triggered and the inputMock is to be set to null.

        expect(preventDefaultMock).toHaveBeenCalled();
        expect(storeMock.bills).not.toHaveBeenCalled();
        expect(alertMock).toHaveBeenCalledWith(
          "Nous sommes désolés, votre justificatif n'est pas valide. Veuillez choisir un fichier avec une extension .png, .jpg ou .jpeg"
        );
        expect(inputMock.value).toBe(null);
        window.alert = jsdomAlert;  // restore the jsdom alert
      });
    });
    describe('When the form is submitted', () => {
      test('then I should be redirected to Bills page', () => {

        // First we call the localStorage to simulate the fact that the user is connected

        localStorage.setItem("user", JSON.stringify({ email: "test@test.com" }))

        document.body.innerHTML = NewBillUI({ error: null })

        const preventDefaultMock = jest.fn();

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
          document,
          onNavigate: onNavigate,
        });

        const handleSubmit = jest.fn(newBill.handleSubmit({
          preventDefault: preventDefaultMock,
          target: screen.getByTestId('form-new-bill')
        }))

        handleSubmit()

        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})

///////////////////////////////////////////////////////////////////////////////////////////////////

// POST integration test
describe("Given I am a user connected as Employee", () => {
  describe("When I submit a new document", () => {
    test("it should create a file from mock API POST", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      document.body.innerHTML = NewBillUI({ error: null })

      const createSpy = jest.spyOn(mockedBills, "create")
      const postedFile = await mockedBills.create()

      expect(createSpy).toHaveBeenCalledTimes(1)

      expect(postedFile.fileUrl).toBe("https://localhost:3456/images/test.jpg")
      expect(postedFile).toBeTruthy()

    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockedBills, "create")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
      })
      test("fails to create file and throws error 404", async () => {

        mockedBills.create.mockImplementationOnce(() => {
          return Promise.reject(new Error("Erreur 404"))
        })

        const html = NewBillUI({ error: "Erreur 404" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
        await expect(mockedBills.create()).rejects.toThrow('Erreur 404')

      })
      test("fails to create file and throws error 500", async () => {

        mockedBills.create.mockImplementationOnce(() => {
          return Promise.reject(new Error("Erreur 500"))
        })

        const html = NewBillUI({ error: "Erreur 500" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
        await expect(mockedBills.create()).rejects.toThrow('Erreur 500')

      })

    })
  })


})


