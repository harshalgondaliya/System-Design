const app = require("./app");

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Bank API running on http://localhost:${PORT}`);
});