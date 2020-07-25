exports.checkToken = function (token, db){
    db.find({token: token}).toArray((err, result) => {
        return true;
    });
}