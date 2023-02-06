const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.checkoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currenty booked Tour
  const tour = await Tour.findById(req.params.tourId);
  const { price, name } = tour;
  // console.log(price, name);

  // 2) Create CheckOut Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name}`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          },
          unit_amount: tour.price * 100,
          tax_behavior: 'exclusive'
        },
        quantity: 1

        // price: 'price_1MWki5IDqDudFWpCmjfHkRak',
        // quantity: 1,
        // name: `${tour.name} Tour`,
        // description: tour.summary,
        // currency: 'usd'
      }
    ]
  });
  // 3) Create Session as responce

  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});
