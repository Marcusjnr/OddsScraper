 /**
 * This module exports an Objects of express middlewares for different nairaBet routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */

const betSitesDB = require("../../models/betSitesSchema");
const filterData = require('../services/filterValidTeams'); //Filter out data with invalid ID's


module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'nairaBet'})
    .then(nairaBetData => {
        req.nairaBetPLData = nairaBetData[0].data[0]; //premier league
        req.nairaBetLLData = nairaBetData[0].data[1]; //la liga 
        req.nairaBetSAData = nairaBetData[0].data[2]; //serai A
        // req.nairaBetEUData = filterData(nairaBetData[0].data[3]); //European League
        // req.nairaBetMLSData = filterData(nairaBetData[0].data[4]); //Major League Soccer
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for nairaBet",
                "err_message": err
            }
        })
    })
}
