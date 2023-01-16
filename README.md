# LR-public
Example MVP code of Learn Rhino

This is an example code of the Minimum Viable Product of learnrhino.com. Here are the developed features:

The whole site was developed with a non user account flow. It means no registration required to use the site.

Frontend:
- Simple action user flow.
- One column design for desktop and mobile.
- +90% dimensions in relative units for better responsive control and design.
- Styling with SASS and vanilla CSS including animation, brand identity, color palette.
- Appointment system for booking online classes.
Booking sub-features are:
- Day and time verification to suggest booking approximation using the client time-zone.
- Getting non working days, reserved days and reserved hours from DB for display and selection in the calendar.
- Alert system for the price increment according to the day and time selected.
- Discount system for previous clients.
- Getting the final price from the backend.

Backend:

- Server with Express and EJS template system.
- MongoDB for clients, sales, booking system, client session.
- DB access with DAO system.
- Mongoose for data structure and DB calls.
- RESTs endpoints to serve the front-end interactive features.
- email verification system.
- Tailored email template system for accurate notification info to costumers.
- Discount verification system.
- Stripe payment implementation.
- Download file manger to limit access to costumers.
- email notification system to remember booking to costumers.
