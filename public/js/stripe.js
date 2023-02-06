import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51MWH4sIDqDudFWpCmzJwE4ZFlqWywAiY9qA1B8ByGW85Vg4SjlDIZNioBzQxA0YhcV1I9YLoxKbdDKmdJOeDz30X00QlMdqfPb'
);

export const bookTour = async tourId => {
  try {
    //1) Get CheckOut  session from the API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
