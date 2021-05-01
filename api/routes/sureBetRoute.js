const express = require('express');
const app = express();

const sureBetController = require('../controllers/sureBetRouteController');

app.get('/surebet/test', (req, res) => {
    res.json({
        success: true,
        route: "surebet"
    });
});




//for premier leagues
app.get('/sureBet/pl', sureBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sureBetPLData;
    res.status(200).json({
        "success": true,
        "site": "sureBet",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/sureBet/ll', sureBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sureBetLLData;
    res.status(200).json({
        "success": true,
        "site": "sureBet",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

//for seria A
app.get('/sureBet/sa', sureBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sureBetSAData;
    res.status(200).json({
        "success": true,
        "site": "sureBet",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});

//for european championship
app.get('/sureBet/eu', sureBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sureBetEUData;
    res.status(200).json({
        "success": true,
        "site": "sureBet",
        "league": "European Championship",
        "marketCount": data.length,
        "market": data
    });
});

//for Major League Soccer
app.get('/sureBet/mls', sureBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sureBetMLSData;
    res.status(200).json({
        "success": true,
        "site": "sureBet",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    });
});


module.exports = app;
