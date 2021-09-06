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
  Users[id] = []

  if (request.url.startsWith('/net/host')) {
    Host(id, socket, request)
  } else {
    Join(id, socket, request)
  }

  socket.on('close', () => {
    for (let realm of Users[id]) {
      Realms[realm].delete(id)
    }
    delete Users[id]
  })
})

const EMP = {
  ROOM_ID: 1,
}

function Host(id, socket, request) {
  console.log('host', id)
  // see if our roomId is availble
  socket.send(new Int32Array([EMP.ROOM_ID]))
  // if not, create a new one
  socket.on('message', (ws, data) => {})
}

function Join(id, socket, request) {
  console.log('join', id)
  socket.on('message', (ws, data) => {})
}
