const express = require('express')
const path = require('path')
const http = require('http')
const bodyParser = require('body-parser')

const app = express()
const server = http.createServer(app)

app.set('port', process.env.PORT || 5000)
app.set('views', path.join(__dirname, '../public/views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

app.use('/', require('./routes/route'))

server.listen(app.get('port'), () => {
  console.log('http://localhost:5000')
})
