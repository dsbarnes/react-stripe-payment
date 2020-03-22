# React-Stripe-Payment
React Stripe Payment is a heavily modified version of the Stripe react-elements-card-payment demo repository.  
I was not satisfied with their API setup, or the fact that their demo only works with one product. 
I wanted something to calculate prices on the back end, which is oddly absent from their demo, 
and I wanted to email a receipt. 
(Unfortunately this does not work in test mode, but should be functional 
according to their API reference / Documentation)

## Installation

Clone this repo.  
Navigate into the **server** directory and run `yarn install`  
navigate into the **client** directory and run `yarn install`  
navigate to the project directory and `yarn start`  
(yarn start will run concurrently the server and the client, see package.json)  

The server should start locally on port 4242 and the client should start locally on port 3000.  

## Usage

With the app running and open in the browser, the user can select which product
they would like to 'purchase.'  

Once products are selected the user can 'pay.'
1. Use the credit card number `4242 4242 4242 4242`
2. Use any date in the future
3. Use any 3 digit CCV
4. Use any 5 digit zip code

After clicking the 'pay' button, the payment will process.  
Upon successful completion the button will be replaced with a JSON object that looks something like this:  

```
{ 
  "id": "pi_*****", 
  "object": "payment_intent", 
  "amount": $$$, 
  "canceled_at": null, 
  "cancellation_reason": null, 
  "capture_method": "automatic", 
  "client_secret": "pi_*****", 
  "confirmation_method": "automatic", 
  "created": *****, 
  "currency": "usd", 
  "description": null, 
  "last_payment_error": null, 
  "livemode": false, 
  "next_action": null, "payment_method": "pm_*****", 
  "payment_method_types": [ "card" ], "receipt_email": "*****",
  "setup_future_usage": null,
  "shipping": null,
  "source": null, 
  "status": "succeeded" 
}
```

If the payment does not succeed, an error message will be rendered instead.

## Have some fun with it!

Try opening a console and changing the price. 
Does the cart price always match the actual payment price? 
Try changing other things too, for example the email, the currency, the payment method, etc. 
What will succeed? What will fail? What error messages do you get when you change different data?

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
