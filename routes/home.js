const express = require("express");
const axios = require("axios");
const path = require("path");


const router = express.Router();


router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = router;
