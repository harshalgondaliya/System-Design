const express = require("express");
const controller = require("../../controllers/account.controller");

const router = express.Router();

router.route("/").get(controller.listV1).post(controller.createV1);
router.route("/:id")
    .get(controller.getV1)
    .put(controller.replaceV1)
    .patch(controller.updateV1)
    .delete(controller.deleteV1);

module.exports = router;
