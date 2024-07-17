import SCIMMY from 'scimmy'
import SCIMMYRouters from 'scimmy-routers'
import express from 'express'

import { getAllUsers } from './microsoft-graph/getAllUsers.js'
import { getUser } from './microsoft-graph/getUser.js'
import { createUser } from './microsoft-graph/createUser.js'
import { updateUser } from './microsoft-graph/updateUser.js'

import { getAllGroups } from './microsoft-graph/getAllGroups.js'

import egressHandler from './scim/egressHandler.js'

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
  .ingress(async (_, data) => {
    console.log('user ingress', data)
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
    console.log('user egress', resource.id)

    const users = await getAllUsers()

    return await egressHandler(users, resource)
  })
  .degress(resource => {
    console.log('user degress', resource.id)
  })

SCIMMY.Resources.declare(SCIMMY.Resources.Group).egress(async resource => {
  console.log('group egress', resource.id)

  const groups = await getAllGroups()

  return await egressHandler(groups, resource)
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
