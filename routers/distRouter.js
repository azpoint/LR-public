// ---------- DEPENDENCIES ---------
const envConfig = require("../envConfig");
const express = require("express");
const { Router } = require("express");

// ---------- DEFINITIONS --------
const distRouter = Router();
const currentYear = new Date().getFullYear();

// -------- DATABASE --------
const SalesService = require("../services/dbServices/dbSalesService");
const db = require("../db/mongoConnect");
const salesModel = require("../db/models/salesModel");
const salesDB = new SalesService(db, salesModel);

// -------- MIDDLEWAREs --------
const carFileAttemp = function (req, res, next) {
  const orderNumber = Number(req.params.orderNumber);

  if (orderNumber !== NaN) {
    return salesDB
      .verifCarFile(orderNumber)
      .then((resp) => {
        if (resp === "Not valid access") {
          return res.render("error", {
            pageTitle: "Nope!",
            date: currentYear,
            message: `You don't have valid access to this file`,
          });
        } else if (resp === "next") {
          next();
        } else if (resp === "limit") {
          return res.render("error", {
            pageTitle: "Nope!",
            date: currentYear,
            message: `You've reach the download limit`,
          });
        }
      })
      .catch((e) => {
        return res.render("error", {
          pageTitle: "Nope!",
          date: currentYear,
          message: `Invalid Data`,
        });
      });
  } else if (orderNumber === NaN) {
    return res.render("error", {
      pageTitle: "Nope!",
      date: currentYear,
      message: `Invalid Data`,
    });
  }
};

// --------- ENDPOINTS ---------
distRouter.get("/downloads/carFile/:orderNumber", carFileAttemp, (req, res) => {
  let filePath =
    __dirname + "/../public/downloads/Porsche-911-Turbo-S-2016-Rhino-Model.zip";
  let fileName = "Porsche-911-Turbo-S-2016-Rhino-Model.zip";

  return res.download(filePath, fileName);
});


module.exports = distRouter;
