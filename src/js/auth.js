export function setBasicAuthHeader (service, credentials) {
  if (service && credentials) {
    localStorage.setItem(`${service}:basic`, credentials)
  }
}

export function setTokenAuthHeader (service, token) {
  if (service && token) {
    localStorage.setItem(`${service}:token`, token)
  }
}

export function getBasicAuthHeader (service) {
  const credentials = localStorage.getItem(`${service}:basic`)

  if (credentials) { return `Basic ${credentials}` }
}

export function getTokenAuthHeader (service) {
  const token = localStorage.getItem(`${service}:token`)

  if (token) { return `token ${token}` }
}
