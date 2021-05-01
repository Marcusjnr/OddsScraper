const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');

/**
 * the scraper object is used to scrape data from the sure bet site for three major leagues
 * - Premier League
 * - La liga
 * - seria A
 * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
 * @property Event {Number} - The event number for the premier league
 * @property ligaEvent {Number} - The event number for the laliga
 * @property seriaEvent {Number} - The event number for the seriaA league
 * @param bet1960Fetcher {method} - It fetches information for any  league on the sure bet page
 * @param fetchPL {method} - It fetches information only premier league  and depends on the sureBetFetcher to work
 * @param fetchLiga {method} - It fetches information only laliga  and depends on the sureBetFetcher to work
 * @param fetchSeria {method} - It fetches information seriaA  and depends on the sureBetFetcher to work
 */

 const scraper = { 
 	premierLeagueURL: "https://www.surebet247.com/sports/football/england-premier-league/",
 	laLigaURL: "https://www.surebet247.com/sports/football/spain-la-liga/",
 	seriaAURL: "https://www.surebet247.com/sports/football/italy-serie-a/",
    euURL: "https://www.surebet247.com/sports/football/euro-2020-qualifying/",
    mlsURL: "https://www.surebet247.com/sports/football/usa-mls/",
 	sureBetFetcher: async (browser) => {
 		let page, oddListData;
 		function pageScraper(url, leagueID){
 			let scrapeData = new Promise(async (resolve, reject) => {
				try{
	                page = await browser.newPage();
	                await page.setViewport({ width: 1366, height: 768});

	            }
	            catch(err){
	                console.log(err);
	            }
	            try {
	                console.log("navigating to sure bet site");
	                await page.goto(url, {
	                    waitUntil: "domcontentloaded"
	                });
	            } catch (err) {
	                console.log(`${url} => ${err}`);
	            }
	            try {
	                await page.waitForSelector("div.event-heading-content-wrapper");
	                await page.waitFor(1000);
	            } catch (err) {
	                console.log(err);
	            }

	            try{
	            	let urls = await page.evaluate(async (leagueID) => {
		            	/*
		                * All the page odds do not appear on the same page.
		                * We have to manually click the more button to view odd like first half results
		                * This might be a bit stressful so to curb this problem, A link to a page displaying 
		                * all the odds is gotten in an array, The array is looped over and each of this links are 
		                * opened sequencially in a new page. After which the necessary odds are scraped from the page.
		                * The scraped odds are further pushed into an array of odds which solves the problem.
		                */
		                let eventLinks = [];
		                //Get an array of a list of all the odds
	                    let getLinkPromise = new Promise(async (resolve, reject) => {
	                        let linksBody = await document.querySelectorAll('.event-all-bets-inner');
	                        linksBody = await Array.prototype.slice.call(linksBody);
	                        linksBody = await linksBody.filter((linkBody, index) => {
	                            let link = linkBody.href;
	                            if(link.search(leagueID) !== -1){
	                                return link;
	                            }
                                else{
    	                            return link;
                                }
	                        })
	                        .map((link) => {
	                            eventLinks.push(link.href);
	                            return link.href;
	                        })
	                        resolve(linksBody);
	                    });
	                    await getLinkPromise
	                    // console.log("event links is ", eventLinks);
	                    return eventLinks;
	                }, leagueID);

	                let navigateURLPromise = new Promise(async (resolve, reject) => {
                        //loope through all URLS and navigate to their respecive pages
                        async function runUrls(links){
                            let arr = [];
                            console.log("the links are ", links)
                            for(url of links){
                                let newPage, oddData;
                                try{
                                    newPage = await browser.newPage();
                                    await newPage.setViewport({ width: 1366, height: 768});
                                }
                                catch(err){
                                    console.log(`Could not open a new page`);
                                }
                                try{
                                    await newPage.goto(url, {
                                        waitUntil: "domcontentloaded"
                                    })
                                }
                                catch(err){
                                    console.log(`Could not navigate to the new page => ${err}`);
                                }
                                try {
						                await newPage.waitForSelector("button.MLOdds");
						                await newPage.waitFor(1000);
						            } catch (err) {
						                console.log(err);
						            }
                                try{
                                    oddData = await newPage.evaluate(async () => {
                                        let oddObj = {};
                                        let event = document.querySelector('div.breadcrumb.breadcrumb-last span.breadcrumb-text').textContent;
                                        console.log("The event content is ", event)
                                        event = event.split('vs');
                                        event = event.join('-');
                                        event = event;
                                        let dateTime = document.querySelector('.prematch-sc-starting').textContent;
                                        dateTime = dateTime.split(' ');
                                        console.log("the date data is ", dateTime);
                                        let time = dateTime.pop();
                                        let dateData = dateTime.join(' ');
                                        dateData = dateData.split(', ')[1];
                                        let dtt = new Date().getFullYear();
                                        let date = `${dateData} ${dtt}`;
                                        let odds = document.querySelectorAll('.bet-odds-number');
                                        odds = Array.prototype.slice.call(odds);
                                        odds = odds.map(odd => odd.textContent);
                                        console.log("The odds are ", odds);
                                        oddObj.date = date;
                                        oddObj.time = time;
                                        oddObj.event = event;
                                        oddObj.odds = {};
                                        oddObj.odds['1'] = odds[0];
                                        oddObj.odds['X'] = odds[1];
                                        oddObj.odds['2'] = odds[2];
                                        oddObj.odds['1X'] = odds[37];
                                        oddObj.odds['12'] = odds[39];
                                        oddObj.odds['2X'] = odds[38];
                                        oddObj.odds['O2.5'] = odds[7];
                                        oddObj.odds['U2.5'] = odds[8];
                                        oddObj.odds['GG'] = odds[32];
                                        oddObj.odds['NG'] = odds[33];
                                        oddObj.odds['1HT'] = odds[19];
                                        oddObj.odds['2HT'] = odds[21];
                                        oddObj.odds['XHT'] = odds[20];
                                        console.log("The data is ", oddObj);
	                                    return oddObj;
                                    });
                                }
                                catch(err){
                                    console.log(err);
                                }
                                // console.log("the oddData is ", oddData);
                                newPage.close();
                                // return oddData;
                                arr.push(oddData);
                                console.log("OddData is ", oddData);
                            }
                            return arr;
                        }
                        let data = await runUrls(urls);
                        // console.log("the urls are ", daata);
                        // let data = Promise.all(runUrls(urls));
                        await resolve(data);
                    });
                    await navigateURLPromise.then(res => {
                        // console.log("the scraped data is ", res)
                        resolve(res);
                    });
	            }catch(err){
	            	console.log(err);
	            }
	            page.close();
	            // resolve(true);
	        });
	        return scrapeData;
 		}

 		let market = [];

        function addID(data, league){
            if(data.length > 0){
                console.log("The data is ", data);
                data = data.map(obj => {
                    if(obj !== undefined){
                        console.log("the obj is ", obj);
                        let event = obj.event;
                        console.log("type of event is ", typeof(event));
                        let rt = event.split('-');
                        /*
                        * The event for surebet aren't seperated by space around an hyphen( - ), The generateID algprithms
                        * searches for space an hyphen to split the event strings, so the string is formatted to a format usable 
                        * by the generateID function as below 
                        */
                        rt[0] = rt[0].split('');
                        rt[0].pop();
                        rt[0] = rt[0].join('');
                        // 
                        rt[1] = rt[1].split('');
                        rt[1].shift();
                        rt[1] = rt[1].join('');
                        rt = `${rt[0]} - ${rt[1]}`;
                        // rt[1] = rt[1].split('').shift().join('');
                        console.log("event test is ? ", rt);
                        let id = generateID(rt, league);
                        obj.eventID = id;
                        return obj;
                    }
                })
                return data.filter(dat => dat !== undefined);
            }
            else{
                return data;
            }
        }

 		await pageScraper(scraper.premierLeagueURL, "england-premier-league")
		.then(res => {
            let ress = res;
            ress = ress.filter(data => data !== null || undefined);
			let data = addID(ress, 'pl');
            market.push(data);

		})

		await pageScraper(scraper.laLigaURL, "spain-la-liga")
		.then(res => {
			let ress = res;
            ress = ress.filter(data => data !== null);
            let data = addID(ress, 'll');
            market.push(data);
		})

 		await pageScraper(scraper.seriaAURL, "italy-serie-a")
		.then(res => {
			let ress = res;
            ress = ress.filter(data => data !== null);
            let data = addID(ress, 'sa');
            market.push(data);
		})

        // await pageScraper(scraper.euURL, "euro")
        // .then(res => {
        //     let ress = res;
        //     ress = ress.filter(data => data !== null);
        //     let data = addID(ress, 'eu');
        //     market.push(data);
        // })

        // await pageScraper(scraper.mlsURL, "usa-mls")
        // .then(res => {
        //     let ress = res;
        //     ress = ress.filter(data => data !== null);
        //     let data = addID(ress, 'mls');
        //     market.push(data);
        //     // market.push(ress);
        // });

		return market;
	}

 }




 module.exports = scraper;