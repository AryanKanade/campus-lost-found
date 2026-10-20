const express = require("express");
const router = express.Router();

const { createReport, getReports } = require("../controllers/reportController");

router.get("/", getReports);
router.post("/", createReport);

module.exports = router;
