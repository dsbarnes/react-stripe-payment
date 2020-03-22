import React, { useEffect, useState } from "react";
import style from './CheckoutForm.css'
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CardGroup, Card } from 'react-bootstrap'
import api from "../api";

export default function CheckoutForm() {
  const [cart, setCart] = useState(null)
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState("")
  const [clientSecret, setClientSecret] = useState(null)
  const [error, setError] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [succeeded, setSucceeded] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [products, setProducts] = useState(null)

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    api.getProductDetails()
      .then(products => setProducts(products))
  }, [])

  const handleAddToCart = (sku, ev) => {
    //The amount cannot be set on the front end...
    //pretty easy to manipulate it in state.
    //We can do this - but it's for display purposes only
    if (ev.target.checked) {
      !cart ? setCart([sku]) : setCart([...cart, sku])
      setAmount(amount + (sku.price / 100))
    }
    else {
      setCart(cart.filter(item => item.id != sku.id))
      setAmount(amount - (sku.price / 100))
    }
  }

  const handleSubmit = async ev => {
    ev.preventDefault();
    setProcessing(true);
    // Step 1: Fetch product details such as amount and currency from
    // API to make sure it can't be tampered with in the client.

    // Step 2: Create PaymentIntent over Stripe API

    // Step 3: Use clientSecret from PaymentIntent and the CardElement
    // to confirm payment with stripe.confirmCardPayment()

    const options = {
      payment_method_types: ["card"],
      currency: 'usd',
      amount: cart.map(item => item.id),
      receipt_email: 'derekb0147@gmail.com'
    }
    api.createPaymentIntent(options)
      .then(clientSecret => {
        console.log(clientSecret)
        setClientSecret(clientSecret)
        return clientSecret
      })
      .then(async cs => {
        const payload = await stripe.confirmCardPayment(cs, { payment_method: { card: elements.getElement(CardElement) } })
        setError(null)
        setSucceeded(true)
        setProcessing(false)
        setMetadata(payload.paymentIntent)
        console.log("[PaymentIntent]", payload.paymentIntent)
      })
      .catch(err => {
        setError(`Payment Failed: ${err.message}`);
        setProcessing(false);
        console.log("[error]", err.message);
      })
  };

  const renderForm = () => {
    return (
      <div className='container'>
        <div className='smalls'>
          <small>
            Unfortunatly, stripe does not send test emails.<br />
            One has to investigate the code to see that it would otherwise work<br />
          </small>
          <br />
        </div>

        <CardGroup className='mt-4'>
          {products && products.map(sku => {
            return (
              <Card>
                <Card.Img variant="top" src="*" />

                <Card.Header>
                  ${(sku.price / 100)
                    .toLocaleString(navigator.language, { minimumFractionDigits: 2 })}
                </Card.Header>

                <Card.Body>
                  <Card.Title>{sku.product.name}</Card.Title>
                  <Card.Text>{sku.product.caption}</Card.Text>
                  <Card.Text>{sku.product.description}</Card.Text>
                </Card.Body>

                <Card.Footer>
                  <p>
                    <input
                      className='mr-3 mt-4'
                      type='checkbox'
                      onChange={(ev) => handleAddToCart(sku, ev)} />
                        Add To Cart
                  </p>
                </Card.Footer>
              </Card>
            )
          })}
        </CardGroup>

        <div className='smalls'>
          <small>
            Use the credit card number `4242 4242 4242 4242`<br />
            Use any date in the future <br />
            Use any 3 digit CCV <br />
            Use any 5 digit zip code <br />
            The rest of the for, in this case, is optional <br />
          </small>
        </div>

        <form id='payment-form' onSubmit={handleSubmit}>
          <div id='email' className='mt-4 mb-4'>
            <br />
            <input
              className='w-100 mb-4'
              type="text"
              id="email"
              name="email"
              placeholder=" Full name on card"
              autoComplete="cardholder"
            />
            <input
              className='w-100 mb-4'
              type="text"
              id="email"
              name="email"
              placeholder=" Address"
              autoComplete="cardholder"
            />
            <input
              className='w-100 mb-4'
              type="text"
              id="email"
              name="email"
              placeholder=" City"
              autoComplete="cardholder"
            />
            <input
              className='w-100 mb-4'
              type="text"
              id="email"
              name="email"
              placeholder=" State"
              autoComplete="cardholder"
            />
            <input
              className='w-100 mb-4'
              type="text"
              id="email"
              name="email"
              placeholder=" eMail reciept to"
              autoComplete="cardholder"
            />
          </div>

          <div id='payment' className=''>
            <CardElement />

            {error && <div className="message sr-field-error">{error}</div>}
            <p id='price'>Amount: $ {amount.toLocaleString(navigator.language, { minimumFractionDigits: 2 })} (USD)</p>
            {!succeeded ? (
              // removed !clientSecret
              <button
                className='mt-2 mb-4 pay-button'
                disabled={processing || !stripe}>
                {processing ? "Processing…" : "Pay"}
              </button>
            ) : (
                <div className='w-50'>
                  <h1>Your test payment succeeded</h1>
                  <p>View PaymentIntent response:</p>
                  <code>{JSON.stringify(metadata, null, 2)}</code>
                </div>
              )}
          </div>
        </form>


      </div>
    );
  };

  return (
    <React.Fragment>
      {renderForm()}
      {/* {succeeded ? renderSuccess() : renderForm()} */}
    </React.Fragment>
  )
}
