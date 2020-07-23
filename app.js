const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({"msg": "Hello, world!"}));
});

app.listen(80);