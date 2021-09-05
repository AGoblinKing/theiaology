const express = require('express')
const fetch = require('node-fetch')

const app = express()

app.use((req, res, next) => {
  res.append('Cross-Origin-Opener-Policy', 'same-origin')
  res.append('Cross-Origin-Embedder-Policy', 'require-corp')
  next()
})

app.use(express.static('public'))

const proxy = (req, res, next) => {
  return fetch(`https://theiaology.com${req.originalUrl}`)
    .then((theia) => theia.arrayBuffer())
    .then((data) => {
      res.type('application/octet-stream').send(Buffer.from(data))
      next()
    })
}

app.get('/github*', proxy)
app.get('/bifrost*', proxy)

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
})

app.listen(10001, () => console.log('listening on port 10001'))
