const express = require('express');
const app = express();

const merryBetController = require('../controllers/merryBetRouteController');

app.get('/merrybet/test', (req, res) => {
    res.json({
        success: true,
        route: "merrybet"
    });
});
 

//for premier leagues
app.get('/merryBet/pl', merryBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.merryBetPLData;
    console.log("The route data is ", data);
    res.status(200).json({
        "success": true,
        "site": "merryBet",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/merryBet/ll', merryBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.merryBetLLData;
    res.status(200).json({
        "success": true,
        "site": "merryBet",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

//for seria A
app.get('/merryBet/sa', merryBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.merryBetSAData;
    res.status(200).json({
        "success": true,
        "site": "merryBet",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});


//for European League
app.get('/merryBet/eu', merryBetController, (req, res, next) => {
    //Routes to get all european leagues odds
    let data = req.merryBetEUData;
    res.status(200).json({
        "success": true,
        "site": "merryBet",
        "league": "European League",
        "marketCount": data.length,
        "market": data
    });
});

//for Major League Soccer
app.get('/merryBet/mls', merryBetController, (req, res, next) => {
    //Routes to get all european leagues odds
    let data = req.merryBetMLSData;
    res.status(200).json({
        "success": true,
        "site": "merryBet",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    });
});

module.exports = app;