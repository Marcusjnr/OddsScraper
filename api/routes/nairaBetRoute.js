const express = require('express');
const app = express();


const nairaBetController = require('../controllers/nairaBetRouteController');

app.get('/nairabet/test', (req, res) => {
    res.json({
        success: true,
        route: "nairabet"
    });
});



//for premier leagues
app.get('/nairaBet/pl', nairaBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.nairaBetPLData;
    res.status(200).json({
        "success": true,
        "site": "nairaBet",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/nairaBet/ll', nairaBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.nairaBetLLData;
    res.status(200).json({
        "success": true,
        "site": "nairaBet",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

//for seria A
app.get('/nairaBet/sa', nairaBetController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.nairaBetSAData;
    res.status(200).json({
        "success": true,
        "site": "nairaBet",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});

//for European League
app.get('/nairaBet/eu', nairaBetController, (req, res, next) => {
    //Routes to get all european league odds
    let data = req.nairaBetEUData;
    res.status(200).json({
        "success": true,
        "site": "nairaBet",
        "league": "European League",
        "marketCount": data.length,
        "market": data
    });
});

//for Major League Soccer
app.get('/nairaBet/mls', nairaBetController, (req, res, next) => {
    //Routes to get all major league soccer odds
    let data = req.nairaBetMLSData;
    res.status(200).json({
        "success": true,
        "site": "nairaBet",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    });
});


module.exports = app;
