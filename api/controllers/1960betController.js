/**
 * This module exports an Objects of express middlewares for different bet9ja routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */

const betSitesDB = require("../../models/betSitesSchema");
const filterData = require('../services/filterValidTeams'); //Filter out data with invalid ID's

module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'bet1960'})
    .then(bet1960Data => {
        // console.log("bet1960 data is ", bet1960Data[0].data[0]);
        req.bet1960PLData = bet1960Data[0].data[0]; //premier league
        req.bet1960LLData = bet1960Data[0].data[1]; //la liga 
        req.bet1960SAData = bet1960Data[0].data[2]; //serai A
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for bet1960",
                "err_message": err
            }
        })
    })
}