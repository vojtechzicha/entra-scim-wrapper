import fetch from './connection.js'
import { getUser } from './getUser.js'
import { mapScimUserToMicrosoft, mapMicrosoftUserToScim } from './scimMappers.js'

export async function updateUser(id, scimUser) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/users('${encodeURIComponent(id)}')`, {
    method: 'PATCH',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(mapScimUserToMicrosoft(scimUser))
  })

  if (response.status < 200 || response.status >= 300) {
    throw new Error('Unknown error')
  }

  return mapMicrosoftUserToScim(await getUser(id))
}
