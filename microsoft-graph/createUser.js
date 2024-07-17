import fetch from './connection.js'
import { mapScimToMicrosoft, mapMicrosoftToScim } from './scimMappers.js'

export async function createUser(scimUser) {
  const response = await (
    await fetch('https://graph.microsoft.com/v1.0/users', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        ...mapScimToMicrosoft(scimUser),
        passwordProfile: { forceChangePasswordNextSignIn: true, password: 'asdf1234!' }
      })
    })
  ).json()

  if (response.error !== undefined) {
    console.error(response.error)
    throw new Error('Unknown error')
  }

  return mapMicrosoftToScim(response)
}
