
const bodyParser = require('body-parser');
const Fintoc = require('fintoc');
const moment = require('moment');
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

const corsOptions ={
  origin:'*', 
};
const port = process.env.PORT || 5000;


app.use(cors(corsOptions));
app.use(express.json());
app.use(require("./routes/record"));

const dbo = require("./db/conn");


let linkToken = '';
let safeToken = '';
const fintoc = new Fintoc('sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6');
 

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use(bodyParser.json());



app.get('/api/accounts', async (req, res) => {
  try {
    const link = await fintoc.getLink(linkToken);
    const accounts = link.findAll({ type_: 'checking_account' });
    res.json(accounts);
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

app.get('/api/accounts/:accountId/movements', async (req, res) => {
  try {
    const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
    const link = await fintoc.getLink(linkToken);
    const account = link.find({ id_: req.params.accountId });
    const lastMonthMovements = await account.getMovements({ since: startOfMonth });
    res.json(lastMonthMovements);
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

app.post('/api/link_token', (req, res) => {
  linkToken = req.body.data.link_token;
  console.log("Link Token", linkToken);
  res.send('Post request to /api/link_token');
});


function insertLinkToken(obj){
  let db_connect = dbo.getDb();

  db_connect.collection(CUSTOMERS_TABLE+"/tokens").insertOne(obj, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
}

app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const event = request.body;
  
  insertLinkToken(event.data)
  // Add idempotency using the ORM being used by your app.
  // MORE SHIT ADDED
  console.log("Link Token Generated",event.data);
  safeToken=event.data.link_token;
  // Handle the event
  switch (event.type) {
    case 'link.credentials_changed':
      linkToken = event.data.id;
      // Then define and call a method to handle the ceredentilas changed event.
      break;
    case 'link.refresh_intent.succeeded':
      linkToken = event.data.id;
      // Then define and call a method to handle the link refreshed event.
      break;
    case 'account.refresh_intent.succeeded':
      const accountId = event.data.id;
      // Then define and call a method to handle the account refreshed event.
      break;
    // ... handle other event types
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
});

app.get('/api/safeToken', async (req, res) => {
  try {
    console.log("safe token",safeToken)
    res.json({secret: safeToken});
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

app.get('/api/getit', async (req, res) => {
  try {
    res.json({gotit:"Fam"});
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

app.listen(port, () => {
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
 
  });
  console.log(`Server is running on port: ${port}`);
});


