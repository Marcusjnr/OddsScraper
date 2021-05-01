/*************************************************************
* This module contains a single function that  is used to update the information of the oldly scraped
* data to that of the newly scraped data 
* @param updateDB - {Object} - Updates the collection with newly scraped data
* @property siteName - {String} - The name of the site being updated
* @property dataObj - {Object} - The scraped data being updated
*/

const betSitesDB = require("../models/betSitesSchema");


function updateDB(siteName, dataObj){
	betSitesDB.findOneAndUpdate(
	{"siteName": siteName},
	{data: dataObj}
	)
	.then(ress => {
		console.log(`Data for ${siteName} sucessfully Updated , ${ress}`);
	}).catch(err => console.log("errr ", err))
}

// updateDB('bet9ja', {"success": true, "data": "Updated" });
module.exports = updateDB;
