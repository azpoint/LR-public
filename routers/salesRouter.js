// -------- DEPENDENCIES ---------
const envConfig = require("../envConfig");
const express = require("express");
const { Router } = require("express");
const stripe = require("stripe")(envConfig.stripe_priv_key);
const {
  transporterLR,
  transporterGmail,
} = require("../services/nodeMailerConfig");

// --------- DATABASE ---------
const ProductService = require("../services/dbServices/dbProductService");
const ClientService = require("../services/dbServices/dbClientService");
const SalesService = require("../services/dbServices/dbSalesService");
const DatesService = require("../services/dbServices/dbDatesServices");
const db = require("../db/mongoConnect");
const clientsModel = require("../db/models/clientsModel");
const productsModel = require("../db/models/productsModel");
const salesModel = require("../db/models/salesModel");
const productsDB = new ProductService(db, productsModel);
const clientsDB = new ClientService(db, clientsModel);
const salesDB = new SalesService(db, salesModel);
const datesDB = new DatesService(db);

// -------- SERVICES --------
const bookingCalculator = require("../services/functions/mrsGtCalculator");
const keygen = require("../services/keygen");
const mailConfirmation = require("../services/mailTemplateServices/orderConfirmationEmail");
const newOrderMail = require("../services/mailTemplateServices/newOrderEmail");
const newOrderMailBooking = require("../services/mailTemplateServices/newOrderEmailBooking");
const newConfirmationBooking = require("../services/mailTemplateServices/orderConfirmationEmailBooking");
const newConfirmationBookingRC = require("../services/mailTemplateServices/orderConfirmationEmailBookingReturnc");

// const notifier = require("../services/functions/bookingNotifier")

// --------- DEFINITIONS --------
const salesRouter = Router();
const currentYear = new Date().getFullYear();

// --------- ENDPOINTS ----------
// salesRouter.get("/notifier-test", (req, res) => {
//   notifier()
//   res.send('Notification done')
// })

// --------- BOOKING CALENDAR
salesRouter.get("/mrs-gt-en/booking", (req, res) => {
  return res.render("bookingMRS-GT-EN", {
    pageTitle: "Booking - Pick Days",
    date: currentYear,
  });
});

// -------- BOOKING CHECKOUT
salesRouter.get("/MRS-GT-EN/checkout", (req, res) => {
  req.session.product = "MRS-GT-EN";
  return productsDB.getOneProduct("MRS-GT-EN").then((resp) => {
    return res.render("checkout", {
      pageTitle: "Checkout",
      date: currentYear,
      product: resp,
      discount: req.session.discount ? true : false,
      booking: req.session.booking,
    });
  });
});

// -------- BOOKING COMPLETE CHECKOUT

