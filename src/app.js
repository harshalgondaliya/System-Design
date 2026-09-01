const express = require("express");

const accountRoutes = require("./routes/account.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Bank API is running"
    });
});

app.use("/api/v1/accounts", accountRoutes);

module.exports = app;