const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');

/**
 * the scraper object is used to scrape data from the betway bet site for three major leagues
 * - Premier League
 * - La liga
 * - seria A
 * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
 * @property Event {Number} - The event number for the premier league
 * @property ligaEvent {Number} - The event number for the laliga
 * @property seriaEvent {Number} - The event number for the seriaA league
 * @param bet1960Fetcher {method} - It fetches information for any  league on the betway bet page
 * @param fetchPL {method} - It fetches information only premier league  and depends on the betwayBetFetcher to work
 * @param fetchLiga {method} - It fetches information only laliga  and depends on the betwayBetFetcher to work
 * @param fetchSeria {method} - It fetches information seriaA  and depends on the betwayBetFetcher to work
 */

 const scraper = {
 	premierLeagueURL: "https://www.betway.com.ng/sport/soccer/eng/premier_league/",
 	laLigaURL: "https://www.betway.com.ng/sport/soccer/esp/la_liga/",
 	seriaAURL: "https://www.betway.com.ng/sport/soccer/ita/serie_a/",
    euURL: "https://www.betway.com.ng/sport/soccer/int/european_ch.ship_qf/",
    mlsURL: "https://www.betway.com.ng/sport/soccer/usa/major_league_soccer/",
 	betwayFetcher: async (browser) => {
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
                    console.log("navigating to betway site");
                    await page.goto(url, {
                        waitUntil: "domcontentloaded"
                    });
                } catch (err) {
                    console.log(`${url} => ${err}`);
                }
                try {
                    await page.waitForSelector("div.row.eventRow");
                    await page.waitFor(1000);
                } catch (err) {
                    console.log(err);
                }

                try{
                    let urls = await page.evaluate(async (leagueID) => {
                    	/*
                        * All the page odds do not appear on the same page.
                        * We have xto manually click the more button to view odd like first half results
                        * This might be a bit stressful so to curb this problem, A link to a page displaying 
                        * all the odds is gotten in an array, The array is looped over and each of this links are 
                        * opened sequencially in a new page. After which the necessary odds are scraped from the page.
                        * The scraped odds are further pushed into an array of odds which solves the problem.
                        */
                        let eventLinks = [];
                        console.log("the league id is ", leagueID);
                        //Get an array of a list of all the odds
                        let getLinkPromise = new Promise(async (resolve, reject) => {
                            let linksBody = await document.querySelectorAll('.row.eventRow #more-button .eventAction .mb-wrapper .btn.btn-bettingmatch-more');
                            linksBody = await Array.prototype.slice.call(linksBody);
                            linksBody = await linksBody.filter((linkBody, index) => {
                                let link = linkBody.href;
                                if(link.search(leagueID) !== -1){
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
                        console.log("event links is ", eventLinks);
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
                                try{
                                    oddData = await newPage.evaluate(async () => {
                                        let oddPromise = new Promise(async  (resolve, reject) => {
                                            let oddObj = {};
                                            let event = document.querySelector('.event-heading span').textContent;
                                            event = event.split('v').join('-');
                                            event = event;
                                            let dateTime = document.querySelector('.date-heading.theFont').innerHTML;
                                            dateTime = dateTime.replace(/\s/g, '');
                                            console.log("the date data is ", dateTime);
                                            let dt = new Date();
                                            let time = dateTime.substr(-5);
                                            let day = dateTime.substr(0, 2);
                                            let month = dateTime.substr(2, -5);
                                            dateTime = dateTime.split('');
                                            for(let i = 0; i < 5; i++){
                                                dateTime.pop();
                                            }
                                            for(let i = 0; i < 2; i++){
                                                dateTime.shift();
                                            }
                                            dateTime = dateTime.join('');
                                            let allBtn = document.querySelector('.mg-tab.tab-1.button span');
                                            await allBtn.click();
                                            await setTimeout(() => {
                                                let odds = document.querySelectorAll('.outcome-pricedecimal');
                                                odds = Array.prototype.slice.call(odds);
                                                odds = odds.map(odd => odd.textContent);
                                                console.log("The odds are ", odds);
                                                oddObj.date = `${day} ${dateTime} ${dt.getFullYear()}`;
                                                oddObj.time = time;
                                                oddObj.event = event;
                                                let eventRef = oddObj.event;
                                                eventRef = eventRef.split(" - ");
                                                eventRef[0].search(/manchester/gi) !== -1 && eventRef[0].search(/united/gi) !== -1 ? eventRef[0] = eventRef[0].slice(0,3) + 'U' : eventRef[0] = eventRef[0].slice(0,3);
                                                eventRef[1].search(/manchester/gi) !== -1 && eventRef[1].search(/city/gi) !== -1 ? eventRef[1] = eventRef[1].slice(0,3) + 'C' : eventRef[1] = eventRef[1].slice(0,3);
                                                eventRef = eventRef.join(" - ");
                                                oddObj.odds = {};
                                                oddObj.odds['1'] = odds[0];
                                                oddObj.odds['X'] = odds[1];
                                                oddObj.odds['2'] = odds[2];
                                                oddObj.odds['1X'] = odds[3];
                                                oddObj.odds['12'] = odds[4];
                                                oddObj.odds['2X'] = odds[5];
                                                oddObj.odds['O2.5'] = odds[15];
                                                oddObj.odds['U2.5'] = odds[16];
                                                oddObj.odds['GG'] = odds[63];
                                                oddObj.odds['NG'] = odds[64];
                                                oddObj.odds['1HT'] = odds[554];
                                                oddObj.odds['2HT'] = odds[556];
                                                oddObj.odds['XHT'] = odds[555];
                                                console.log("The complete oddOBJ is ", oddObj);
                                                resolve(oddObj);
                                            }, 5000);//10000
                                            console.log("The data is ", oddObj);
                                            // return oddObj;
                                        });
                                        let oddD;
                                        await oddPromise.then(res => oddD = res );
                                        return oddD;
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
                }
                catch(err){
                    console.log(err);
                }
                page.close();
 			});
 			return scrapeData;
 		}
 		let market = [];

        function addID(data, league){
            if(data.length > 0){
                data = data.map(obj => {
                    if(obj !== undefined){
                        let event = obj.event;
                        let id = generateID(event, league);
                        obj.eventID = id;
                        return obj;
                    }
                })
                return data;
            }
            else{
                return data;
            }
        }

 		await pageScraper(scraper.premierLeagueURL, "premier_league")
 		.then(res => {
 			let data = addID(res, 'pl');
            market.push(data);
            console.log("Scraped data for premier league")
 		});
 		await pageScraper(scraper.laLigaURL, "la_liga")
 		.then(res => {
 			let data = addID(res, 'll');
            market.push(data);
            console.log("Scraped data for la liga")
 		});
 		await pageScraper(scraper.seriaAURL, "serie_a")
 		.then(res => {
 			let data = addID(res, 'sa');
            market.push(data);
            console.log("Scraped data for seria A", "serie_a")
 		});
        // await pageScraper(scraper.euURL, "european_ch")
        // .then(res => {
        //     let data = addID(res, 'eu');
        //     market.push(data);
        //     // console.log("res is ", res);
        //     console.log("Scraped data for european championship", "european_ch");
        // });
        // await pageScraper(scraper.mlsURL, "major_league_soccer")
        // .then(res => {
        //     let data = addID(res, 'mls');
        //     market.push(data);
        //     console.log("Scraped data for major league soccer", "major_league_soccer");
        // });
 		return market;
 	}

 }


 module.exports = scraper;