salesRouter.get("/MRS-GT-EN/checkout/complete-checkout", (req, res) => {
  if (req.session.discount === true) {
    return salesDB.lastOrder().then((resp) => {
      req.session.orderNumber = ++resp;

      let newSale = {
        productCode: req.session.product,
        amount: req.session.bookingAmount,
        serial: req.session.serialDiscount,
        orderNumber: req.session.orderNumber,
        clientUTC: req.session.clientTimeOffset,
        bookingDates: req.session.booking,
        carFileAttempts: -1,
        bookFileAttemps: -1,
        delivered: false,
      };

      return salesDB.newSale(newSale).then((resp) => {
        let newBooking = [];
        let booking = req.session.booking;
        booking.forEach((item) => {
          let newItem = {
            date: item.date,
            time: Number(item.time),
            serial: req.session.serialDiscount,
          };
          newBooking.push(newItem);
        });

        return datesDB.saveEvents(newBooking).then((_) => {
          return clientsDB
            .validateDiscount(
              req.session.emailDiscount,
              req.session.serialDiscount
            )
            .then((resp) => {
              let mailData = {
                firstName: resp.firstName,
                lastName: resp.lastName,
                orderNumber: req.session.orderNumber,
                productName: "1:1 Guided Tutoring + eBook + 3D Model",
                orderAmount: req.session.bookingAmount,
                booking: req.session.booking,
                UTCOffset: req.session.clientTimeOffset,
                productCode: req.session.product,
              };

              let clientData = {
                email: req.session.emailDiscount,
                firstName: resp.firstName,
                lastName: resp.lastName,
                serial: req.session.serialDiscount,
                bookPassword: "Returning Customer",
                country: "Returning Customer",
                city: "Returning Customer",
                phone: "Returning Customer",
                orderNumber: req.session.orderNumber,
                productName: "1:1 Guided Tutoring + eBook + 3D Model",
                booking: req.session.booking,
                orderAmount: req.session.bookingAmount,
                UTCOffset: req.session.clientTimeOffset,
              };

              const mailOptionsClient = {
                from: envConfig.admin_mail_outbound,
                to: req.session.emailDiscount,
                subject: `Order from LearnRhino ${req.session.orderNumber}`,
                html: newConfirmationBookingRC(mailData),
              };

              const mailOptionsLR = {
                from: envConfig.admin_mail_verif,
                to: envConfig.admin_mail_outbound,
                subject: `New Order from LearnRhino ${req.session.orderNumber}`,
                html: newOrderMailBooking(clientData),
              };

              transporterGmail.sendMail(mailOptionsLR, function (error) {
                if (error) {
                  return res.render("error", {
                    pageTitle: "Error",
                    date: currentYear,
                    message:
                      "There was an error sending your order confirmation, please contact the administrator right now. Error code 101",
                  });
                }
              });

              transporterLR.sendMail(mailOptionsClient, function (error) {
                if (error) {
                  console.log(error);
                  return res.render("error", {
                    pageTitle: "Error",
                    date: currentYear,
                    message:
                      "There was an error sending your order confirmation, please contact the administrator right now. Error code 102",
                  });
                } else {
                  return productsDB.getOneProduct("MRS-GT-EN").then((resp) => {
                    res.render("complete-checkout", {
                      pageTitle: "Success",
                      date: currentYear,
                      product: resp,
                      email: req.session.emailDiscount,
                      order: req.session.orderNumber,
                    });

                    return req.session.destroy();
                  });
                }
              });
            })
            .catch((err) => {
              console.log(err);
              return res.render("error", {
                pageTitle: "Error",
                date: currentYear,
                message:
                  "There was an error finalizing your order, please contact the administrator right now. Error code 001:",
              });
            });
        });
      });
    });
  }

  if (!req.session.discount) {
    let newClient = {};

    return clientsDB.getLastSerial().then((resp) => {
      req.session.serial = ++resp;
      req.session.bookPassword = keygen(25);

      newClient = {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        serial: req.session.serial,
        bookPassword: req.session.bookPassword,
        address: { country: req.session.country, city: req.session.city },
        phone: Number(req.session.phone),
        purchases: {
          productCode: req.session.product,
          orderNumber: req.session.orderNumber,
        },
      };
      return clientsDB.newClient(newClient).then((_) => {
        let newSale = {
          productCode: req.session.product,
          amount: req.session.amount,
          serial: req.session.serial,
          orderNumber: req.session.orderNumber,
          clientUTC: req.session.clientTimeOffset,
          bookingDates: req.session.booking,
          carFileAttempts: 0,
          bookFileAttemps: 0,
          delivered: false,
        };

        return salesDB.newSale(newSale).then((resp) => {
          let newBooking = [];
          let booking = req.session.booking;
          booking.forEach((item) => {
            let newItem = {
              date: item.date,
              time: Number(item.time),
              serial: req.session.serial,
            };
            newBooking.push(newItem);
          });

          return datesDB.saveEvents(newBooking).then((resp) => {
            return productsDB
              .getOneProduct(req.session.product)
              .then((resp) => {
                let mailData = {
                  firstName: req.session.firstName,
                  lastName: req.session.lastName,
                  orderNumber: req.session.orderNumber,
                  productName: req.session.productName,
                  orderAmount: req.session.amount,
                  booking: req.session.booking,
                  UTCOffset: req.session.clientTimeOffset,
                  productCode: req.session.product,
                };

                let clientData = {
                  email: req.session.email,
                  firstName: req.session.firstName,
                  lastName: req.session.lastName,
                  serial: req.session.serial,
                  bookPassword: req.session.bookPassword,
                  country: req.session.country,
                  city: req.session.city,
                  phone: Number(req.session.phone),
                  productCode: req.session.product,
                  orderNumber: req.session.orderNumber,
                  productName: req.session.productName,
                  orderAmount: req.session.amount,
                  booking: req.session.booking,
                  UTCOffset: req.session.clientTimeOffset,
                };

                const mailOptionsClient = {
                  from: envConfig.admin_mail_outbound,
                  to: req.session.email,
                  subject: `Order from LearnRhino ${req.session.orderNumber}`,
                  html: newConfirmationBooking(mailData),
                };

                const mailOptionsLR = {
                  from: envConfig.admin_mail_verif,
                  to: envConfig.admin_mail_outbound,
                  subject: `New Order from LearnRhino ${req.session.orderNumber}`,
                  html: newOrderMailBooking(clientData),
                };

                transporterGmail.sendMail(mailOptionsLR, function (error) {
                  if (error) {
                    return res.render("error", {
                      pageTitle: "Error",
                      date: currentYear,
                      message:
                        "There was an error sending your order confirmation, please contact the administrator right now. Error code 103",
                    });
                  }
                });

                transporterLR.sendMail(mailOptionsClient, function (error) {
                  if (error) {
                    return res.render("error", {
                      pageTitle: "Error",
                      date: currentYear,
                      message:
                        "There was an error sending your order confirmation, please contact the administrator right now. Error code 104",
                    });
                  } else {
                    res.render("complete-checkout", {
                      pageTitle: "Success",
                      date: currentYear,
                      product: resp,
                      email: req.session.email,
                      order: req.session.orderNumber,
                    });

                    return req.session.destroy();
                  }
                });
              })
              .catch((err) => {
                return res.render("error", {
                  pageTitle: "Error",
                  date: currentYear,
                  message: `There was an error finalizing your order, please contact the administrator right now. Error code 002: Error:${err}`,
                });
              });
          });
        });
      });
    });
  }
});

