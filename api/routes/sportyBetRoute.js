const express = require('express');
const app = express();

const sportyBetController = require('../controllers/sportyBetRouteController');

app.get('/sportybet/test', (req, res) => {
    res.json({
        success: true,
        route: "sportybet"
    });
});


//for premier leagues
app.get('/sportyBet/pl', sportyBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sportyBetPLData;
    res.status(200).json({
        "success": true,
        "site": "sportyBet",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/sportyBet/ll', sportyBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sportyBetLLData;
    res.status(200).json({
        "success": true,
        "site": "sportyBet",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

// for seriaA
app.get('/sportyBet/sa', sportyBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sportyBetSAData;
    res.status(200).json({
        "success": true,
        "site": "sportyBet",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});

//for european championship
app.get('/sportyBet/eu', sportyBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sportyBetEUData;
    res.status(200).json({
        "success": true,
        "site": "sportyBet",
        "league": "European championship",
        "marketCount": data.length,
        "market": data
    });
});

// for Major League Soccer
app.get('/sportyBet/mls', sportyBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.sportyBetMLSData;
    res.status(200).json({
        "success": true,
        "site": "sportyBet",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    });
});


module.exports = app;