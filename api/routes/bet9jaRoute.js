const express = require('express');
const app = express();

const bet9jaController = require('../controllers/bet9jaRouteController');

//Used to test if the API route is working as it should
app.get('/bet9ja/test', (req, res) => {
    res.json({
        success: true,
        route: "bet9ja"
    });
});

//for premier leagues
app.get('/bet9ja/pl', bet9jaController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet9jaPLData;
    res.status(200).json({
        "success": true,
        "site": "bet9ja",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    });
});

//for la liga
app.get('/bet9ja/ll', bet9jaController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet9jaLLData;
    res.status(200).json({
        "success": true,
        "site": "bet9ja",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    });
});

app.get('/bet9ja/sa', bet9jaController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet9jaSAData;
    res.status(200).json({
        "success": true,
        "site": "bet9ja",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    })
});


app.get('/bet9ja/eu', bet9jaController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet9jaEUData;
    res.status(200).json({
        "success": true,
        "site": "bet9ja",
        "league": "European Championship",
        "marketCount": data.length,
        "market": data
    })
});

app.get('/bet9ja/mls', bet9jaController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.bet9jaMLSData;
    res.status(200).json({
        "success": true,
        "site": "bet9ja",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    })
});

module.exports = app;