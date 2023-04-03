const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/bye', (req, res) => {
    res.send('See You Again!')
  })

app.get('/daus', (req, res) => {
    res.send('Daus Kepam!')
  })
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})