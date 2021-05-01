const betSitesDB = require("../models/betSitesSchema");
/***********************
* This script check if any data has been inserted in the database for any of the sites, if none is found. 
* It initializes it in the database with an empty value which is to be later updated
************************/

const sites = ['bet1960', 'bet9ja', 'betKing', 'betway', 'merryBet', 'nairaBet', 'sportyBet', 'sureBet'];

sites.forEach(site => {
	betSitesDB.find({'siteName': site})
	.then(data => {
		if(data.length === 0){
			betSitesDB.create({siteName: site, data: []})
			.then(res => {
				console.log("successfully initialized the data ", res);
			})
			.catch(err => console.log("Could not initialize the data ", err));
		}
		else{
			console.log(`Found ${data.length} for ${site}`);
		}
	})
	.catch(err => console.log("Could not initialize the data => ", err));
});


// betSitesDB.find({'siteName':'bet1960'})
// .then(async res => {
// 	console.log(res);
// }); 