// -------- FIXED PRICE CHECKOUT
salesRouter.get("/fpp/:productCode/checkout", (req, res) => {
  if (req.params.productCode === "MRS-GT-EN") {
    return res.redirect("/sales/mrs-gt-en/booking");
  }

  return productsDB.getOneProduct(req.params.productCode).then((resp) => {
    return res.render("checkout", {
      pageTitle: "Checkout",
      date: currentYear,
      product: resp,
      discount: false,
    });
  });
});

// --------- FIXED PRICE COMPLETE CHECKOUT
salesRouter.get("/fpp/:productCode/checkout/complete-checkout", (req, res) => {
  let newClient = {};

  return clientsDB.getLastSerial().then((resp) => {
    req.session.serial = ++resp;
    req.session.bookPassword = keygen(25);

    newClient = {
      email: req.session.email,
      firstName: req.session.firstName,
      lastName: req.session.lastName,
      serial: req.session.serial,
      bookPassword: req.session.bookPassword,
      address: { country: req.session.country, city: req.session.city },
      phone: Number(req.session.phone),
      purchases: {
        productCode: req.session.product,
        orderNumber: req.session.orderNumber,
      },
    };

    return clientsDB.newClient(newClient).then((_) => {
      let newSale = {
        productCode: req.session.product,
        amount: req.session.amount,
        serial: req.session.serial,
        orderNumber: req.session.orderNumber,
        carFileAttempts:
          req.session.product === "MRS-P-EN" ||
          req.session.product === "DSR-P-ES"
            ? 0
            : -1,
        bookFileAttemps: 0,
        delivered: false,
      };

      return salesDB
        .newSale(newSale)
        .then((_) => {
          return productsDB.getOneProduct(req.session.product).then((resp) => {
            let mailData = {
              firstName: req.session.firstName,
              lastName: req.session.lastName,
              orderNumber: req.session.orderNumber,
              productName: req.session.productName,
              orderAmount: req.session.amount,
              productCode: req.session.product,
            };

            let clientData = {
              email: req.session.email,
              firstName: req.session.firstName,
              lastName: req.session.lastName,
              serial: req.session.serial,
              bookPassword: req.session.bookPassword,
              address: { country: req.session.country, city: req.session.city },
              phone: Number(req.session.phone),
              purchases: {
                productCode: req.session.product,
                orderNumber: req.session.orderNumber,
              },
              productName: req.session.productName,
              orderAmount: req.session.amount,
            };

            const mailOptionsClient = {
              from: envConfig.admin_mail_outbound,
              to: req.session.email,
              subject: `Order from LearnRhino ${req.session.orderNumber}`,
              html: mailConfirmation(mailData),
            };

            const mailOptionsLR = {
              from: envConfig.admin_mail_verif,
              to: envConfig.admin_mail_outbound,
              subject: `New Order from LearnRhino ${req.session.orderNumber}`,
              html: newOrderMail(clientData),
            };

            transporterGmail.sendMail(mailOptionsLR, function (error) {
              if (error) {
                return res.render("error", {
                  pageTitle: "Error",
                  date: currentYear,
                  message:
                    "There was an error sending your order confirmation, please contact the administrator right now. Error code 105",
                });
              } else {
                console.log("New Order mail Sent");
              }
            });

            transporterLR.sendMail(mailOptionsClient, function (error) {
              if (error) {
                return res.render("error", {
                  pageTitle: "Error",
                  date: currentYear,
                  message:
                    "There was an error sending your order confirmation, please contact the administrator right now. Error code 105",
                });
              } else {
                res.render("complete-checkout", {
                  pageTitle: "Success",
                  date: currentYear,
                  product: resp,
                  email: req.session.email,
                  order: req.session.orderNumber,
                });

                return req.session.destroy();
              }
            });
          });
        })
        .catch((err) => {
          return res.render("error", {
            pageTitle: "Error",
            date: currentYear,
            message:
              "There was an error finalizing your order, please contact the administrator right now. Error code 003",
          });
        });
    });
  });
});

