 /**
 * This module exports an Objects of express middlewares for different sureBet routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */ 

const betSitesDB = require("../../models/betSitesSchema");
const filterData = require('../services/filterValidTeams'); //Filter out data with invalid ID's


module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'sureBet'})
    .then(sureBetData => {
        req.sureBetPLData = sureBetData[0].data[0]; //premier league
        req.sureBetLLData = sureBetData[0].data[1]; //la liga 
        req.sureBetSAData = sureBetData[0].data[2]; //seria A
        // req.sureBetEUData = filterData(sureBetData[0].data[3]); //European Championship
        // req.sureBetMLSData = filterData(sureBetData[0].data[4]); //Major League Soccer
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for sureBet",
                "err_message": err
            }
        })
    })
}
