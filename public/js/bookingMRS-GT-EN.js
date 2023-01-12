async function getDaysData() {
  await fetch("/sales/non-working-days-fetcher", {
    method: "get",
    headers: { "Content-Type": "application/json" },
    cache: "no-cache",
  })
    .then((resp) => resp.json())
    .then((resp) => {
      localStorage.setItem(
        "non-working-days",
        JSON.stringify(resp.nonWorkingDays)
      );

      localStorage.setItem(
        "reserved-events",
        JSON.stringify(resp.reservedEvents)
      );

      location.reload();
    })
    .catch((error) => {
      alertModal(
        "Error getting the data. Reload the page, try again later or contact the administrator."
      );

      setTimeout(() => {
        location.href = "/contact";
      }, 3000);
    });
}

// getDaysData();
// --------- DEFINITIONS --------
let clicked = null;
let selectedMonth = localStorage.getItem("lastMonth")
  ? JSON.parse(localStorage.getItem("lastMonth"))
  : 0;

let reservedEvents = localStorage.getItem("reserved-events")
  ? JSON.parse(localStorage.getItem("reserved-events"))
  : getDaysData();

let nonWorkingDays = localStorage.getItem("non-working-days")
  ? JSON.parse(localStorage.getItem("non-working-days"))
  : alertModal("Please reload the page");

let localEvents = localStorage.getItem("localEvents")
  ? JSON.parse(localStorage.getItem("localEvents"))
  : [];

let discountLocal = localStorage.getItem("discount")
  ? JSON.parse(localStorage.getItem("discount"))
  : {};

let events = [...reservedEvents, ...localEvents];

const clientTimeOffset = Number(-(new Date().getTimezoneOffset() / 60));

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const calendar = document.getElementById("calendar");
const newEventModal = document.getElementById("newEventModal");
const modalBackground = document.getElementById("modalBackground");
const eventTimeInput = document.getElementById("classTime");
const alertModalDiv = document.getElementById("alertModal");
const saveButton = document.getElementById("saveEvent");
const cancelButton = document.getElementById("cancelEvent");
const modalAlert = document.querySelector("#modalAlert");
const bookingDate = document.querySelector("#bookingDate");
const bookingSuggest = document.querySelector("#bookingSuggest");
const bookingDateModal = document.querySelector("#bookingDateModal");
const bookingSuggestModal = document.querySelector("#bookingSuggestModal");
const buttonsCalendar = document.querySelector("#buttons-calendar");
const bookingInfo = document.querySelector("#bookingInfo");
const timeSelector = document.querySelector("#classTime");
const fetchPriceContainer = document.querySelector("#fetchPrice");
const emailDiscount = document.querySelector("#emailDiscount");
const serialDiscount = document.querySelector("#serialDiscount");
const discountContainer = document.querySelector("#discountValidatorContainer");
const discountAlertBox = document.querySelector("#discountAlertBox");

// -------- FUNCTIONS --------
function clearStorage() {
  localStorage.removeItem("localEvents");
  location.reload();
}

function discountAlert() {
  discountContainer.remove();
  discountAlertBox.innerHTML = "<h3>Discount Validated</h3>";
}

function acceptTC() {
  localStorage.setItem("T&C", true)
  closeModals('empty')
}

function confirmBooking() {
  if(!localStorage.getItem("T&C")){
    alertModal('<h3>You must accept the Terms & Conditions to continue</h3>')
  } else if(localStorage.getItem("T&C")) {

    fetch("/sales/booking-dates", {
      method: 'post',
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify({
        clientTimeOffset: clientTimeOffset,
        booking: localEvents
      })
    }).then(resp => resp.json())
    .then(resp => {
      if(resp === 'done'){
        return location.href = "/sales/MRS-GT-EN/checkout"
      } else {
        alertModal('Please Reload the Page')
      }
    })
  }
}

function closeModals(e) {
  if (
    e.target === modalBackground ||
    e.target === cancelButton ||
    e === "empty"
  ) {
    alertModalDiv.innerHTML = "";
    modalBackground.style.display = "none";
    alertModalDiv.style.display = "none";
    newEventModal.style.display = "none";
    eventTimeInput.value = "";
    clicked = null;

    localStorage.setItem("lastMonth", JSON.stringify(selectedMonth));

    location.reload();
  }
}

