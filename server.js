const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const Fintoc = require('fintoc');
const moment = require('moment');
const cors = require('cors');

const corsOptions ={
  origin:'*', 
};


dotenv.config();
let linkToken = '';

const fintoc = new Fintoc('sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6');
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(cors(corsOptions));

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

app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const event = request.body;
  
  // Add idempotency using the ORM being used by your app.
  // MORE SHIT ADDED
  console.log("THIS IS IT DUDE",event.data)
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

app.get('/api/getit', async (req, res) => {
  try {
    res.json({gotit:"Fam"});
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
