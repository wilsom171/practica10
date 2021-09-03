const apiGmail = {}

const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')

// If modifying these scopes, delete token.json.
// const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.send']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './src/server/api/token.json'

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
apiGmail.authorize = (credentials, callback) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0])

  return oAuth2Client
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

apiGmail.getUrlToken = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })

  return authUrl
}

apiGmail.getNewToken = (oAuth2Client, code, response, callback) => {
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err)
    oAuth2Client.setCredentials(token)
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err)
      callback(response)
      console.log('Token stored to', TOKEN_PATH)
    })
  })
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
apiGmail.listLabels = (auth, response, callback) => {
  const gmail = google.gmail({ version: 'v1', auth })
  gmail.users.labels.list({ userId: 'me' }, (err, res) => {
    if (err) console.log('The API returned an error: ' + err)
    const labels = res.data.labels
    if (labels.length) {
      callback(labels, response)
    } else {
      console.log('No labels found.')
    }
  })
}

apiGmail.getRecentEmail = (auth, response, label, callback) => {
  // Only get the recent email - 'maxResults' parameter
  const gmail = google.gmail({ version: 'v1', auth })
  let messagesList = []
  gmail.users.messages.list({ auth: auth, userId: 'me', labelIds: [label] }, function (err, responseDataList) {
    if (err) {
      console.log('The API returned an error: ' + err)
      return
    }
    // Get the message id which we will need to retreive tha actual message next.
    let index = 0
    if (responseDataList.data.resultSizeEstimate === 0) {
      callback([], response)
    } else {
      responseDataList['data']['messages'].map(message => {
        let messageArray = {}
        let message_id = message['id']

        gmail.users.messages.get({ auth: auth, userId: 'me', id: message_id, format: 'metadata', metadataHeaders: ['To', 'From', 'Date', 'Subject'] }, function (err, responseData) {
          if (err) {
            console.log('The API returned an error: ' + err)
            return
          }
          index++
          messageArray['id'] = responseData.data.id
          messageArray['snippet'] = responseData.data.snippet
          messageArray['labelIds'] = responseData.data.labelIds
          messageArray[responseData.data.payload.headers[0].name] = responseData.data.payload.headers[0].value
          messageArray[responseData.data.payload.headers[1].name] = responseData.data.payload.headers[1].value
          messageArray[responseData.data.payload.headers[2].name] = responseData.data.payload.headers[2].value
          messageArray[responseData.data.payload.headers[3].name] = responseData.data.payload.headers[3].value
          messageArray['Date'] = new Date(messageArray['Date'])
          messagesList.push(messageArray)

          if (index === responseDataList['data']['messages'].length) {
            callback(messagesList, response)
          }
        })
      })
    }
  })
}

apiGmail.makeBody = (to, from, subject, message) => {
  let str = ['Content-Type: text/plain; charset=\'UTF-8\'\n',
    'MIME-Version: 1.0\n',
    'Content-Transfer-Encoding: 7bit\n',
    'to: ', to, '\n',
    'from: ', from, '\n',
    'subject: ', subject, '\n\n',
    message
  ].join('')

  let encodedMail = new Buffer(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
  return encodedMail
}

apiGmail.sendMessage = (auth, request, email, response, callback) => {
  let raw = apiGmail.makeBody(request.body.to, email, request.body.subject, request.body.message)
  const gmail = google.gmail({ version: 'v1', auth })
  gmail.users.messages.send({
    auth: auth,
    userId: 'me',
    resource: {
      raw: raw
    }
  }, (err, res) => {
    if (err) return console.log(`Error ${err}`)
    callback(response)
  })
}

apiGmail.getUserEmail = (auth, callback) => {
  const gmail = google.gmail({ version: 'v1', auth })
  gmail.users.getProfile({ auth: auth, userId: 'me' }, (err, res) => {
    if (err) return console.log(`Error ${err}`)
    callback(res.data.emailAddress)
  })
}

module.exports = apiGmail
