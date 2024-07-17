import fetch from './connection.js'
import { getGroup } from './getGroup.js'
import { mapScimGroupToMicrosoft, mapMicrosoftGroupToScim } from './scimMappers.js'

export async function updateGroup(id, scimGroup) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/groups('${encodeURIComponent(id)}')`, {
    method: 'PATCH',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(mapScimGroupToMicrosoft(scimGroup))
  })

  if (response.status < 200 || response.status >= 300) {
    throw new Error('Unknown error')
  }

  return mapMicrosoftGroupToScim(await getGroup(id))
}