function eventModal(selectedDate) {
  clicked = selectedDate;

  const selectedWeekDay = new Date(
    selectedDate.split("-")[2],
    selectedDate.split("-")[1] - 1,
    selectedDate.split("-")[0]
  ).toLocaleDateString("en-GB", {
    weekday: "long",
  });

  if (selectedWeekDay === "Saturday" || selectedWeekDay === "Sunday") {
    const weekendAlert = document.createElement("li");
    weekendAlert.innerText =
      "You have selected a weekend day, there is a 50% charge on this hour.";
    modalAlert.appendChild(weekendAlert);
  }

  timeSelector.addEventListener("change", (e) => {
    const timeAlertRemove = document.querySelector("#timeAlertToRemove");
    const eventAlertRemove = document.querySelector("#eventTextModal");
    const suggestAlertRemove = document.querySelector("#suggestTimeModal");

    if (eventAlertRemove !== null) {
      eventAlertRemove.remove();
      suggestAlertRemove.remove();
    }

    if (timeAlertRemove !== null) {
      timeAlertRemove.remove();
    }

    const event = {
      date: selectedDate,
      time: e.target.value,
    };

    function modalTimeSel() {
      const eventTextModal = document.createElement("h4");
      eventTextModal.setAttribute("id", "eventTextModal");
      eventTextModal.innerText = `${selectedDate} at ${event.time} Hrs`;
      bookingDateModal.appendChild(eventTextModal);

      const suggestTimeModal = document.createElement("h4");
      suggestTimeModal.setAttribute("id", "suggestTimeModal");
      suggestTimeModal.innerText = verifyDate(event);
      bookingSuggestModal.appendChild(suggestTimeModal);
    }

    if (e.target.value > 16) {
      const timeAlert = document.createElement("li");
      timeAlert.setAttribute("id", "timeAlertToRemove");
      timeAlert.innerText =
        "You've selected an hour greater than 16hrs, there is a 50% charge on this hour.";
      modalAlert.appendChild(timeAlert);
      modalTimeSel();
    } else {
      modalTimeSel();

      if (timeAlertRemove === null) {
        return undefined;
      }

      timeAlertRemove.remove();
    }
  });

  const eventsForDay = events.filter((event) => {
    return event.date === selectedDate;
  });

  let dayFrom = nonWorkingDays.filter((event) => {
    return event.availableFrom !== false && event.date === selectedDate;
  });


  for (let i = 6; i < 23; i++) {
    if (dayFrom.length !== 0) {
      if (dayFrom[0].availableFrom <= i) {
        const selectableHour = document.createElement("option");
        selectableHour.setAttribute("value", i);
        selectableHour.innerText = i;
        timeSelector.appendChild(selectableHour);
      }
    } else {
      const checkTime = eventsForDay.find((event) => {
        return event.time === i;
      });

      if (!checkTime) {
        const selectableHour = document.createElement("option");
        selectableHour.setAttribute("value", i);
        selectableHour.innerText = i;
        timeSelector.appendChild(selectableHour);
      }
    }
  }

  modalBackground.style.display = "block";
  newEventModal.style.display = "block";
}

function alertModal(message) {
  const alert = document.createElement("h3");
  alert.innerHTML = message;
  alertModalDiv.appendChild(alert);

  modalBackground.style.display = "block";
  alertModalDiv.style.display = "block";
}

function saveEvent() {
  const eventsForDay = events.filter((e) => {
    return e.date === clicked;
  });

  localEvents.push({
    date: clicked,
    time: eventTimeInput.value,
  });

  localStorage.setItem("localEvents", JSON.stringify(localEvents));

  closeModals("empty");

  location.reload();
}

function verifyDate(event) {
  let timeVeriff = 0;
  timeVeriff = Number(event.time) + clientTimeOffset;

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
    timeVeriff = -(24 - Number(event.time) - clientTimeOffset);
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

function fetchDiscount() {
  const fetchDiscountObject = {
    email: emailDiscount.value,
    serial: serialDiscount.value,
  };

  if (emailDiscount.value !== "" && serialDiscount.value !== "") {
    fetch("/sales/discount-validator", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      cache: "no-cache",
      body: JSON.stringify(fetchDiscountObject),
    })
      .then((resp) => resp.json())
      .then((resp) => {
        if (resp === "invalid") {
          document.querySelector("#discount-message").innerHTML =
            "<h3>Invalid Data</h3>";
          return;
        }

        localStorage.setItem("discount", JSON.stringify(resp));

        discountAlert();

        setTimeout(() => {
          location.reload();
        }, 500);
      })
      .catch((err) => {
        alertModal(
          "Error validating the discount. Reload the page, clear your booking or contact the admin"
        );

        setTimeout(() => {
          location.href = "/contact";
        }, 5000);
      });
  }
}

function fetchPrice() {
  const calcData = {
    eventsToCalc: localEvents,
  };

  fetch("/sales/price-calculator", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    cache: "no-cache",
    body: JSON.stringify(calcData),
  })
    .then((resp) => resp.json())
    .then((price) => {
      const priceTag = document.createElement("h2");
      const priceDiscount = document.createElement("h2");
      const priceTotal = document.createElement("h2");
      priceTag.innerText = `Your tutoring is $${price.tutoring}`;
      priceDiscount.innerText = `Discount - $${price.discount}`;
      priceTotal.innerText = `Your total is $USD ${price.total}`;
      fetchPriceContainer.appendChild(priceTag);
      fetchPriceContainer.appendChild(priceDiscount);
      fetchPriceContainer.appendChild(priceTotal);
    })
    .catch((err) => {
      console.log(err);
      alertModal(
        "Error getting the price. Reload the page, clear your booking or contact the admin"
      );
    });
}

