const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator'); 

/**
 * the scraper object is used to scrape data from the betking site for three major leagues
 * - Premier League
 * - La liga
 * - seria A
 * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
 * @property Event {Number} - The event number for the premier league
 * @property ligaEvent {Number} - The event number for the laliga
 * @property seriaEvent {Number} - The event number for the seriaA league
 * @param bet1960Fetcher {method} - It fetches information for any  league on the bet king page
 * @param fetchPL {method} - It fetches information only premier league  and depends on the betKingFetcher to work
 * @param fetchLiga {method} - It fetches information only laliga  and depends on the betKingFetcher to work
 * @param fetchSeria {method} - It fetches information seriaA  and depends on the betKingFetcher to work
 */

//URL's for all endpoints to be scraped from
const scraper = { 
    premierLeagueUrl: "https://www.betking.com/sports/s/event/p/soccer/england/eng-premier-league/0/0",
    laLigaUrl: "https://www.betking.com/sports/s/event/p/soccer/spain/spa-laliga/0/0",
    seriaAUrl: "https://www.betking.com/sports/s/event/p/soccer/italy/ita-serie-a/0/0",
    betKingFetcher: async (browser) => {
        let page, oddData, renderData, oddGNData, finalData;
        async function pageScraper(url){
            page = await browser.newPage();
            try {
                console.log("navigating to betKing site bet site");
                await page.goto(url, {
                    waitUntil: "domcontentloaded"
                });
            } catch (err) {
                console.log(`${url} => ${err}`);
            }

            try {
                await page.waitFor(".oddsContainer");
            } catch (err) {
                console.log(err);
            }
            try{
                renderData = await page.evaluate(async () => {
                    let bodySections = document.querySelectorAll('.oddsTable tbody');
                    bodySections = Array.from(bodySections);
                    let setionCount = bodySections.length;
                    let sectionsData = [];
                    let sectionDates = document.querySelectorAll('.dateRow');
                    sectionDates = Array.from(sectionDates);
                    sectionDates = sectionDates.map(sd => {
                        sd= sd.textContent;
                        sd = sd.split(', ')[1];
                        let dt = new Date();
                        let year = dt.getFullYear();
                        sd = `${sd} ${year}`
                        return sd
                    });
                    function stripString(str){
                        let data = str.replace(/(\r\n|\n|\r)/gm, "").replace("\\r|\\n", "").replace(/ /g, '').replace(/\t/, '');
                        return data;
                    }
                    console.log("The section dates are ", sectionDates);
                    await bodySections.forEach((section, sectionIndex) => {
                        let sectionData = [];
                        let sectionMatches = section.querySelectorAll('.trOddsSection');
                        sectionMatches = Array.from(sectionMatches);
                        sectionMatches.forEach(matchData => {
                            let dataObj = {};
                            let time = matchData.querySelector('.eventDate').textContent;
                            let event = matchData.querySelector('.matchName span').textContent;
                            event = event.split('-').join(' - ');
                            let eventRef = event;
                            eventRef = eventRef.split(' - ');
                            /*
                            * Manchester united and manchester city would have the same eventRef if sliced. So the algorithm below 
                            * is basically checking to differentiate between the both with the latter having an eventRef of manU
                            *  and the for manC
                            */
                            
                            eventRef[0].search(/manchester/gi) !== -1 && eventRef[0].search(/united/gi) !== -1 ? eventRef[0] = eventRef[0].slice(0,3) + 'U' : eventRef[0] = eventRef[0].slice(0,3);
                            eventRef[1].search(/manchester/gi) !== -1 && eventRef[1].search(/city/gi) !== -1 ? eventRef[1] = eventRef[1].slice(0,4) + 'C' : eventRef[1] = eventRef[1].slice(0,4);
                            eventRef =  eventRef.join(' - ');
                            dataObj.date = sectionDates[sectionIndex];
                            dataObj.time = time;
                            dataObj.event = event;
                            dataObj.eventRef = eventRef;
                            dataObj.odds = {};
                            dataObj.odds['1'] = stripString(matchData.querySelectorAll('.oddItem')[0].textContent);
                            dataObj.odds['X'] = stripString(matchData.querySelectorAll('.oddItem')[1].textContent);
                            dataObj.odds['2'] = stripString(matchData.querySelectorAll('.oddItem')[2].textContent);
                            dataObj.odds['1X'] = stripString(matchData.querySelectorAll('.oddItem')[3].textContent);
                            dataObj.odds['12'] = stripString(matchData.querySelectorAll('.oddItem')[4].textContent);
                            dataObj.odds['X2'] = stripString(matchData.querySelectorAll('.oddItem')[5].textContent);
                            dataObj.odds['O2.5'] = stripString(matchData.querySelectorAll('.oddItem')[6].textContent);
                            dataObj.odds['U2.5'] = stripString(matchData.querySelectorAll('.oddItem')[6].textContent);
                            sectionsData.push(dataObj);
                        });
                    });
                    return sectionsData;
                });
            }catch(err){
                console.log(err);
            }
            try{
                //Click the GG/NG button to load GG/NG data
                let ggng = await page.$x("//div[div/text() = 'GG/NG']");
                await ggng[0].click();
                oddGNData = await page.evaluate(async (renderData) => {
                    function stripString(str){
                        let data = str.replace(/(\r\n|\n|\r)/gm, "").replace("\\r|\\n", "").replace(/ /g, '').replace(/\t/, '');
                        return data;
                    }
                    let waiter = new Promise((resolve, reject) => {
                        setTimeout(() => {
                            let matchSection = document.querySelectorAll('.trOddsSection');
                            matchSection = Array.from(matchSection);
                            matchSection.forEach(async (match, index) => {
                                renderData[index].odds['GG'] = stripString(match.querySelectorAll('.oddItem')[0].textContent);
                                renderData[index].odds['GN'] = stripString(match.querySelectorAll('.oddItem')[1].textContent);
                            });
                            resolve(true);
                        }, 5000);
                    });
                    await waiter;
                    return renderData;
                }, renderData);
            }catch(err){
                console.log(err);
            }
            try{
                let ht = await page.$x("//div[div/text() = '1st Half']");
                await ht[0].click();
                page.waitFor(3000);
                let ht1x2 = await page.$x("//div[div/text() = '1X2 HT']");
                await ht1x2[0].click();
                finalData = await page.evaluate(async (oddGNData) => {
                    function stripString(str){
                        let data = str.replace(/(\r\n|\n|\r)/gm, "").replace("\\r|\\n", "").replace(/ /g, '').replace(/\t/, '');
                        return data;
                    }
                    let waiter = new Promise((resolve, reject) => {
                        setTimeout(() => {
                            let matchSection = document.querySelectorAll('.trOddsSection');
                            matchSection = Array.from(matchSection);
                            matchSection.forEach(async (match, index) => {
                                oddGNData[index].odds['1HT'] = stripString(match.querySelectorAll('.oddItem')[0].textContent); 
                                oddGNData[index].odds['XHT'] = stripString(match.querySelectorAll('.oddItem')[1].textContent);
                                oddGNData[index].odds['2HT'] = stripString(match.querySelectorAll('.oddItem')[2].textContent);
                            });
                            resolve(true);
                        }, 5000);
                    });
                    await waiter;
                    return oddGNData;
                }, oddGNData);
            }catch(err){
                console.log(err);
            }
            // await page.close() // close the opened page
            return finalData;
        }
        let allData = [];
        // Generate a unique ID for every event
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

        // for premier league data
        await pageScraper(scraper.premierLeagueUrl)
        .then(data => {
            data = addID(data, 'pl');
            allData.push(data);
            console.log("The premier league data is ", data);
        })

        // for la liga data
        await pageScraper(scraper.laLigaUrl)
        .then(data => {
            data = addID(data, 'll');
            allData.push(data);
            console.log("The laliga data is ", data);
        })

        // for seria A data
        await pageScraper(scraper.seriaAUrl)
        .then(data => {
            data = addID(data, 'sa');
            allData.push(data);
            console.log("The seriaA data is ", data);
        })
        return allData;
    }
}

module.exports = scraper;