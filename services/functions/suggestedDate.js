function suggestedDate(event, clientUTC) {
    let timeVeriff = 0;
    timeVeriff = Number(event.time) + clientUTC;
  
    const dateVeriff = event.date.split("-");
  
    let dayVeriff = Number(dateVeriff[0]);
    let monthVeriff = Number(dateVeriff[1]);
    let yearVeriff = Number(dateVeriff[2]);
  
    const lastDayOfPrevMonth = new Date(yearVeriff, monthVeriff - 1, 0).getDate();
    const lastDayOfCurrentMonth = new Date(yearVeriff, monthVeriff, 0).getDate();
  
    if (timeVeriff < 0) {
      timeVeriff = 24 + timeVeriff;
      dayVeriff--;
      if (dayVeriff < 1) {
        dayVeriff = lastDayOfPrevMonth;
        monthVeriff--;
        if (monthVeriff < 1) {
          monthVeriff = 12;
          yearVeriff--;
        }
      }
    }
  
    if (timeVeriff > 23) {
      timeVeriff = -(24 - Number(event.time) - clientUTC);
      dayVeriff++;
      if (dayVeriff > lastDayOfCurrentMonth) {
        dayVeriff = 1;
        monthVeriff++;
        if (monthVeriff > 12) {
          monthVeriff = 1;
          yearVeriff++;
        }
      }
    }
  
    return `${dayVeriff}-${monthVeriff}-${yearVeriff} at ${timeVeriff} Hrs`;
  }

  module.exports = suggestedDate