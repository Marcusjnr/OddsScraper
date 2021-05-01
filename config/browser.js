/**
* This script starts a single browser instance and exports that single browser instance which is used for
* every page that wants to be scraped rather than starting a new browser for every page. This is more memory 
* and reduces load time
*/

const randomUA = require('modern-random-ua');	


function startBrowser(){ 
	const puppeteer = require("puppeteer");
	let browser;
	try {
	    console.log("Opening the browser......");
	    browser = puppeteer.launch({
	        // headless: false,
	        args: ["--no-sandbox", "--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true,
	         userAgent: "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion"
	    });
	} catch (err) {
	    console.log("Browser creation error : ", err);
	}
	return browser;
} 

module.exports = startBrowser;
