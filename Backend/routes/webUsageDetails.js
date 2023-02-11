const express = require("express");

const { postWebData, putWebData, getAllwebData } = require("../controllers/webData");
const router = express.Router();

router.post("/web-data", postWebData);
// router.get("/web-data/:id", getCentre);
router.put("/web-data", putWebData);
// router.delete("/centre/:id", deleteCentre)
router.get("/web-data-all", getAllwebData)


module.exports = router;