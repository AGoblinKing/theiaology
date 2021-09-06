const express = require('express')
const ws = require('ws')
const fetch = require('node-fetch')
const wss = new ws.Server({ noServer: true })

function Proxy(req, res, next) {
  return fetch(`https://theiaology.com${req.originalUrl}`)
    .then((theia) => theia.arrayBuffer())
    .then((data) => {
      res.send(Buffer.from(data))
      next()
    })
}

express()
  .use((req, res, next) => {
    res.append('Cross-Origin-Opener-Policy', 'same-origin')
    res.append('Cross-Origin-Embedder-Policy', 'require-corp')
    next()
  })
  .use(express.static('public'))
  .get('/github*', Proxy)
  .get('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
  })
  .listen(10001, () => console.log('listening on port 10001'))
  .on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (socket) => {
      wss.emit('connection', socket, request)
    })
  })

const RealmLog = {}
const Realms = {}
const Users = {}

let floatingId = 0

wss.on('connection', (socket, request) => {
  const id = floatingId++
  Users[id] = socket

  const [host, search] = request.url.split('?')
  const [, , hosting, realm] = host.split('/')

  const [publicity, realmId] = search.split('/')
  const idx = `${realm}/${publicity}/${realmId}`

  socket.send(new Int32Array([EMP.USER_ID, id]))
  if (hosting === 'host') {
    Host(id, socket, idx)
  } else {
    Join(id, socket, idx)
  }

  socket.on('close', () => {
    Realms[idx]?.delete(id)

    delete Users[id]
  })
})

// SYNC with src/realm/multiplayer
const EMP = {
  REALM_UPDATE: 0,
  USER_ID: 1,
  E404: 404,
}

function Host(id, socket, idx) {
  // set of buffers to stream
  RealmLog[idx] = []
  // Users
  Realms[idx] = new Set()

  // if not, create a new one
  socket.on('message', (data) => {
    RealmLog[idx].push(data)
    for (let u of Realms[idx]) {
      Users[u].send(data)
    }
  })

  socket.on('close', () => {
    delete RealmLog[idx]
    for (let u of Realms[idx]) {
      Users[u].close()
      delete Users[u]
    }
    delete Realms[idx]
  })
}

function Join(id, socket, idx) {
  if (!Realms[idx]) {
    socket.send(new Int32Array([EMP.E404]))
    socket.close()
    return
  }

  Realms[idx].add(id)
  for (let log of RealmLog[idx]) {
    socket.send(log)
  }

  socket.on('message', (ws, data) => {})
}
