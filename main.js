// -------- DEPENDENCIES --------
const dotEnv = require("dotenv").config();
const envConfig = require("./envConfig");
const compression = require("compression")
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const schedule =require('node-schedule');
const bookingNotifier = require("./services/functions/bookingNotifier")

// ------- SERVER SCHEDULER --------
const rule = new schedule.RecurrenceRule();
rule.hour = 0
rule.minute = 5

const job = schedule.scheduleJob(rule, function(){
  bookingNotifier()
})

// -------- DEFINITIONS -------
const app = express();
const currentYear = new Date().getFullYear();

// -------- MAIN MIDDLEWARES --------
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: envConfig.session_secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      path: "/",
      // secure: true,
      sameSite: true,
    },
  })
);
app.use(express.static("public"));
app.use(cors());

// -------- TEMPLATE GENERATOR --------
app.set("view engine", "ejs");
app.set("views", "./ejs/views");

// -------- ROUTERS ---------
const mainRouter = require("./routers/mainRouter");
const salesRouter = require("./routers/salesRouter");
const distRouter = require("./routers/distRouter");

// ------- ROUTES --------
app.use("/", mainRouter);
app.use("/sales", salesRouter);
app.use("/dist", distRouter);

app.get('*', (req, res) => {
  return res.status(404).render('error', {
    pageTitle: "Nope!",
    date: currentYear,
    message: `This one does not exist!`,
  })
})

// -------- SERVER LISTEN --------
const server = app.listen(envConfig.port, envConfig.host, () =>
  console.log(
    `Server ready and listening on http://${envConfig.host}:${envConfig.port}`
  )
);
