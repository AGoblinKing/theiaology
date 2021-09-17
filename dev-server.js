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

express()
  .use((req, res, next) => {
    res.append('Cross-Origin-Opener-Policy', 'same-origin')
    res.append('Cross-Origin-Embedder-Policy', 'require-corp')
    next()
  })
  .use(express.static('public'))
  .get('/github*', Proxy('https://theiaology.com'))
  .get('/bifrost*', Proxy('http://localhost:8081'))
  .get('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
  })
  .listen(10001, () => console.log('listening on port 10001'))
