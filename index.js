require('dotenv').config();
var qs = require('qs');
const axios = require('axios');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
let accToken = '';

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.get('/auth', (req, res) => {
  res.redirect(
    `https://login.salesforce.com/services/oauth2/authorize?client_id=${process.env.CONNECTED_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&response_type=code`,
  );
});

app.get('/oauthcallback', ({ query: { code } }, res) => {
 
  const body = qs.stringify({
    client_id: process.env.CONNECTED_CLIENT_ID,
    client_secret: process.env.CONNECTED_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URL,
    code,
  });
  console.log(code);
  const opts = { headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }};
  axios
    .post('https://dentsuworldservices-8b-dev-ed.my.salesforce.com/services/oauth2/token', body, opts)
    .then((_res) => _res.data.access_token)
    .then((token) => {
      // eslint-disable-next-line no-console
      console.log('My token:', token);
      accToken = token;
      res.redirect(`/?token=${token}`);
    })
    .catch((err) => res.status(500).json({ err: err.message + code }));
});

app.post('/datasubmit', (req, res) => {
  const authOpts = { headers: {
    'Content-Type': 'application/json',
    'Authorization' : 'Bearer '+accToken
  }};
  console.log(authOpts);
  const formdata = {
    "Salutation": req.body.Salutation,
    "FirstName": req.body.FirstName,
    "LastName": req.body.LastName,
    "Company": req.body.Company,
    "Title": req.body.Title,
    "Phone": req.body.Phone,
    "Email": req.body.Email,
    "LeadSource": req.body.LeadSource,
    "Status": req.body.Status,
    "ProductInterest__c": req.body.ProductInterest__c,
  };
  console.log(formdata);
  
  axios.post("https://dentsuworldservices-8b-dev-ed.my.salesforce.com/services/data/v54.0/sobjects/Lead", formdata, authOpts)
  .then((resp) => {
    res.redirect(`/?id=${resp.data.id}`);
  })
    .catch((err) => res.status(500).json({ err: err.message}));
});
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
// eslint-disable-next-line no-console
console.log('App listening on port 3000');
