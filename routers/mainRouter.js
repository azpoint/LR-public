// -------- DEPENDENCIES --------
const envConfig = require("../envConfig");
const express = require("express");
const { Router } = require("express");
const { transporterGmail } = require("../services/nodeMailerConfig");

// --------- DATABASE ---------
const flags = require("../db/flags");
const ProductService = require("../services/dbServices/dbProductService");
const productsModel = require("../db/models/productsModel");
const db = require("../db/mongoConnect");
const productsDB = new ProductService(db, productsModel);

// -------- DEFINITIONS --------
const mainRouter = Router();
const currentYear = new Date().getFullYear();



// -------- ENDPOINTS ---------
mainRouter.get("/", (req, res) => {
  res.render("index", {
    pageTitle: "Master Rhino Surfacing",
    flags: flags,
    date: currentYear,
  });
});

mainRouter.get("/aboutbook", (req, res) => {
  res.render("about-book", {
    pageTitle: "About Master Rhino Surfacing",
    date: currentYear,
  });
});

mainRouter.get("/products", (req, res) => {
  let productList = [];

  (async () => {
    productList = await productsDB.getAllProducts();

    return res.render("products", {
      pageTitle: "Products",
      date: currentYear,
      productList: productList,
    });
  })();
});

mainRouter.get("/products/:productCode", (req, res) => {
  let productCode = req.params.productCode;

  let productDetail = null;

  (async () => {
    productDetail = await productsDB.getOneProduct(productCode);
    return res.render("product-detail", {
      pageTitle: productDetail.productName,
      date: currentYear,
      product: productDetail,
    });
  })();
});

mainRouter.get("/free-tutorials", (req, res) => {
  return res.render("free-tutorials", {
    pageTitle: "Free Tutorials",
    date: currentYear,
  });
});

mainRouter.get("/about-author", (req, res) => {
    console.log(req.session)
  return res.render("about-author", {
    pageTitle: "About the Author",
    date: currentYear,
  });
});

mainRouter.get("/contact", (req, res) => {
  return res.render("contact", { pageTitle: "Contact", date: currentYear });
});

mainRouter.post("/contact", (req, res) => {
  const mailOptions = {
    from: envConfig.admin_mail_verif,
    to: envConfig.admin_mail_outbound,
    subject: `CONTACT from learnrhino ${req.body.senderName}`,
    html: `${req.body.senderMessage}`,
    replyTo: req.body.senderMail,
  };
  transporterGmail.sendMail(mailOptions, function (error) {

    if (error) {
      return res.render("error", {
        pageTitle: "Error",
        date: currentYear,
        message: "Your message wasn't sent",
      });
    } else {
      return res.render("success", {
        pageTitle: "Success",
        date: currentYear,
        message: "Your message was sent",
      });
    }
  });
});

mainRouter.get("/downloads/:filename", (req, res) => {
  const fileName = req.params.filename;

  return res.download(__dirname + "./public/downloads", `${fileName}`);
});

module.exports = mainRouter;
