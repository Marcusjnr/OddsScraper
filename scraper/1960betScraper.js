 const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');

const updateDB = require('../config/db_update');

/**
 * the scraper object is used to scrape data from the i960 site for three major leagues
 * - Premier League
 * - La liga
 * - seria A
 * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
 * @property Event {Number} - The event number for the premier league  
 * @property ligaEvent {Number} - The event number for the laliga
 * @property seriaEvent {Number} - The event number for the seriaA league
 * @param bet1960Fetcher {method} - It fetches information for any  league on the 1960bet page
 * @param fetchPL {method} - It fetches information only premier league  and depends on the bet1960Fetcher to work
 * @param fetchLiga {method} - It fetches information only laliga  and depends on the bet1960Fetcher to work
 * @param fetchSeria {method} - It fetches information seriaA  and depends on the bet1960Fetcher to work
 */
//URL's for all endpoints to be scraped from
const scraper = {
    bet1960URL: "https://www.1960bet.com/XSport/pages/prematch.jsp?system_code=1960BET",
    bet1960Fetcher2: async (browser) => {
    	let page, oddListData;
        page = await browser.newPage();
        try {
            console.log("navigating to 1960 bet site");
            await page.goto(scraper.bet1960URL, {
                waitUntil: "domcontentloaded"
            });
        } catch (err) {
            console.log(`${scraper.bet1960URL} => ${err}`);
        }

        try {
            await page.waitFor("div#center-content");
        } catch (err) {
            console.log(err);
        }
        try{
        	oddListData = await page.evaluate(async () => {
        		let oddListPromise = new Promise(async (resolve, reject) => {
	        		//Let the leagues data load first
	        		let loadLeaguesData = new Promise((resolve, reject) => {
	                    setTimeout(async () => { 
	                        await disegnaBoxCentrale(1, 33); //load seria A data
	                    }, 500);
	                    setTimeout(async () => {
	                        await disegnaBoxCentrale(1, 36); //load la liga data
	                    }, 2000);
	                    setTimeout(async () => {
	                        await disegnaBoxCentrale(1, 1); //load premier league data
	                    }, 3000);
	                    setTimeout(async () => {
	                        // Just wait
	                        resolve(true);
	                    }, 8000);
	                })
	                await loadLeaguesData;
	                let leaguesDatas = [];
	                let body = document.querySelectorAll('.buttons-container-box.prematch-box');
	                body = Array.from(body);
	                // console.log("the body is ", body);
	                await body.forEach(async leagueBody => {
	                	let leagueData = [];
	                	let leagueName = leagueBody.querySelector('.buttons-container-header .center-top-quote-title .title-alternate').textContent;
	                	console.log("The league name is ", leagueName);
	                	let leagueSectionDates = leagueBody.querySelectorAll('.date-time-row > .fluid-prematch-matches-name-td > .fluid-heading-span');
	                	leagueSectionDates = Array.from(leagueSectionDates);
	                	leagueSectionDates = leagueSectionDates.map(sect => {
	                		sect = sect.textContent.split(' ');
	                		sect.shift();
	                		sect = sect.join(' ');
	                		return sect;
	                	});
	                	// console.log("The dates are ", leagueSectionDates);
	                	//Get the number of times each of this dates occurs
	                	let tr = leagueBody.querySelectorAll('tr');
	                	tr = Array.from(tr);
	                	// tr = tr.map(t => console.log(t.classList.contains('date-time-row')));
	                	tr = tr.filter(t => t.classList.contains('date-time-row') !== false || t.classList.contains('simple-row') !== false);
	                	tr = tr.map(t => t.classList[0]);
	                	tr.shift();
	                	let datesIndex = [];
	                	let counter = 0;
	                	let simpleRowsNum = 0;
	                	tr.forEach(d => {
	                		if(d === 'simple-row'){
	                			counter++;
	                			simpleRowsNum++;
	                		}
	                		else{
	                			datesIndex.push(counter);
	                			counter = 0;
	                		}
	                	})
	                	let datesArray = [];
	                	let datesIndexSum = datesIndex.reduce((a, b) => a + b);
	                	let datesIndexDiff = simpleRowsNum - datesIndexSum;
	                	datesIndex.push(datesIndexDiff); 
	                	datesIndex.forEach((date, index) => {
	                		for(let i = 0; i < date; i++){
	                			datesArray.push(leagueSectionDates[index]);
	                		}
	                	})
	                	console.log("The dates Array is ", datesArray);
	                	// console.log("The tr's are ", tr);
	                	// console.log("and datesIndex are ", datesIndex);
	                	// console.log("dates are ", leagueSectionDates);
	                	// console.log("Num simple rows ", simpleRowsNum);
	                	let oddBody = leagueBody.querySelectorAll('.simple-row');
	                	oddBody = Array.from(oddBody);
	                	function stripString(str){
	                        let data = str.replace(/(\r\n|\n|\r)/gm, "").replace("\\r|\\n", "").replace(/ /g, '').replace(/\t/, '');
	                        return data;
	                    }
	                	oddBody.forEach((oddB, oddBodyIndex) => {
	                		let oddObj = {};
	                		oddObj.date = datesArray[oddBodyIndex];
	                		oddObj.time = oddB.querySelector('.fluid-prematch-time-span').textContent;
	                		oddObj.event = oddB.querySelector('.fluid-prematch-event-span').textContent;
	                		oddObj.odds = {};
	                		oddObj.odds['1'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-3')[0].textContent);
	                		oddObj.odds['X'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-3')[1].textContent);
	                		oddObj.odds['2'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-3')[2].textContent);
	                		oddObj.odds['1X'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-3')[3].textContent);
	                		oddObj.odds['12'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-3')[4].textContent);
	                		oddObj.odds['X2'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-3')[5].textContent);
	                		oddObj.odds['U2.5'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-2')[0].textContent);
	                		oddObj.odds['O2.5'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-2')[1].textContent);
	                		oddObj.odds['GG'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-2')[2].textContent);
	                		oddObj.odds['NG'] = stripString(oddB.querySelectorAll('.fluid-quotes-td-2')[3].textContent);
	                		// console.log("length ", oddB.querySelectorAll('.fluid-quotes-td-3').length);
	                		leagueData.push(oddObj);
	                	});
	                	//Click the halftime button
	                	let halfTime = leagueBody.querySelectorAll('#prematch-market-selected-container div:nth-child(1) a')[1];
	                	let mainHalfTime = leagueBody.querySelectorAll('#prematch-market-selected-container div:nth-child(2) a')[15];
	                	halfTime.click();
	                	if(leagueName.search(/serie/gi) !== -1){
	                		console.log("yaaaaayyyyy")
	                		let serieAMainHT = leagueBody.querySelectorAll('#prematch-market-selected-container div:nth-child(2) a')[17];
	                		serieAMainHT.click();
	                	}
	                	else{
	                		mainHalfTime.click();
	                	}
	                	console.log("Halftime body is ", mainHalfTime);
	                	console.log("The leagueData is ", leagueData);
	                	let waiter = new Promise((resolve, reject) => {
	                		setTimeout(() => {
			                	oddBody = leagueBody.querySelectorAll('.simple-row');
			                	oddBody = Array.from(oddBody);
			                	console.log("The new odd body is ", oddBody);
			                	oddBody.forEach((odd, oddIndex) => {
			                		leagueData[oddIndex].odds['1HT'] = stripString(odd.querySelectorAll(".prematch-fluid-giocabilita-s.prematch-fluid-btn-g")[0].textContent);
			                		leagueData[oddIndex].odds['XHT'] = stripString(odd.querySelectorAll(".prematch-fluid-giocabilita-s.prematch-fluid-btn-g")[1].textContent);
			                		leagueData[oddIndex].odds['2HT'] = stripString(odd.querySelectorAll(".prematch-fluid-giocabilita-s.prematch-fluid-btn-g")[2].textContent);
			                	})
			                	resolve(true);
	                		}, 6000);
	                	})
	                	await waiter
	                	.then(res => {
		                	console.log("leagueData is ", leagueData);
		                	leaguesDatas.push(leagueData);
	                	});
	                	// leaguesDatas.push(leagueData);
		            });
				setTimeout(() => resolve(leaguesDatas), 10000);
        		});
				let data;
				await oddListPromise.then(res => {
					data = res;
					console.log("The result is ", res);
				})
				console.log("The data to be returned is ", data);
			return data;
        	});
		 // console.log("The oddlist data is ", oddListData);
        }catch(err){
        	console.log(err);
        }
        function addID(data, league){
            if(data.length > 0){
                data = data.map(obj => {
                    let event = obj.event;
                    let id = generateID(event, league);
                    obj.eventID = id;
                    return obj;
                })
                return data;
            }
            else{
                return data;
            }
        }
        oddListData[0] = addID(oddListData[0], 'pl');
        oddListData[1] = /*addID(oddListData[1], 'll');*/ [];
        oddListData[2] = addID(oddListData[2], 'sa');
        page.close();
		return oddListData;
    }
}

module.exports = scraper;