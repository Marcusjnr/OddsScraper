/*******************************************************************
* This module makes sure the scraped data is constantly updated by scraping and updating the database 
* every 30minutes(1,800,000 milliseconds).
*/



//Require the master scraper to scrape and save all necessary data
const masterScraper = require('../scraper/masterScraper');
setInterval(() => {
	const browserInstance = require('../config/browser')();
	masterScraper(browserInstance);
}, 1800000); // restart the scraper every 30 minutes