const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const WebSocketServer = require("ws");

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const app = express();
function time(){ return parseInt(new Date().getTime()/1000) }

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
                if(result.length == 0){
                    res.status(400).send(JSON.stringify({err: "Неверный userId"}));
                    return;
                }
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
                case "get":
                    if(req.query.userId == undefined){
                        res.status(403).send(JSON.stringify({err: "Запрос должен содержать поле userId"}));
                    }
                    else{
                        try{
                            usersDB.find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
                                if(result.length == 0){
                                    res.status(400).send(JSON.stringify({err: "Неверный userId"}));
                                    return;
                                }
                                let limit = 25;
                                let offset = 0;
                                if(req.query.limit != undefined){
                                    limit = +req.query.limit;
                                    if(limit <= 0){
                                        res.status(406).send(JSON.stringify({err: "Недопустимое значение поля limit"}));
                                        return;
                                    }
                                }
                                if(req.query.offset != undefined){
                                    offset = +req.query.offset;
                                    if(offset <= 0){
                                        res.status(406).send(JSON.stringify({err: "Недопустимое значение поля offset"}));
                                        return;
                                    }
                                }
                                messagesDB.find({
                                    fromId: {$in: [userId.toString(), req.query.userId]}, 
                                    toId: {$in: [req.query.userId, userId.toString()]}
                                }, {_id: 0}).skip(offset).limit(limit).toArray((err, result) => {
                                    res.send(JSON.stringify({messages: result})); 
                                });
                            });
                        }
                        catch{
                            res.status(400).send(JSON.stringify({err: "Неверный UserID"}));
                        }
                    }
                    return;
                case "send":
                    if(req.query.userId == undefined){
                        res.status(403).send(JSON.stringify({err: "Запрос должен содержать поле userId"}));
                        return;
                    }
                    if(req.query.text == undefined){
                        res.status(403).send(JSON.stringify({err: "Запрос должен содержать поле text"}));
                        return;
                    }
                    else if(req.query.text.length > 8192){
                        res.status(403).send(JSON.stringify({err: "Ограничение текста 8192 символа"}));
                        return;
                    }
                    if(req.query.attacments == undefined){
                        req.query.attacments = "";
                    }
                    try{
                        usersDB.find({_id: ObjectID(req.params.id)}).toArray((err, result) => {
                            if(result.length == 0){
                                res.status(400).send(JSON.stringify({err: "Неверный userId"}));
                                return;
                            }
                            messagesDB.insertOne({
                                text: req.query.text, 
                                attacments: req.query.attacments,
                                fromId: userId, 
                                toId: req.query.userId,
                                date: time(),
                                editDate: -1
                            }, (err, result) => {
                                if(err) res.status(500).send(JSON.stringify({err: err}));
                                else{
                                    res.sendStatus(200);
                                }
                            });
                        });
                    }
                    catch{
                        res.status(400).send(JSON.stringify({err: "Неверный UserID"}));
                    }
                    return;
                default:
                    res.status(405).send(JSON.stringify({err: "Такого метода не существует"}));
                    return;
            }
        });
    });

    app.listen(3000);

});