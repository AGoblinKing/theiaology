// respond to post requests registering/deregistering bifrosts

const bifrosts = {}

const express = require('express')

import { CARTOGRAPHER } from './ports'

const app = express()

app.use(express.json())

app.get('*', (_, res) => res.json({ hello: 'world' }))
app.post('*', (req, res) => {
  res.json(req.body)
})

app.listen(CARTOGRAPHER, () => {
  console.log(`Example app listening at http://localhost:${CARTOGRAPHER}`)
})
