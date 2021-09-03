const express = require('express')
const route = express.Router()
const fs = require('fs')
const apiGmail = require('./../api/gmail')
let oAuth2Client = ''

let profileUser = { name: '', imgProfile: '', email: '' }
let messagesContent = []

fs.readFile('./src/server/api/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err)
  oAuth2Client = apiGmail.authorize(JSON.parse(content))
})

route.get('/', (request, response) => {
  let url = apiGmail.getUrlToken(oAuth2Client)
  response.render('login-google', { title: 'Access Google', urlAccessGoogle: url })
})

route.get('/code-google', (request, response) => {
  response.render('verify-google', { title: 'Verify Google' })
})

route.post('/verify-code', (request, response) => {
  apiGmail.getNewToken(oAuth2Client, request.body.code, response, response => {
    response.redirect('/login')
  })
})

route.get('/login', (request, response) => {
  fs.readFile('./src/server/api/token.json', (err, token) => {
    if (err) {
      return response.redirect('/')
    }
    response.render('login', { title: 'Login' })
  })
})

route.post('/entry-inbox', (request, response) => {
  fs.readFile('./src/server/api/token.json', (err, token) => {
    if (err) {
      return response.redirect('/')
    }
    profileUser.name = request.body.name
    profileUser.imgProfile = request.body.imgProfile
    oAuth2Client.setCredentials(JSON.parse(token))
    apiGmail.getRecentEmail(oAuth2Client, response, 'INBOX', (messages, response) => {
      messagesContent = messages
      response.redirect('/inbox')
    })
  })
})

route.get('/inbox', (request, response) => {
  fs.readFile('./src/server/api/token.json', (err, token) => {
    if (err) {
      return response.redirect('/')
    }
    oAuth2Client.setCredentials(JSON.parse(token))
    apiGmail.getUserEmail(oAuth2Client, res => {
      profileUser.email = res
    })
    response.render('inbox', {
      title: 'Inbox',
      userProfile: profileUser,
      messages: messagesContent.sort((a, b) => {
        return a.Date.getTime() + b.Date.getTime()
      })
    })
  })
})

route.post('/send-email', (request, response) => {
  fs.readFile('./src/server/api/token.json', (err, token) => {
    if (err) {
      return response.redirect('/')
    }
    oAuth2Client.setCredentials(JSON.parse(token))
    apiGmail.sendMessage(oAuth2Client, request, profileUser.email, response, (response) => {
      response.redirect('/inbox')
    })
  })
})

module.exports = route
