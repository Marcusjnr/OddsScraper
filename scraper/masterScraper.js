/**
* The script in this page launches a single browser instance and uses it to scrape data from each of the pages 
* by using their respective scraper modules. This information is being saved in a database and can be later
* via the API provided by this Application
*/
// const browserInstance = require('../config/browser')();

const updateDB = require('../config/db_update');

const bet9ja = require('./bet9jaScraper');

const betKing = require('./betKingScraper');

const bet1960 = require('./1960betScraper.js');

const merryBet = require('./merryBetScraper.js');

const sportyBet = require('./sportyBetScraper.js');

const nairaBet = require('./nairaBetScraper');

const sureBet = require('./sureBetScraper');

const betway = require('./betWayScraper');

function scrapeAll(instance){
	//Scrape data for all websites
	instance.then(async browser => {
	
		//Fetch all bet9ja Data below
		await bet9ja.fetchData(browser).then(bet9jaData => {
			if(bet9jaData){
				updateDB('bet9ja', bet9jaData);
			}
			else{
				console.log("An error occured, couldn't scrape data for bet9ja");
			}
		})

		//fetch all betKing data 
		await betKing.betKingFetcher(browser).then(betKingData => {
			// console.log("the data is ", betKingData);
			if(betKingData){
				updateDB('betKing', betKingData);
				console.log("betKing data is ", betKingData);
			}
			else{
				console.log("An error occured, couldn't scrape data for bet king");
			}
		});

		// await bet1960.bet1960Fetcher2(browser).then(bet1960Data => {
		// 	if(bet1960Data){
		// 		console.log('updated data is ', bet1960Data);
		// 		updateDB('bet1960', bet1960Data);
		// 	}
		// 	else{
		// 		console.log("An error occured, couldn't scrape data for bet1960");
		// 	}
		// }); 

		await merryBet.fetchAll(browser).then(merryBetData => {
			// console.log("the res is ", res);
			if(merryBetData){
				console.log('updated data is ', merryBetData);
				updateDB('merryBet', merryBetData);
			}
			else{
				console.log("An error occured, couldn't scrape data for merry bet");
			}
		});
		
		await sportyBet.sportyBetFetcher(browser).then(sportyBetData => {
			if(sportyBetData){
				console.log("sportybet data is ", sportyBetData);
				updateDB('sportyBet', sportyBetData);
			}
			else{
				console.log("An error occured, couldn't scrape data for sporty bet");
			}
			// console.log("the res is ", res);
		});
		
		await sureBet.sureBetFetcher(browser).then(sureBetData => {
			// console.log("The res is ", res);
			if(sureBetData){
				updateDB('sureBet', sureBetData);
				console.log(sureBetData);
			}
			else{
				console.log("An error occured, couldn't scrape data for sure bet");
			}
		});


		await betway.betwayFetcher(browser).then(betwayData => {
			if(betwayData){
				// console.log("The betway data is ", betwayData);
				updateDB('betway', betwayData);	
			}
			else{
				console.log("An error occured, couldn't scrape data for betway");
			}
		});
/*
		await nairaBet.nairaBetFetcher(browser).then(nairaBetData => {
			if(nairaBetData){
				updateDB('nairaBet', nairaBetData);
				console.log("The nairabet DB was updated with the data ", nairaBetData);
			}
			else{
				console.log("An error occured, couldn't scrape data for naira bet");
			}
		});
*/

		setTimeout(() => {
			browser.close(); // close the browser when all pages finish scraping
			console.log(`The browser has been successfully closed !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
		}, 10000)
		
	});
}

module.exports = scrapeAll;