// --------- REST --------

// -------- BOOKING DATES
salesRouter.post("/booking-dates", (req, res) => {
  const newBookingFormat = [];
  const tutorBaseHour = 40;
  const discountAmount = 50;

  req.body.booking.forEach((element) => {
    const newElement = {
      date: String(element.date),
      time: Number(element.time),
    };
    newBookingFormat.push(newElement);
  });

  req.session.clientTimeOffset = req.body.clientTimeOffset;
  req.session.booking = newBookingFormat;

  let bookingAmount = bookingCalculator(newBookingFormat, tutorBaseHour);

  if (req.session.discount === true) {
    bookingAmount = bookingAmount - discountAmount;
    req.session.bookingAmount = bookingAmount;
    return res.json("done");
  }

  req.session.bookingAmount = bookingAmount;

  return res.json("done");
});

// -------- NON WORKING DAYS FETCHER

salesRouter.get("/non-working-days-fetcher", (req, res) => {
  const dataToSend = {};
  return datesDB.nonWorkingDays().then((resp) => {
    dataToSend.nonWorkingDays = resp;

    return datesDB.reservedEvents().then((resp) => {
      dataToSend.reservedEvents = resp;

      return res.json(dataToSend);
    });
  });
});

// --------- EMAIL VALIDATOR
salesRouter.post("/mail-validator", (req, res) => {
  emailCodeVerif = [];

  for (let i = 0; i < 6; i++) {
    const iNumber = Math.floor(Math.random() * 10);
    emailCodeVerif.push(iNumber);
  }

  emailCodeVerif = emailCodeVerif.join("");

  const mailOptions = {
    from: envConfig.admin_mail_verif,
    to: req.body.verifyEmail,
    subject: `LearnRhino Verification Code`,
    html: `Your verification code is: <em>${emailCodeVerif}</em>`,
  };

  transporterGmail.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.json("invalid");
    } else {
      req.session.emailCode = emailCodeVerif;
      req.session.email = req.body.verifyEmail;
      return res.json("valid");
    }
  });
});

