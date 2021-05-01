const express = require('express');
const app = express();

const bet1960Controller = require('../controllers/1960betController');

const updateDB = require('../../config/db_update');

const betSitesDB = require("../../models/betSitesSchema");

const generateID = require('../services/uniqueIdGenerator');

app.get('/bet1960/test', (req, res) => {
    res.json({
        success: true,
        route: "bet1960"
    });
});



//for premier leagues
app.get('/bet1960/pl', bet1960Controller, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet1960PLData;
    res.status(200).json({
        "success": true,
        "site": "bet1960",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/bet1960/ll', bet1960Controller, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet1960LLData;
    res.status(200).json({
        "success": true,
        "site": "bet1960",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

//for seria A
app.get('/bet1960/sa', bet1960Controller, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet1960SAData;
    res.status(200).json({
        "success": true,
        "site": "bet1960",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});

//for European Championship
app.get('/bet1960/eu', bet1960Controller, (req, res, next) => {
    //Routes to get all European Championship odds
    betSitesDB.find({'siteName':'bet1960eu'})
    .then(bet1960Data => {
        let data = bet1960Data[0].data; //European Championship
        res.status(200).json({
            "success": true,
            "site": "bet1960",
            "league": "European Championship",
            "marketCount": data.length,
            "market": data
        });
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for bet1960",
                "err_message": err
            }
        })
    })
});

//for Major League Soccer
app.get('/bet1960/mls', bet1960Controller, (req, res, next) => {
    //Routes to get all Major League Soccer odds
    betSitesDB.find({'siteName':'bet1960mls'})
    .then(bet1960Data => {
        let data = bet1960Data[0].data; //European Championship
        res.status(200).json({
            "success": true,
            "site": "bet1960",
            "league": "Major League Soccer",
            "marketCount": data.length,
            "market": data
        });
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for bet1960",
                "err_message": err
            }
        })
    })
});

module.exports = app;