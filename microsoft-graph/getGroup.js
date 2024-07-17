import fetch from './connection.js'

export async function getGroup(id) {
  const data = await (await fetch(`https://graph.microsoft.com/v1.0/groups('${encodeURIComponent(id)}')`)).json()
  if (data?.error?.code === 'Request_ResourceNotFound') {
    return null
  } else if (data.error !== undefined) {
    throw new Error('Unknown error')
  } else {
    return data
  }
}
