const express = require('express')

const fetch = require('node-fetch')

function Proxy(base) {
  return (req, res, next) => {
    return fetch(`${base}${req.originalUrl}`)
      .then((theia) => theia.arrayBuffer())
      .then((data) => {
        res.send(Buffer.from(data))
        next()
      })
  }
}
const realms = {}
const sims = {}

const specialkey = 'dev'

let IDS = 0

async function Join(id, res, offer) {
  const data = await fetch(`http://${sims[id]}:8081/`, {
    method: 'POST',
    body: JSON.stringify(offer),
  })
  res.send(await data.json())
}

express()
  .use((req, res, next) => {
    res.append('Cross-Origin-Opener-Policy', 'same-origin')
    res.append('Cross-Origin-Embedder-Policy', 'require-corp')
    next()
  })
  .use(express.static('public'))
  .use(express.json())
  .get('/github*', Proxy('https://theiaology.com'))
  .post('/bifrost*', async (req, res) => {
    const msg = req.body

    switch (msg.message) {
      case 'list':
        res.send({
          message: 'LIST',
          realms: Object.values(realms),
        })
        return
      case 'create': {
        const { realm, ruler, secret } = msg
        const id = IDS++
        const k = Object.keys(sims)
        if (k.length === 0) {
          return res.send({
            message: 'CREATE',
            result: false,
            reason: 'No available sims.',
          })
        }
        const sim = k[Math.floor(k.length * Math.random())]
        realms[id] = { realm, ruler, sim, id }
        await Join(id, res, msg.offer)
        return
      }

      case 'join':
        // Check if server exists
        if (!realms[msg.id]) {
          return res.send({
            message: 'JOIN',
            result: false,
            reason: 'No such server',
          })
        }
        await Join(msg.id, res, msg.offer)
        return
    }

    // check special key
    if (msg.specialkey !== specialkey) {
      res.status(200).send({ message: 'OK' })
      return
    }

    switch (msg.message) {
      case 'SOLICIT':
        sims[msg.name] = req.ip
        console.log(`SOLICIT`, msg.name, req.ip)
        break
    }
  })
  .get('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
  })
  .listen(10001, () => console.log('listening on port 10001'))
