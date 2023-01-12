function mailConfirmation(data) {
  let newBookingString = [];
  let bookingString = data.booking;
  let UTCOffset =
    data.UTCOffset >= 0 ? `UTC+${data.UTCOffset}` : `UTC${data.UTCOffset}`;

  bookingString.map((item) => {
    let newItemString = `<li style="margin: 0;padding: 0;box-sizing: border-box;">Date: ${String(
      item.date
    )} at Time: ${String(item.time)}Hrs</li>`;

    newBookingString.push(newItemString);
  });
  newBookingString = String(newBookingString);
  newBookingString = newBookingString.replace(/,/g, "");

  let mail = `<head style="margin: 0;padding: 0;box-sizing: border-box;">
    <meta charset="UTF-8" style="margin: 0;padding: 0;box-sizing: border-box;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" style="margin: 0;padding: 0;box-sizing: border-box;">
    <meta name="author" content="LearnRhino" style="margin: 0;padding: 0;box-sizing: border-box;">
    <link rel="preconnect" href="https://fonts.googleapis.com" style="margin: 0;padding: 0;box-sizing: border-box;">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin style="margin: 0;padding: 0;box-sizing: border-box;">
    
  </head>
  <body style="margin: 0;padding: 0;box-sizing: border-box;font-size: 20px;font-family: &quot;Montserrat&quot;, sans-serif;width: 100%;height: 100%;">
    <div id="main-container" style="margin: 5rem auto;padding: 0;box-sizing: border-box;background-color: #3d3d3d;min-width: 500px;max-width: 800px;width: 80%;color: #dadada;border-radius: 0.5rem;">
      <div id="central-container" style="margin: 2rem auto;padding: 0;box-sizing: border-box;padding-top: 2rem;width: 80%;height: fit-content;">
        <a href="https:learnrhino.com" style="margin: 0;padding: 0;box-sizing: border-box;"><img src="https://www.learnrhino.com/public/learn-rhino-logo-1k-curves.png" alt="lr-logo" style="margin: 0;padding: 0;box-sizing: border-box;display: block;margin-left: auto;margin-right: auto;width: 400px;filter: drop-shadow(8px 2px 6px rgba(0, 0, 0, 0.6));"></a>
        <h2 style="margin: 0;padding: 0;box-sizing: border-box;display: block;margin-left: auto;margin-right: auto;text-align: center;color: #d63131;font-weight: 600;margin-top: 2rem;">Your LearnRhino Order #${data.orderNumber}</h2>
  
        <div class="left-text-container" style="margin: 2rem 0;padding: 0;box-sizing: border-box;padding-bottom: 2rem;">
          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">
            Hi ${data.firstName} ${data.lastName}, thank you very much for your
            order, it will be reviewed and processed as soon as possible for your
            convenience.
          </p>
  
          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">
            Remember the e-book delivery can take up to 3 continuous days, but
            this usually happens within a few hours. You will receive another
            email with your eBook and further instructions. Also remember that all booking dates are in UTC+0.
          </p>

          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">
          Meanwhile you may download your rhino file here: <br>
          <a href="https://www.learnrhino.com/dist/downloads/carFile/${data.orderNumber}" target="_blank"> Your Rhino File!</a>
          </p>
  
          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">Below are your order details:</p>
  
          <ul style="margin: 0;padding: 0;box-sizing: border-box;list-style: none;">
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Order Number: ${data.orderNumber}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Full Name: ${data.firstName} ${data.lastName}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Product: ${data.productName}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Amount: USD$${data.orderAmount}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Client Suggested UTC: ${UTCOffset}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Booking: Date Format: DD-MM-YYYY<ul>
            ${newBookingString}</ul></li>
          </ul>
        </div>
      </div>
    </div>
  </body>`;

  return mail;
}

module.exports = mailConfirmation;
