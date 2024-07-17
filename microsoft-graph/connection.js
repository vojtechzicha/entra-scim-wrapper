const { ENTRA_TENANT_ID, ENTRA_CLIENT_ID, ENTRA_CLIENT_SECRET } = process.env

if (!ENTRA_TENANT_ID) throw new Error('Missing Entra Tenant ID in environment variables.')
if (!ENTRA_CLIENT_ID) throw new Error('Missing Entra Tenant Key in environment variables.')
if (!ENTRA_CLIENT_SECRET) throw new Error('Missing AWS Region setting in environment variables.')
const tenantId = ENTRA_TENANT_ID
const clientId = ENTRA_CLIENT_ID
const clientSecret = ENTRA_CLIENT_SECRET

const token = await getToken(tenantId, clientId, clientSecret)

const newFetch = async (url, options = {}) => {
  const headers = options.headers || new Headers()
  headers.append('Authorization', `Bearer ${token}`)
  options.headers = headers

  console.log(`-- SEND >>> `, url, options.headers, options.body)
  const res = await fetch(url, options)
  console.log(`-- RECV <<< `, res.status, res.statusText, res.headers)

  return res
}

export default newFetch

async function getToken(tenantId, clientId, clientSecret) {
  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/token`

  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')
  params.append('client_id', clientId)
  params.append('client_secret', clientSecret)
  params.append('resource', 'https://graph.microsoft.com')

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  const data = await response.json()

  if (typeof data.access_token !== 'string') throw new Error('Invalid token')
  return data.access_token
}
