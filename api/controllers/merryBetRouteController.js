/**
 * This module exports an Objects of express middlewares for different bet9ja routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */ 

const betSitesDB = require("../../models/betSitesSchema");
const filterData = require('../services/filterValidTeams'); //Filter out data with invalid ID's


module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'merryBet'})
    .then(merryBetData => {
        // console.log("The merrybet data is ", merryBetData);
        req.merryBetPLData = merryBetData[0].data[0]; //premier leagu
        req.merryBetLLData = merryBetData[0].data[1]; //la liga 
        req.merryBetSAData = merryBetData[0].data[2]; //serai A
        // req.merryBetEUData = filterData(merryBetData[0].data[3]); //European League
        // req.merryBetMLSData = filterData(merryBetData[0].data[3]); //Major League Soccer

        console.log('The data is ', req.merryBetPLData);
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for merryBet",
                "err_message": err
            }
        })
    })
}
