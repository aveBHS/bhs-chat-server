const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/", {
     useNewUrlParser: true 
});

mongoClient.connect((err, client) => {

    const DB = client.db("messanger");
    const usersDB = DB.collection("users");
    const messagesDB = DB.collection("messages");

    app.get("/", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({"msg": "Hello, world!"}));
    });

    app.get("/api/users/:id", (req, res) => {
        usersDB.find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
            console.log(result);
            res.setHeader("Content-Type", "application/json");
            res.send(JSON.stringify(result[0]));
        });
    });

    app.listen(3000);

});