import fetch from './connection.js'
import { mapScimGroupToMicrosoft, mapMicrosoftGroupToScim } from './scimMappers.js'

export async function createGroup(scimGroup) {
  const response = await (
    await fetch('https://graph.microsoft.com/v1.0/groups', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        ...mapScimGroupToMicrosoft(scimGroup)
      })
    })
  ).json()

  if (response.error !== undefined) {
    console.error(response.error)
    throw new Error('Unknown error')
  }

  return mapMicrosoftGroupToScim(response)
}
