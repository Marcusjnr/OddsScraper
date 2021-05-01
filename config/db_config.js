const express = require('express');
const app = express();
const mongoose = require('mongoose');

// const url = app.get('env') == "production" ? "mongodb+srv://user_akinola:user_akinola@cluster0-vqbjr.mongodb.net/test?retryWrites=true" : "mongodb://localhost:27017/OddsScraper";
const url = "mongodb+srv://user_akinola:user_akinola@cluster0-vqbjr.mongodb.net/test?retryWrites=true";

console.log("Environment is ", app.get('env'));

mongoose.connect(url, {
        useNewUrlParser: true,
        useFindAndModify: false
    })
    .then(success => console.log("Connection to mongoose successful"))
    .catch(err => console.error("Could not connect to mongoose ", err));

module.exports = mongoose;