/**
 * This module exports an Objects of express middlewares for different bet9ja routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */
const betSitesDB = require("../../models/betSitesSchema");
const filterData = require('../services/filterValidTeams'); //Filter out data with invalid ID's


module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'bet9ja'})
    .then(bet9jaData => {
        req.bet9jaPLData = bet9jaData[0].data[0]; //premier league 
        req.bet9jaLLData = bet9jaData[0].data[1]; //la liga 
        req.bet9jaSAData = bet9jaData[0].data[2]; //serai A 
        // req.bet9jaEUData = filterData(bet9jaData[0].data[3]); //EU
        // req.bet9jaMLSData = filterData(bet9jaData[0].data[4]); //Mls
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": "Could not find any data for bet9ja",
                "err_message": err
            }
        })
    })
}








// {
//     "premierLeague": (req, res, next) => {
//         betSitesDB.find({'siteName':'bet9ja'})
//         .then(bet9jaData => {
//             req.bet9jaPLData = bet9jaData;
//         });
//         next();
//     },
//     "laLiga": (req, res, next) => {
//         req.bet9jaLLData = bet9jaScraper.fetchLiga();
//         next();
//     },
//     "seriaA": (req, res, next) => {
//         req.bet9jaSAData = bet9jaScraper.fetchSeria();
//         next();
//     },
//     "all": (req, res, next) => {
//         Promise.all(
//                 bet9jaScraper.fetchPL()
//                 .then(data => {
//                     req.bet9jaPLData = data;
//                 }),
//                 bet9jaScraper.fetchSeria()
//                 .then(data => {
//                     req.bet9jaSAData = data;
//                 }),
//                 bet9jaScraper.fetchLiga()
//                 .then(data => {
//                     req.bet9jaLLData = data;
//                 })
//             )
//             .then(res => {
//                 next();
//             })
//     }
// }