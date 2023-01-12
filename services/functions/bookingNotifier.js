const envConfig = require("../../envConfig");
const db = require("../../db/mongoConnect");
const SalesService = require("../dbServices/dbSalesService");
const DatesService = require("../dbServices/dbDatesServices");
const ClientService = require("../dbServices/dbClientService");
const clientModel = require("../../db/models/clientsModel");
const salesModel = require("../../db/models/salesModel");
const datesDB = new DatesService(db);
const salesDB = new SalesService(db, salesModel);
const clientDB = new ClientService(db, clientModel);
const suggestedDate = require("./suggestedDate");
const bookingNotifierTemplate = require("../../services/mailTemplateServices/bookingNotifierTemplate");
const bookingNotifierTemplateTutor = require("../../services/mailTemplateServices/bookingNotifierTemplateTutor");
const { transporterLR, transporterGmail } = require("../nodeMailerConfig");

function bookingNotifier() {
  // const today = "21-1-2023";

  let date = new Date()
  .toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
  .replace(/\//g, "-");

  date = date.split("-");

  let day = Number(date[0])
  let month = Number(date[1])
  let year = Number(date[2])

  const today = `${day}-${month}-${year}`


  return datesDB.reservedEventsSerial().then((serialList) => {

    const dayMatch = serialList.filter((day) => {
      return day.date === today;
    });

    dayMatch.forEach((event) => {
      return salesDB.getSale(event.serial).then((saleData) => {

        const bookingIndex = saleData.bookingDates.findIndex(day => {
          return day.date === today
        })

        return clientDB.getClient(saleData.serial).then((clientData) => {

          let mailData = {
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            bookingDay: `${saleData.bookingDates[bookingIndex].date} at ${saleData.bookingDates[bookingIndex].time}Hrs`,
            UTCOffset: saleData.clientUTC,
            suggestedTime: suggestedDate(saleData.bookingDates[bookingIndex], saleData.clientUTC),
          };

          const mailOptionsClient = {
            from: envConfig.admin_mail_outbound,
            to: clientData.email,
            subject: `We got class today!`,
            html: bookingNotifierTemplate(mailData),
          };

          const mailOptionsTutor = {
            from: envConfig.admin_mail_verif,
            to: envConfig.admin_mail_outbound,
            subject: `We got class today!`,
            html: bookingNotifierTemplateTutor(mailData),
          };

          transporterLR.sendMail(mailOptionsClient, function (error) {
            if (error) {
              console.log(`Error!: ${error}`);
            } else {
              console.log("Mail Sent!");
            }
          });

          transporterGmail.sendMail(mailOptionsTutor, function (error) {
            if(error) {
              console.log(`Error!: ${error}`);
            } else {
              console.log("Mail Sent!");
            }
          })
        });
      });
    });
  });
}

module.exports = bookingNotifier;
