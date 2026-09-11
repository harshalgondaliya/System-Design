const express = require("express");

const v1AccountRoutes = require("./routes/v1/account.routes");
const v2AccountRoutes = require("./routes/v2/account.routes");

const { graphqlHTTP } = require("express-graphql");
const { schema, root } = require("./graphql/schema");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Bank API is running",
        rest: ["/api/v1/accounts", "/api/v2/accounts"],
        graphql: "/graphql"
    });
});

// REST API Version 1
app.use("/api/v1/accounts", v1AccountRoutes);

// REST API Version 2
app.use("/api/v2/accounts", v2AccountRoutes);

// GraphQL
app.use(
    "/graphql",
    graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true
    })
);

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
