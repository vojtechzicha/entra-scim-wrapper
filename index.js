import SCIMMY from 'scimmy'
import SCIMMYRouters from 'scimmy-routers'
import express from 'express'
import { compileFilter, compileSorter } from 'scim-query-filter-parser'

import { getAllUsers } from './microsoft-graph/getAllUsers.js'
import { getUser } from './microsoft-graph/getUser.js'
import { createUser } from './microsoft-graph/createUser.js'
import { updateUser } from './microsoft-graph/updateUser.js'

const app = express()

const resDotSendInterceptor = (res, send) => content => {
  res.contentBody = content
  res.send = send
  res.send(content)
}

const requestLoggerMiddleware =
  ({ logger }) =>
  (req, res, next) => {
    logger('RECV <<<', req.method, req.url, req.hostname, req.headers, req.body)
    res.on('finish', () => {
      logger('SEND >>>', res.statusCode, res.statusMessage, res.getHeaders(), res.contentBody)
    })
    res.send = resDotSendInterceptor(res, res.send)
    next()
  }

app.use(requestLoggerMiddleware({ logger: console.log }))

SCIMMY.Resources.declare(SCIMMY.Resources.User)
  .ingress(async (resource, data) => {
    console.log('ingress')
    if (data.id === undefined && data.userName === undefined) throw new Error('Invalid data')

    const user = await getUser(data.id || data.userName)

    if (user !== null) {
      console.log('User exists:', data.userName)
      return await updateUser(user.id, data)
    } else {
      console.log('Creating user')
      return await createUser(data)
    }
  })
  .egress(async resource => {
    console.log('egress')
    let users = await getAllUsers()

    if (resource.filter !== undefined) users = users.filter(compileFilter(resource.filter.expression))

    if (resource?.constraints?.sortBy !== undefined) {
      const sorter = compileSorter(resource.constraints.sortBy)
      users.sort((a, b) => (resource.constraints.sortOrder !== 'descending' ? sorter(a, b) : sorter(b, a)))
    }

    if (resource?.constraints?.count !== undefined || resource?.constraints?.startIndex !== undefined) {
      const startIndex = Math.max(resource.constraints.startIndex || 1, 1) - 1
      const count = Math.max(resource.constraints.count || Number.MAX_SAFE_INTEGER, users.length - startIndex + 1)
      users = users.slice(startIndex, startIndex + count)
    }

    return users
  })
  .degress(resource => {
    console.log('User deleted:', resource)
  })

app.use(
  process.env.SCIM_PREFIX_URL || '/scim/v2',
  new SCIMMYRouters({
    type: 'bearer',
    docUri: 'https://example.com',
    handler: request => {
      return 'user-id'
    }
  })
)

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port', process.env.PORT || 3000)
})