function initButtons() {
  document.getElementById("nextButton").addEventListener("click", () => {
    selectedMonth >= 0 && selectedMonth < 3 ? selectedMonth++ : selectedMonth;
    load("not-booking");
  });

  document.getElementById("backButton").addEventListener("click", () => {
    selectedMonth <= 0 ? (selectedMonth = 0) : selectedMonth--;
    load("not-booking");
  });
}

function load(bookingRenderArg) {
  const date = new Date();

  if (selectedMonth !== 0) {
    date.setMonth(new Date().getMonth() + selectedMonth);
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1);

  const dateString = firstDayOfMonth.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const paddingDays = weekdays.indexOf(dateString.split(", ")[0]);

  document.getElementById(
    "monthDisplay"
  ).innerText = `${date.toLocaleDateString("en-GB", {
    month: "long",
  })} ${year}`;

  calendar.innerHTML = "";

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement("div");
    daySquare.classList.add("day");

    const dayString = `${i - paddingDays}-${month + 1}-${year}`;

    const nonAvailableDays = nonWorkingDays.find((day) => {
      return day.date === dayString;
    });

    if (i <= paddingDays) {
      daySquare.classList.add("non-active-day");
    } else if (i - paddingDays < day && selectedMonth === 0) {
      daySquare.classList.add("non-active-day");
      daySquare.innerText = i - paddingDays;
    } else if (i - paddingDays === day && selectedMonth === 0) {
      daySquare.classList.add("current-day");
      daySquare.innerText = i - paddingDays;
    } else if (nonAvailableDays && nonAvailableDays.availableFrom === false) {
      daySquare.classList.add("non-active-day");
      daySquare.innerText = i - paddingDays;
    } else if (i > paddingDays) {
      daySquare.classList.add("days-ahead");
      daySquare.innerText = i - paddingDays;

      const eventsForDay = events.filter((e) => {
        return e.date === dayString;
      });

      const previousEvent = reservedEvents.filter((e) => {
        return e.date === dayString;
      });
      const currentEvent = localEvents.filter((e) => {
        return e.date === dayString;
      });

      if (previousEvent.length !== 0) {
        previousEvent.forEach((event) => {
          const eventDiv = document.createElement("div");
          eventDiv.classList.add("previous-event");
          eventDiv.innerText = event.time + " Hrs";
          daySquare.appendChild(eventDiv);
        });
      }

      if (currentEvent.length !== 0) {
        currentEvent.forEach((event) => {
          const eventDiv = document.createElement("div");
          eventDiv.classList.add("event");
          eventDiv.innerText = event.time + " Hrs";
          daySquare.appendChild(eventDiv);
        });
      }

      daySquare.addEventListener("click", () => {
        const dayLocalEvent = localEvents.find((e) => e.date === dayString);

        const dayMatch = localEvents.findIndex(
          (findEvent) => findEvent.date === dayString
        );

        if (dayMatch > -1) {
          const removeEvent = JSON.parse(localStorage.getItem("localEvents"));
          removeEvent.splice(dayMatch, 1);
          localStorage.setItem("localEvents", JSON.stringify(removeEvent));
          return alertModal("You've removed the event");
        }

        if (localEvents.length < 8) {
          if (!dayLocalEvent && eventsForDay.length < 3) {
            eventModal(dayString);
          } else {
            alertModal(
              "You can only book a class per day and can only be up to 3 hours a day"
            );
          }
        } else {
          alertModal("You already booked the 8 days!");
        }
      });
    }

    calendar.appendChild(daySquare);
  }

  // -------- CALENDAR LOGIC --------

  if (discountLocal === true) {
    discountAlert();
  }

  if (bookingRenderArg !== "not-booking") {
    const timeOffsetInfo = document.createElement("li");
    timeOffsetInfo.classList.add("alert-text");
    timeOffsetInfo.innerText = `Your current time zone is: UTC${
      clientTimeOffset < 0 ? "" : "+"
    }${clientTimeOffset}`;
    bookingInfo.appendChild(timeOffsetInfo);

    if (localEvents.length >= 8) {
      const confirmButton = document.createElement("button");
      confirmButton.classList.add("buyButton");
      confirmButton.setAttribute("onclick", 'confirmBooking()')
      confirmButton.innerText = "Confirm Booking";
      buttonsCalendar.appendChild(confirmButton);
      fetchPrice();
    }

    localEvents.forEach((event) => {
      const eventText = document.createElement("h4");
      eventText.innerText = `${event.date} at ${event.time} Hrs`;
      bookingDate.appendChild(eventText);

      const suggestTime = document.createElement("h4");
      suggestTime.innerText = verifyDate(event);
      bookingSuggest.appendChild(suggestTime);
    });
  }
}

// -------- EVENT LISTENERS --------
window.addEventListener("click", closeModals);
saveButton.addEventListener("click", saveEvent);
cancelButton.addEventListener("click", closeModals);

initButtons();

load();
