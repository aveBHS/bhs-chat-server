const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const app = express();

mongoClient.connect((err, client) => {

    const DB = client.db("messanger");
    const usersDB = DB.collection("users");
    const messagesDB = DB.collection("messages");
    const tokensDB = DB.collection("tokens");

    app.get("/", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({"msg": "Hello, world!"}));
    });

    app.get("/api/users/:id", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        try{
            usersDB.find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
                res.status(200).send(JSON.stringify(result[0]));
            });
        }
        catch{
            res.status(400).send(JSON.stringify({err: "Неверный UserID"}));
        }
    });

    app.get("/api/messages/:method", (req, res) => {
        res.setHeader("Content-Type", "application/json");

        let method = req.params.method;

        if(req.query.token == undefined){
            res.status(403).send(JSON.stringify({err: "Требуется токен"}));
        }
        tokensDB.find({token: req.query.token}).toArray((err, result) => {
            if(result.length == 0){
                res.status(403).send(JSON.stringify({err: "Неверный токен"}));
                return;
            }
            let userId = result[0].userId;

            switch(method){
                case "getMessages":
                    res.send(JSON.stringify({userId: userId}));
                    return;
                case "getMessage":
                    res.send(JSON.stringify({userId: userId}));
                    return;
                case "getDialoges":
                    res.send(JSON.stringify({userId: userId}));
                    return;
                default:
                    res.status(405).send(JSON.stringify({err: "Такого метода не существует"}));
                    return;
            }
        });
    });

    app.listen(3000);

});