// -------- MAIL CODE VALIDATOR
salesRouter.post("/mail-code-validator", (req, res) => {
  if (req.body.codeVerify === req.session.emailCode) {
    return res.json("mail-verified");
  }
  return res.json("invalid-code");
});

// -------- PAYMENT INTEND
salesRouter.post("/fpp/:productCode/paymentIntend", async (req, res) => {
  let stripePrice = 0;

  if (req.params.productCode === "MRS-GT-EN") {
    stripePrice =
      String(req.session.bookingAmount).split(".")[0] +
      String(req.session.bookingAmount).split(".")[1];
  } else {
    stripePrice = await productsDB
      .getOneProduct(req.params.productCode)
      .then((resp) => {
        const stripePrice =
          String(resp.price).split(".")[0] + String(resp.price).split(".")[1];
        return stripePrice;
      });
  }

  const paymentIntend = await stripe.paymentIntents.create({
    amount: stripePrice,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  return res.send({
    clientSecret: paymentIntend.client_secret,
    intendAmount: paymentIntend.amount,
  });
});

// -------- STRIPE PUB KEY FETCHER
salesRouter.get("/sPubKey", (req, res) => {
  return res.send({
    pubKey: envConfig.stripe_pub_key,
  });
});

// --------- BOOKING CALCULATOR
salesRouter.post("/price-calculator", (req, res) => {
  const eventsArray = req.body.eventsToCalc;
  const tutorBaseHour = 40;
  const discountAmount = 50;
  let calculatedPrice = 0;

  calculatedPrice = bookingCalculator(eventsArray, tutorBaseHour);

  if (req.session.discount) {
    const sendPrice = {
      tutoring: calculatedPrice,
      discount: discountAmount,
      total: calculatedPrice - discountAmount,
    };

    return res.json(sendPrice);
  }

  const sendPrice = {
    tutoring: calculatedPrice,
    discount: 0,
    total: calculatedPrice,
  };

  return res.json(sendPrice);
});

// --------- DISCOUNT VALIDATOR
salesRouter.post("/discount-validator", (req, res) => {
  return clientsDB
    .validateDiscount(req.body.email, req.body.serial)
    .then((resp) => {
      if (resp !== null) {
        req.session.discount = true;
        req.session.serialDiscount = resp.serial;
        req.session.emailDiscount = resp.email;
        return res.json(true);
      } else {
        return res.json("invalid");
      }
    });
});

// -------- GET CLIENT FORM
salesRouter.post("/client-form", (req, res) => {
  return salesDB.lastOrder().then((resp) => {
    req.session.email = req.body.email;
    req.session.firstName = req.body.firstName;
    req.session.lastName = req.body.lastName;
    req.session.country = req.body.country;
    req.session.city = req.body.city;
    req.session.phone = req.body.phone;
    req.session.product = req.body.product;
    req.session.amount = Number(req.body.amount);
    req.session.orderNumber = ++resp;

    return productsDB.getOneProduct(req.session.product).then((resp) => {
      req.session.productName = resp.productName;

      return res.json("form-received");
    });
  });
});

module.exports = salesRouter;
