import fetch from './connection.js'
import { mapMicrosoftGroupToScim } from './scimMappers.js'

export async function getAllGroups() {
  let value = [],
    response = null,
    link = 'https://graph.microsoft.com/v1.0/groups'

  while (link !== null) {
    response = await fetch(link)
    const currentValue = await response.json()

    value = value.concat(currentValue.value)

    if (currentValue['@odata.nextLink'] !== undefined) {
      link = currentValue['@odata.nextLink']
    } else {
      link = null
    }
  }

  return value.map(mapMicrosoftGroupToScim)
}
