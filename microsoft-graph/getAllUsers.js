import fetch from './connection.js'
import { mapMicrosoftToScim } from './scimMappers.js'

export async function getAllUsers() {
  let value = [],
    response = null,
    link = 'https://graph.microsoft.com/v1.0/users'

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

  return value.map(mapMicrosoftToScim)
}
