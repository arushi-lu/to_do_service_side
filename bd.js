const {MongoClient} = require("mongodb");

const URL = "mongodb://127.0.0.1:27017/to_do";

let dbConnection;

module.exports = {
    connectToDB: (cb) => {
        MongoClient
        .connect(URL)
        .then((client) => {
            console.log("Connected to MongoDB");
            dbConnection = client.db();
            console.log(dbConnection)
            return cb();
        })
        .catch((err)=>{
            return cb(err);
        })
    },
    getDB: () => dbConnection,
}
