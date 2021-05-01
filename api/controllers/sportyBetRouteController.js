/**
 * This module exports an Objects of express middlewares for different bet9ja routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */

const betSitesDB = require("../../models/betSitesSchema");

function filterData(events){
    let data = events;
    console.log("length ", data.length);
    data.shift(); //remove the array of dates from the data
    let validData = data.filter(event => event.eventID.search('00') === -1);
    console.log("The data ID is ", validData);
    return validData;
}

module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'sportyBet'})
    .then(sportyBetData => {
        // console.log("The data is ", sportyBetData[0].data[0]);
        req.sportyBetPLData = sportyBetData[0].data[0]; //premier league
        req.sportyBetLLData = sportyBetData[0].data[1]; //la liga
        req.sportyBetSAData = sportyBetData[0].data[2]; //serai A
        // req.sportyBetEUData = filterData(sportyBetData[0].data[3]); //European Championship
        // req.sportyBetMLSData = sportyBetData[0].data[4]; //Major League Soccer
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for sportyBet",
                "err_message": err
            }
        })
    })
}