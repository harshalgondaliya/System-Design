const express = require("express");

const {
    getAllAccounts,
    getAccountById
} = require("../controllers/account.controller");

const router = express.Router();

router.get("/", getAllAccounts);

router.get("/:id", getAccountById);

module.exports = router;