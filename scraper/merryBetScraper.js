const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');

const scraper = {
    /**
     * the scraper object is used to scrape data from the merry bet site for three major leagues
     * - Premier League 
     * - La liga 
     * - seria A
     * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
     * @property premierEvent {Number} - The event number for the premier league
     * @property ligaEvent {Number} - The event number for the laliga
     * @property seriaEvent {Number} - The event number for the seriaA league
     * @param bet9jaFetcher {method} - It fetches information for any  league on the merry bet page
     * @param fetchPL {method} - It fetches information only premier league  and depends on the merryBetFetcher to work
     * @param fetchLiga {method} - It fetches information only laliga  and depends on the merryBetFetcher to work
     * @param fetchSeria {method} - It fetches information seriaA  and depends on the merryBetFetcher to work
     */

    //URL's for all endpoints to be scraped from
    premierLeagueURL: "https://merrybet.com/sports/match?matchIds=1060",
    laLigaURL: "https://merrybet.com/sports/match?matchIds=1587",
    seriaAURL: "https://merrybet.com/sports/match?matchIds=3340",
    euURL: "https://www.merrybet.com/sports/match?matchIds=47374",
    mlsURL: "https://www.merrybet.com/sports/match?matchIds=228",
    merryBetFetcher: async (browser) => {
        let page, oddListData;
        // let browser = await puppeteer.launch({
        //     headless: false,
        //     args: ["--no-sandbox", "--disable-setuid-sandbox"]
        // });
        function pageScraper(url){
            const pagePromise = new Promise(async (resolve, reject) => {

                page = await browser.newPage();
                try {
                    console.log("navigating to merry bet site");
                    await page.goto(url, {
                        waitUntil: "domcontentloaded"
                    });
                } catch (err) {
                    console.log(`${url} => ${err}`);
                }

                try {
                    await page.waitFor(5000);
                    await page.waitFor(".panel-group");
                } catch (err) {
                    console.log(err);
                }
                try {
                    oddListData = await page.evaluate(async () => {
                        let leagueContainer = document.querySelector('.panel-heading + .panel-collapse.collapse.in');
                        //All the league containers on the page
                        if(leagueContainer !== null){    
                            let oddBody = leagueContainer.querySelectorAll('.single-event');
                            oddBody = Array.prototype.slice.call(oddBody);
                            let datas = [];
                            let events = [];
                            let dates = [];
                            let times = [];
                            let odds = [];
                            oddBody.map(oddInfo => {
                                // let oddObj = {};
                                let event = oddInfo.querySelector('.name').innerHTML;
                                event = event;
                                let date = oddInfo.querySelector('.date').innerHTML.replace('.', '/');
                                date = date.split('/');
                                let day = date[0];
                                let month = Number(date[1]) - 1;
                                let dt = new Date()
                                let currentMonth = dt.getMonth() 
                                let year = dt.getFullYear();
                                Number(month) < currentMonth ? year++ : year;
                                let dtt = new Date(year, month, Number(day)).toDateString();
                                date = dtt.split(' ');
                                date =  `${date[2]} ${date[1]} ${date[3]}`;
                                let time = oddInfo.querySelector('.time').innerHTML;
                                let odd = [];
                                let odd1X2 = oddInfo.querySelectorAll('.btn.btn-odd span');
                                odd1X2 = Array.prototype.slice.call(odd1X2);
                                odd1X2.map(x => odd.push(x.innerHTML));

                                dates.push(date);
                                times.push(time);
                                events.push(event);
                                odds.push(odd);
                            });
                            //click the double chance button
                            let dbChanceBtn = leagueContainer.querySelector('.games-tabs span:nth-child(3) span');
                            dbChanceBtn.click();
                            //Render all the data for double chance
                            let loadDCData = new Promise((resolve, reject) => {
                                let oddBody = leagueContainer.querySelectorAll('.single-event');
                                oddBody = Array.prototype.slice.call(oddBody);
                                oddBody.map((dbOddBody, index) => { 
                                    let oddDC = dbOddBody.querySelectorAll('.btn.btn-odd span');
                                    oddDC = Array.prototype.slice.call(oddDC);
                                    /**
                                    * Something unusual happens here, for some reason i do not understand, the odds in 
                                    * oddDC are duplicated three times and each index of the array contains three different
                                    * value at a time which is why i didn't bother to loop through the array and just used the
                                    * first index
                                    */
                                    odds[index].push(oddDC[0].innerHTML);
                                    odds[index].pop();
                                    // click the button for GG/NG
                                    let GNBtn = leagueContainer.querySelector('.games-tabs span:nth-child(8) span');
                                    GNBtn.click();
                                    resolve(true);
                                });
                            });

                            //Render all the data for both team score
                            let loadGN = new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    let oddBody = leagueContainer.querySelectorAll('.single-event');
                                    oddBody = Array.prototype.slice.call(oddBody);
                                    oddBody.map((gnOddBody, index) => {
                                        let oddGN = gnOddBody.querySelectorAll('.btn.btn-odd span');
                                        oddGN = Array.prototype.slice.call(oddGN);
                                        for (let i = 0; i < oddGN.length; i++) {
                                            odds[index].push(oddGN[i].innerHTML);
                                        }
                                        //Click the haftime display button
                                        let HT = leagueContainer.querySelector('.markets-tabs span:nth-child(2) span');
                                        HT.click();
                                        resolve(true);
                                    });
                                }, 1000);
                            });

                            //Render all haf time odds
                            let loadHT = new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    let oddBody = leagueContainer.querySelectorAll('.single-event');
                                    oddBody = Array.prototype.slice.call(oddBody).slice(0, 10);
                                    console.log("The ossBody is ", oddBody);
                                    oddBody.map((htOddBody, index) => {
                                        let oddHT = htOddBody.querySelectorAll('.compact-panel.outcomes-panel')['0'].textContent;
                                        oddHT = oddHT.split(" ").slice(1, );
                                        // console.log("the string is ", oddHT);
                                        for (let i = 0; i < oddHT.length; i++) {
                                            odds[index].push(oddHT[i]);
                                        }
                                        //Click the haftime display button
                                        let OU = leagueContainer.querySelector('.markets-tabs span:nth-child(4) span');
                                        OU.click();
                                        resolve(true);
                                    });
                                    console.log("the odds are ", odds); 
                                }, 10000);
                            });

                            //render all Over and Under 2.5 data 
                            let loadOU = new Promise((resolve, reject) => {
                                setTimeout(async () => {
                                    let oddBody = leagueContainer.querySelectorAll('.single-event');
                                    oddBody = Array.prototype.slice.call(oddBody);
                                    await oddBody.map(async (ouOddBody, index) => {
                                        console.log("ouOddBody is ", ouOddBody);
                                        ouOddBody = ouOddBody.querySelectorAll('.compact-panel.outcomes-panel div.compact-panel div');
                                        ouOddBody = Array.prototype.slice.call(ouOddBody);
                                        await ouOddBody.map((ouOdd, ouIndex) => {
                                            if(ouOdd.querySelector('.btn.btn-odd.arguments').textContent == 2.5){
                                                ouOdd = ouOdd.querySelectorAll('.btn.btn-odd');
                                                ouOdd = Array.prototype.slice.call(ouOdd);
                                                ouOdd.forEach(od => {
                                                    if(od.textContent !== 2.5){
                                                        odds[index].push(od.textContent);
                                                    }
                                                    console.log("Pushed OU odd ", od.textContent);
                                                })
                                            }
                                        });
                                        resolve(true);
                                    });
                                }, 15000);
                            });

                            await loadDCData.then(async dc => {
                                console.log("Finished fetching DC data ", dc);
                                await loadGN.then(async gn => {
                                    console.log("Finished fetching GN data ", gn);
                                    await loadHT.then(async ht => {
                                        console.log("Finished fetching HT data ", ht);
                                        await loadOU.then(async ou => {
                                            console.log("Finished fetching OU data ", ou);
                                            console.log(dates);
                                            console.log(times);
                                            console.log(events);
                                            console.log(odds);
                                            //Trim the matches to gte the events ref
                                            let eventsRef = events.map(event => {
                                                event = event.split('-');
                                                /**
                                                * Manchester united and manchester city would have the same eventRef if sliced. So teh algorithm below 
                                                * is basically checking to differentiate between the both with the latter having an eventRef of manU
                                                *  and the for manC
                                                */
                                                event[0].search(/manchester/gi) !== -1 && event[0].search(/united/gi) !== -1 ? event[0] = event[0].slice(0,3) + 'U' : event[0] = event[0].slice(0,3);
                                                event[1].search(/manchester/gi) !== -1 && event[1].search(/city/gi) !== -1 ? event[1] = event[1].slice(0,4) + 'C' : event[1] = event[1].slice(0,4);
                                                return event.join(' - ');
                                            });
                                            //Format the date into a readable format
                                            // dates = dates.map(date => {
                                            //     date = date.split('/');
                                            //     let day = date[0];
                                            //     let month = Number(date[1]) + 1;
                                            //     let dt = new Date()
                                            //     let currentMonth = dt.getMonth() 
                                            //     let year = dt.getFullYear();
                                            //     Number(month) < currentMonth ? year++ : year;
                                            //     let dtt = new Date(year, month, Number(day));
                                            //     return dtt.toDateString();
                                            // });
                                            for(let i = 0; i < times.length; i++){
                                                let dataObj = {};
                                                dataObj.date = dates[i];
                                                dataObj.time = times[i];
                                                dataObj.event = events[i];
                                                dataObj.eventRef = eventsRef[i];
                                                dataObj.odds = {};
                                                dataObj.odds['1'] = odds[i][0];
                                                dataObj.odds['X'] = odds[i][1];
                                                dataObj.odds['2'] = odds[i][2];
                                                dataObj.odds['1X'] = odds[i][3];
                                                dataObj.odds['12'] = odds[i][4];
                                                dataObj.odds['2X'] = odds[i][5];
                                                dataObj.odds['GG'] = odds[i][6];
                                                dataObj.odds['NG'] = odds[i][7]; 
                                                dataObj.odds['1HT'] = odds[i][8]; 
                                                dataObj.odds['XHT'] = odds[i][9]; 
                                                dataObj.odds['2HT'] = odds[i][10]; 
                                                dataObj.odds['O2.5'] = odds[i][11];
                                                dataObj.odds['U2.5'] = odds[i][13];
                                                datas.push(dataObj);
                                            }
                                            console.log("the datas are ", datas);
                                        });
                                    })
                                })
                            });
                            return datas;
                        }
                        else{
                            return [];//No data was found for this league
                        }
                    })
                    // return oddListData;
                    resolve(oddListData);
                } catch (err) {
                    console.log(err);
                }
                await page.close();
            });
            return pagePromise
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
        let the_data = [];
        await pageScraper(scraper.premierLeagueURL).then(res => {
            let data = addID(res, 'pl');
            the_data.push(data);
        }).catch(err => console.log("Errrrrrr ", err))
        await pageScraper(scraper.laLigaURL).then(res => {
            let data = addID(res, 'll');
            the_data.push(data);
        });
        await pageScraper(scraper.seriaAURL).then(res => {
            let data = addID(res, 'sa');
            the_data.push(data);
        });
        // await pageScraper(scraper.euURL).then(res => {
        //     let data = addID(res, 'eu');
        //     the_data.push(data);
        // });
        // await pageScraper(scraper.mlsURL).then(res => {
        //     let data = addID(res, 'mls');
        //     the_data.push(data);
        // });
        page.close() //close the page before opening the next one
        return the_data;
    },
    fetchAll: (browser) => {
        return scraper.merryBetFetcher(browser);
    }
}

module.exports = scraper;