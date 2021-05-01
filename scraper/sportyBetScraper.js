const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');

/**
 * the scraper object is used to scrape data from the sporty bet site for three major leagues
 * - Premier League
 * - La liga
 * - seria A
 * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
 * @property Event {Number} - The event number for the premier league
 * @property ligaEvent {Number} - The event number for the laliga
 * @property seriaEvent {Number} - The event number for the seriaA league
 * @param bet1960Fetcher {method} - It fetches information for any  league on the sporty bet page
 * @param fetchPL {method} - It fetches information only premier league  and depends on the sportyBetFetcher to work
 * @param fetchLiga {method} - It fetches information only laliga  and depends on the sportyBetFetcher to work
 * @param fetchSeria {method} - It fetches information seriaA  and depends on the sportyBetFetcher to work
 */

const scraper = {
    sportyBetUrl: "https://www.sportybet.com/ng/sport/football/sr:category:31_sr:category:32_sr:category:1/sr:tournament:242_sr:tournament:27_sr:tournament:23_sr:tournament:8_sr:tournament:17",
    sportyBetFetcher: async (browser) => {
        let page, oddListData;
        try {
            // console.log("Opening the browser......");
            // browser = await puppeteer.launch({
            //     // headless: false,
            //     args: ["--no-sandbox", "--disable-setuid-sandbox"]
            // });
            page = await browser.newPage();
        } catch (err) {
            console.log("Browser creation error : ", err);
        }
        try {
            console.log("naviagting to sporty bet site");
            await page.goto(scraper.sportyBetUrl, {
                waitUntil: "domcontentloaded"
            });
        } catch (err) {
            console.log(
                `Could not navigate to the page : ${scraper.sportyBetUrl} => ${err}`
            );
        }

        try {
            await page.waitFor(".match-league-wrap");
        } catch (err) {
            console.log(err);
        }

        try {
            const hey = [];
            oddListData = await page.evaluate(async () => {
                let body = await document.querySelectorAll(".match-league-wrap .match-league"); //Contianer for each league
                body = await Array.prototype.slice.call(body);
                // console.log(body);
                const dates = [];
                let datas = [];

                const dataPromise = new Promise((resolve, reject) => {
                    body = body.map(async (bodyContainers, bodyIndex) => {
                        function click(what) {
                            //This function clicks specific items on each leagues container
                            what.click();
                        }
                        let data = [];
                        // click(bodyContainers.querySelector('.market-group > .market-item:nth-child(3)'));
                        //Get all the dates on the page
                        let datesList = bodyContainers.querySelectorAll('.m-table.match-table .m-table-row.date-row .m-table-cell.date');
                        datesList = Array.prototype.slice.call(datesList);
                        let theDate = [];
                        datesList.map(dt => {
                            let dateData = dt.innerHTML.split(' ')[0];
                            dateData = dateData.split('/');
                            let dtt = new Date().getFullYear();
                            dateData = new Date(dtt, dateData[1], dateData[0]).toDateString();
                            dateData = dateData.split(' ');
                            dateData.shift();
                            dateData = `${dateData[1]} ${dateData[0]} ${dateData[2]}`
                            theDate.push(dateData);
                        });
                        dates.push(theDate);
                        theDate = [];
                        console.log("The dates are ", datesList);
                        //Get the odd information on the page
                        let times = [];
                        let events = [];
                        let odds = []
                        let oddsBody = bodyContainers.querySelectorAll('.m-table-row.m-content-row.match-row');
                        oddsBody = Array.prototype.slice.call(oddsBody);
                        await oddsBody.map(oddBody => {
                            // let dataObj = {};
                            let odd = []
                            let time = oddBody.querySelector('.clock-time').innerHTML;
                            time = time.replace("&nbsp;&nbsp;", "").split(':');
                            time[0] = Number(time[0]) + 1;
                            time = time.join(':');
                            let homeTeam = oddBody.querySelector('.home-team').innerHTML;
                            let awayTeam = oddBody.querySelector('.away-team').innerHTML;
                            let event = `${homeTeam} - ${awayTeam}`;
                            event = event;
                            // dataObj.time = time;
                            // dataObj.event = event;
                            // dataObj.odds = {};
                            times.push(time);
                            events.push(event);
                            let odd1X2 = oddBody.querySelectorAll('.m-market.market:nth-child(1) .m-outcome .m-outcome-odds');
                            // dataObj.odds['1'] = odd1X2[0].innerHTML;
                            // dataObj.odds['X'] = odd1X2[1].innerHTML;
                            // dataObj.odds['2'] = odd1X2[2].innerHTML;
                            // odd.push(odd1X2[0].innerHTML);
                            // odd.push(odd1X2[1].innerHTML);
                            // odd.push(odd1X2[2].innerHTML);
                            odd1X2[0] ? odd.push(odd1X2[0].innerHTML) : odd.push('-');
                            odd1X2[1] ? odd.push(odd1X2[1].innerHTML) : odd.push('-');
                            odd1X2[2] ? odd.push(odd1X2[2].innerHTML) : odd.push('-');
                            let oddOU25 = oddBody.querySelectorAll('.m-market.market:nth-child(2) .m-outcome .m-outcome-odds');
                            // dataObj.odds['O2.5'] = oddOU25[0].innerHTML;
                            // dataObj.odds['U2.5'] = oddOU25[1].innerHTML;

                            oddOU25[0] ? odd.push(oddOU25[0].innerHTML) : odd.push('-');
                            oddOU25[1] ? odd.push(oddOU25[1].innerHTML) : odd.push('-');
                            // odd.push(oddOU25[1].innerHTML);

                            odds.push(odd);
                            // data.push(dataObj);
                        });
                        //Click the double chance button to load the double chance data
                        let dbChanceBtn = await bodyContainers.querySelector('.market-item:nth-child(2)');
                        await click(dbChanceBtn);
                        await setTimeout(() => {
                            oddsBody.map((oddBody, index) => {
                                let dbOdds = oddBody.querySelectorAll('.m-outcome-odds');
                                console.log(dbOdds.length);
                                dbOdds.forEach(od => {

                                    od ? odds[index].push(od.innerHTML) : odds[index].push('-');
                                    // odds[index].push(od.innerHTML);
                                })
                            });
                            //Click the GG/NG button to load the double chance data
                            let GNBtn = bodyContainers.querySelector('.market-item:nth-child(3)');
                            click(GNBtn);
                            setTimeout(() => {
                                oddsBody.map((oddBody, index) => {
                                    let GNOdds = oddBody.querySelectorAll('.m-outcome-odds');
                                    console.log(GNOdds.length);
                                    GNOdds.forEach(gn => {
                                        // odds[index].push(gn.innerHTML);
                                        gn ? odds[index].push(gn.innerHTML) : odds[index].push('-');
                                    })
                                });
                                //Merge all the datas
                                data.push({
                                    'dates': dates[bodyIndex]
                                });
                                console.log("the body index is ", bodyIndex);
                                for (let i = 0; i < times.length; i++) {
                                    let dataObj = {};
                                    dataObj.time = times[i];
                                    dataObj.event = events[i];
                                    let eventRef = events[i];
                                    eventRef = eventRef.split("-");
                                    console.log("The eventRef is ", eventRef);
                                    console.log("The event is ", events[i]);
                                    eventRef[0].search(/manchester/gi) !== -1 && eventRef[0].search(/united/gi) !== -1 ? eventRef[0] = eventRef[0].slice(0,3) + 'U' : eventRef[0] = eventRef[0].slice(0,3);
                                    eventRef[1].search(/manchester/gi) !== -1 && eventRef[1].search(/city/gi) !== -1 ? eventRef[1] = eventRef[1].slice(0,3) + 'C' : eventRef[1] = eventRef[1].slice(0,3);
                                    eventRef = eventRef.join(" - ");
                                    dataObj.eventRef = eventRef;
                                    dataObj.odds = {};
                                    dataObj.odds['1'] = odds[i][0];
                                    dataObj.odds['X'] = odds[i][1];
                                    dataObj.odds['2'] = odds[i][2];
                                    dataObj.odds['O2.5'] = odds[i][3];
                                    dataObj.odds['U2.5'] = odds[i][4];
                                    dataObj.odds['1X'] = odds[i][5];
                                    dataObj.odds['12'] = odds[i][6];
                                    dataObj.odds['2X'] = odds[i][7];
                                    dataObj.odds['GG'] = odds[i][8];
                                    dataObj.odds['NG'] = odds[i][9];
                                    data.push(dataObj);
                                }
                                datas.push(data);
                                console.log(times);
                                console.log(events);
                                console.log(odds);
                                console.log(dates);
                                resolve(datas);
                            }, 200);
                        }, 200);
                    });
                })
                // console.log(dates);
                console.log("The datas are ", datas);
                return dataPromise;
                // return body.length;
                // return datas;
            });
        } catch (err) {
            console.log(err);
        }

        oddListData[0] = oddListData[0].map(data => {
            if(data.event !== undefined){
                let event = data.event;
                let id = generateID(event, 'pl');
                data.eventID = id;
                return data;
            }
            else{
                return data;
            }
        });

        oddListData = oddListData;

        oddListData[1] = oddListData[1].map(data => {
            if(data.event !== undefined){
                let event = data.event;
                let id = generateID(event, 'll');
                data.eventID = id;
                return data;
            }
            else{
                return data;
            }
        });


        oddListData = oddListData;

        oddListData[2] = oddListData[2].map(data => {
            if(data.event !== undefined){
                let event = data.event;
                let id = generateID(event, 'sa');
                data.eventID = id;
                return data;
            }
            else{
                return data;
            }
        });

        // oddListData[3] = oddListData[3].map(data => {
        //     if(data.event !== undefined){
        //         let event = data.event;
        //         let id = generateID(event, 'eu');
        //         data.eventID = id;
        //         return data;
        //     }
        //     else{
        //         return data;
        //     }
        // });


        // oddListData = oddListData;

        // oddListData[4] = oddListData[4].map(data => {
        //     if(data.event !== undefined){
        //         let event = data.event;
        //         let id = generateID(event, 'mls');
        //         data.eventID = id;
        //         return data;
        //     }
        //     else{
        //         return data;
        //     }
        // });
        


        page.close(); //close the page before opening the next page
        return oddListData;
        
    }
};

module.exports = scraper;