const express = require('express');
const app = express();

const betKingController = require('../controllers/betKingRouteController');

app.get('/betking/test', (req, res) => {
    res.json({
        success: true,
        route: "betKing"
    });
});

//for premier leagues
app.get('/betKing/pl', betKingController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betKingPLData;
    res.status(200).json({
        "success": true,
        "site": "betKing",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/betKing/ll', betKingController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betKingLLData;
    res.status(200).json({
        "success": true,
        "site": "betKing",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

app.get('/betKing/sa', betKingController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betKingSAData;
    res.status(200).json({
        "success": true,
        "site": "betKing",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});

app.get('/betKing/eu', betKingController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betKingEUData;
    res.status(200).json({
        "success": true,
        "site": "betKing",
        "league": "European Championship",
        "marketCount": data.length,
        "market": data
    });
});

app.get('/betKing/mls', betKingController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betKingMLSData;
    res.status(200).json({
        "success": true,
        "site": "betKing",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    });
});


module.exports = app;