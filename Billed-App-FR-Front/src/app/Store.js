// This store set the rules to interact with an api


// This async function returns a different value if the response status is ok or not
const jsonOrThrowIfError = async (response) => {
  if (!response.ok) throw new Error((await response.json()).message)
  return response.json()
}

// The Api class is the API
// The jsonOrThrowIfError and the getHeaders async methods are here to manage the headers and the responses.

class Api {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }
  // These async methods are the formated api CRUD methods
  async get({ url, headers }) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, { headers, method: 'GET' }))
  }
  async post({ url, data, headers }) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, { headers, method: 'POST', body: data }))
  }
  async delete({ url, headers }) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, { headers, method: 'DELETE' }))
  }
  async patch({ url, data, headers }) {
    return jsonOrThrowIfError(await fetch(`${this.baseUrl}${url}`, { headers, method: 'PATCH', body: data }))
  }
}

const getHeaders = (headers) => {
  const h = {}

  // If it requires Content-Type or Authorization

  if (!headers.noContentType) h['Content-Type'] = 'application/json'
  const jwt = localStorage.getItem('jwt')
  if (jwt && !headers.noAuthorization) h['Authorization'] = `Bearer ${jwt}`
  return { ...h, ...headers }
}

// ApiEntity is a specific entity of the api

class ApiEntity {
  constructor({ key, api }) {
    this.key = key;
    this.api = api;
  }
  async select({ selector, headers = {} }) {
    return await (this.api.get({ url: `/${this.key}/${selector}`, headers: getHeaders(headers) }))
  }
  async list({ headers = {} } = {}) {
    return await (this.api.get({ url: `/${this.key}`, headers: getHeaders(headers) }))
  }
  async update({ data, selector, headers = {} }) {
    return await (this.api.patch({ url: `/${this.key}/${selector}`, headers: getHeaders(headers), data }))
  }
  async create({ data, headers = {} }) {
    return await (this.api.post({ url: `/${this.key}`, headers: getHeaders(headers), data }))
  }
  async delete({ selector, headers = {} }) {
    return await (this.api.delete({ url: `/${this.key}/${selector}`, headers: getHeaders(headers) }))
  }
}

// The store manages the different entities : user, users, bill, bills.
// It manages as well the auth(login) and the ref

class Store {
  constructor() {
    this.api = new Api({ baseUrl: 'http://localhost:5678' })
  }

  user = uid => (new ApiEntity({ key: 'users', api: this.api })).select({ selector: uid })
  users = () => new ApiEntity({ key: 'users', api: this.api })
  login = data => this.api.post({ url: '/auth/login', data, headers: getHeaders({ noAuthorization: true }) })

  // ref creates a specific reference in the database 
  ref = (path) => this.store.doc(path)

  bill = bid => (new ApiEntity({ key: 'bills', api: this.api })).select({ selector: bid })
  bills = () => new ApiEntity({ key: 'bills', api: this.api })
}

export default new Store()