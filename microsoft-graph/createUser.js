import fetch from './connection.js'
import { mapScimUserToMicrosoft, mapMicrosoftUserToScim } from './scimMappers.js'

export async function createUser(scimUser) {
  const response = await (
    await fetch('https://graph.microsoft.com/v1.0/users', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        ...mapScimUserToMicrosoft(scimUser),
        passwordProfile: { forceChangePasswordNextSignIn: true, password: 'asdf1234!' } // TODO: move to env variable
      })
    })
  ).json()

  if (response.error !== undefined) {
    console.error(response.error)
    throw new Error('Unknown error')
  }

  return mapMicrosoftUserToScim(response)
}
