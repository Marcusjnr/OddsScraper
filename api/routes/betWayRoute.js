const express = require('express');
const app = express();

const betwayController = require('../controllers/betWayRouteController');

app.get('/betway/test', (req, res) => {
    res.json({
        success: true,
        route: "betway"
    });
});
 
 //for premier leagues
app.get('/betway/pl', betwayController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betwayPLData;
    res.status(200).json({
        "success": true,
        "site": "betway",
        "league": "Premier League",
        "marketCount": data.length,
        "market": data
    })
});

//for la liga
app.get('/betway/ll', betwayController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betwayLLData;
    res.status(200).json({
        "success": true,
        "site": "betway",
        "league": "La Liga",
        "marketCount": data.length,
        "market": data
    })
});

//for seria A
app.get('/betway/sa', betwayController, (req, res, next) => {
    //Routes to get all premier leagues odds
    let data = req.betwaySAData;
    res.status(200).json({
        "success": true,
        "site": "betway",
        "league": "Seria A",
        "marketCount": data.length,
        "market": data
    });
});

//for european championship
app.get('/betway/eu', betwayController, (req, res, next) => {
    //Routes to get all european championship odds
    let data = req.betwayEUData;
    res.status(200).json({
        "success": true,
        "site": "betway",
        "league": "European championship",
        "marketCount": data.length,
        "market": data
    });
});

//for major league soccer
app.get('/betway/mls', betwayController, (req, res, next) => {
    //Routes to get all european championship odds
    let data = req.betwayMLSData;
    res.status(200).json({
        "success": true,
        "site": "betway",
        "league": "Major League Soccer",
        "marketCount": data.length,
        "market": data
    });
});


module.exports = app;