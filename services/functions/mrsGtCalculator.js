function mrsGTCalculator(eventsArray,tutorBaseHour) {
  let calculatedPrice = 0;

    eventsArray.forEach((event) => {
        let eventHourPrice = tutorBaseHour;
        const eventTime = Number(event.time);
    
        const eventWeekDay = new Date(
          event.date.split("-")[2],
          event.date.split("-")[1] - 1,
          event.date.split("-")[0]
        ).toLocaleDateString("en-GB", {
          weekday: "long",
        });
    
        if (eventTime > 5 && eventTime <= 16) {
          eventHourPrice = tutorBaseHour;
        }
    
        if (eventTime > 16) {
          eventHourPrice = tutorBaseHour * 1.5;
        }
    
        if (eventWeekDay === "Saturday" || eventWeekDay === "Sunday") {
          eventHourPrice = eventHourPrice * 1.5;
        }
    
        calculatedPrice += eventHourPrice;
    
      });
  return calculatedPrice = calculatedPrice.toFixed(2) - 0.11;
}

module.exports = mrsGTCalculator