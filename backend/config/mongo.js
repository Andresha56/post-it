const mongoose = require("mongoose");
const logger = require("./logger");

mongoose.Promise = Promise;

mongoose.connection.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err}`);
    process.exit(-1);
});

if (process.env.NODE_ENV === "production") {
    mongoose.set("debug", false);
}

exports.connect = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected..."));
    return mongoose.connection;
};
