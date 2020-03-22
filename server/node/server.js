const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const { resolve } = require("path");


app.use(express.json());

//Keep but ignore until the end
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    }
  })
);

app.get("/public-key", (req, res) => {
  res.send({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get('/my-products', (req, res) => {
  // Apparently for the async await to work the way I wanted it to
  // The async must be on the outer most function
  // We await to store the whole list, this way we only make one fetch
  // as opposed to fetching each loop of the map.
  // now that we have the whole list, we map existing data to existing data.
  // took about 17 hours to work out.
  stripe.skus.list({ limit: 10 }, async (err, skus) => {
    const products = await stripe.products.list({ limit: 10 })
    skus.data.map(sku => sku.product = products.data.filter(p => p.id === sku.product)[0])
    res.send(skus.data)
  })
})


app.post("/create-payment-intent", async (req, res) => {

  const body = req.body;

  // WE MUST calculate the total charge on the back end
  // Otherwise you get pwned on deploy.
  const skus = await stripe.skus.list({ limit: 10 })
  body.amount.forEach(item => {
    skus.data.forEach(sku => {
      if (item === sku.id) { body.amount[body.amount.indexOf(item)] = sku.price }
    })
  })

  const amount = body.amount.reduce((a, b) => a + b)

  const options = {
    ...body,
    amount: amount,
    currency: body.currency,
    receipt_email: body.receipt_email
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(options);
    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});



// Webhook handler for asynchronous events.
// Keep this, b/c eMail reciept can happen here
app.post("/webhook", async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers["stripe-signature"];

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }

  if (eventType === "payment_intent.succeeded") {
    // Fulfill any orders, e-mail receipts, etc
    console.log("💰 Payment received!");
  }

  if (eventType === "payment_intent.payment_failed") {
    // Notify the customer that their order was not fulfilled
    console.log("❌ Payment failed.");
  }

  res.sendStatus(200);
});

app.listen(4242, () => console.log(`Node server listening on port ${4242}!`));
