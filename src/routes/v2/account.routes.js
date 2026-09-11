const express = require("express");
const controller = require("../../controllers/account.controller");

const router = express.Router();

router.route("/").get(controller.listV2).post(controller.createV2);
router.route("/:id")
    .get(controller.getV2)
    .put(controller.replaceV2)
    .patch(controller.updateV2)
    .delete(controller.deleteV2);

module.exports = router;
