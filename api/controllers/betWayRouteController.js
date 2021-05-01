 /**
 * This module exports an Objects of express middlewares for different betway routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */

const betSitesDB = require("../../models/betSitesSchema");
const filterData = require('../services/filterValidTeams'); //Filter out data with invalid ID's


module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'betway'})
    .then(betwayData => {
        req.betwayPLData = betwayData[0].data[0]; //premier league
        req.betwayLLData = betwayData[0].data[1]; //la liga 
        req.betwaySAData = betwayData[0].data[2]; //serai A
        // req.betwayEUData = filterData(betwayData[0].data[3]); //European championship
        // req.betwayMLSData = filterData(betwayData[0].data[4]); //Major League Soccer
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for betway",
                "err_message": err
            }
        })
    })
}
