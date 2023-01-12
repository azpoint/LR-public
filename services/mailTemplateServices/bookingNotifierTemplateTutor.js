function mailConfirmation(data){

  let UTCOffset = data.UTCOffset >= 0 ? `UTC+${data.UTCOffset}` : `UTC${data.UTCOffset}`


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
        <h2 style="margin: 0;padding: 0;box-sizing: border-box;display: block;margin-left: auto;margin-right: auto;text-align: center;color: #d63131;font-weight: 600;margin-top: 2rem;">Today is the day!</h2>
  
        <div class="left-text-container" style="margin: 2rem 0;padding: 0;box-sizing: border-box;padding-bottom: 2rem;">
          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">
            Hi LR ADMIN, this is a reminder that you have class today.
          </p>

          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">Below is your booking detail:</p>
  
          <ul style="margin: 0;padding: 0;box-sizing: border-box;list-style: none;">
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Client Name: ${data.firstName} ${data.lastName}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Booked Day: ${data.bookingDay}</li>
            <li style="margin: 0;padding: 0;box-sizing: border-box;">Suggested Time: ${data.suggestedTime}</li>
          </ul>

          <p style="margin: 1rem 0;padding: 0;box-sizing: border-box;">
            Remember the minimum required connection is 25Mbit/s UPSTREAM/DOWNSTREAM.
          </p>
        </div>
      </div>
    </div>
  </body>`

    return mail
}

module.exports = mailConfirmation