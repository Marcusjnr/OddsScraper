const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');
const randomUA = require('modern-random-ua');

const scraper = {
    /**
     * the scraper object is used to scrape data from the naira Bet site for three major leagues
     * - Premier League 
     * - La liga 
     * - seria A
     * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
     * @property premierEvent {Number} - The event number for the premier league
     * @property ligaEvent {Number} - The event number for the laliga
     * @property seriaEvent {Number} - The event number for the seriaA league
     * @param bet9jaFetcher {method} - It fetches information for any  league on the naira Bet page
     * @param fetchPL {method} - It fetches information only premier league  and depends on the nairaBetFetcher to work
     * @param fetchLiga {method} - It fetches information only laliga  and depends on the nairaBetFetcher to work
     * @param fetchSeria {method} - It fetches information seriaA  and depends on the nairaBetFetcher to work
     */

    //URL's for all endpoints to be scraped from
    premierLeagueURL: "https://www.nairabet.com/UK/sports#bo-navigation=343601.1,343637.1,368940.1&action=market-group-list",
    laLigaURL: "https://www.nairabet.com/UK/sports#bo-navigation=343601.1,343632.1,369016.1&action=market-group-list",
    seriaAURL: "https://www.nairabet.com/UK/sports#bo-navigation=343601.1,343745.1,369027.1&action=market-group-list",
    euURL: "https://www.nairabet.com/UK/sports#bo-navigation=343601.1,343654.1,371918.1&action=market-group-list",
    mlsURL: "https://www.nairabet.com/UK/sports#bo-navigation=343601.1,343687.1&action=market-group-list",
    nairaBetFetcher: async(browser) => {
        let page, oddListData
        function pageScraper(url){
            const pagePromise = new Promise(async (resolve, reject) => {
                try{
                    page = await browser.newPage();   
                    page.setUserAgent("Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion");
                }
                catch(err){
                    console.log(err);
                }
                try {
                    console.log("navigating to naira bet site");
                    await page.goto(url, {
                        waitUntil: "domcontentloaded",
                        timeout: 0
                    });
                } catch (err) {
                    console.log(`${url} => ${err}`);
                }
                try {
                    await page.waitFor("div.event-header");
                    await page.waitForSelector("div.bon-header.headerMain");
                    page.waitFor(60000);
                } catch (err) {
                    console.log(err);
                }
                try{
                    oddListData = await page.evaluate(async () => {
                        if(document.querySelector('.full-empty')){
                            return [];
                        }
                        else{
                            let leagueContainer = document.querySelector('.full-market-group-list');
                            let oddsBody = leagueContainer.querySelectorAll('.bon-container.level .mg-container .selections-container');
                            console.log("oddsBody is ", oddsBody);
                            oddsBody = Array.prototype.slice.call(oddsBody);
                            const dates = [];
                            const times = [];
                            const events = [];
                            let odds = [];
                            let market = [];
                            let odd1X2 = new Promise((resolve, reject) => {
                                oddsBody = oddsBody.map((oddBody, index) => {
                                    data = {}
                                    let odd = [];
                                    let time = oddBody.querySelector('.date .hour').textContent;
                                    let event = oddBody.querySelector('.name a').textContent;
                                    event = event;
                                    event = event.split(/vs/gi);
                                    event = event.join(' - ');
                                    let day = oddBody.querySelector('.date .day').textContent;
                                    let month = oddBody.querySelector('.date .month').textContent;
                                    let dt = new Date();
                                    let year = dt.getFullYear();
                                    let date = `${day} ${month} ${year}`;
                                    // times.push(time);
                                    // events.push(event);
                                    // dates.push(date);
                                    data.date = date;
                                    data.time = time;
                                    data.event = event;
                                    let eventRef = event.split(' - ');
                                    console.log('The event Ref is ', eventRef);
                                    eventRef[0].search(/manchester/gi) !== -1 && eventRef[0].search(/united/gi) !== -1 ? eventRef[0] = eventRef[0].slice(0,3) + 'U' : eventRef[0] = eventRef[0].slice(0,3);
                                    eventRef[1].search(/manchester/gi) !== -1 && eventRef[1].search(/city/gi) !== -1 ? eventRef[1] = eventRef[1].slice(0,3) + 'C' : eventRef[3] = eventRef[1].slice(0,3);
                                    eventRef = eventRef.join(' - ');
                                    data.eventRef = eventRef;
                                    data.odds = {};
                                    data.odds['1'] = oddBody.querySelector('.sel-col.sel-col-first label a span:nth-child(2)').textContent;
                                    data.odds['X'] = oddBody.querySelector('.sel-col:nth-child(3) label a span:nth-child(2)').textContent;
                                    data.odds['2'] = oddBody.querySelector('.sel-col.sel-col-last label a span:nth-child(2)').textContent;
                                    odd.push(data.odds['1']);
                                    odd.push(data.odds['X']);
                                    odd.push(data.odds['2']);
                                    odds.push(odd);
                                    market.push(data);
                                });
                                //click the container of double chance to display it
                                let DCBtn = document.querySelector('.mg-list-element:nth-child(28) a');
                                console.log("DC is ", DCBtn);
                                DCBtn.click();
                                setTimeout(() => {
                                    let oddsBody = leagueContainer.querySelectorAll('.bon-container.level .mg-container .selections-container');
                                    oddsBody = Array.prototype.slice.call(oddsBody);
                                    oddsBody.map((oddBody, index) => {
                                        console.log("ok ");
                                        odds[index].push(oddBody.querySelector('.sel-col.sel-col-first label a span:nth-child(2)').textContent);
                                        odds[index].push(oddBody.querySelector('.sel-col:nth-child(3) label a span:nth-child(2)').textContent);
                                        odds[index].push(oddBody.querySelector('.sel-col.sel-col-last label a span:nth-child(2)').textContent);
                                    });
                                    console.log(market);
                                    //click the GG/NG button
                                    let GNBtn = document.querySelector('.mg-list-element:nth-child(20) a');
                                    GNBtn.click();
                                }, 10000);
                                setTimeout(async () => {
                                    let oddsBody = leagueContainer.querySelectorAll('.bon-container.level .mg-container .selections-container');
                                    oddsBody = Array.prototype.slice.call(oddsBody);
                                    oddsBody.map((oddBody, index) => {
                                        console.log("ok ");
                                        odds[index].push(oddBody.querySelector('.sel-col.sel-col-first label a span:nth-child(2)').textContent);
                                        odds[index].push(oddBody.querySelector('.sel-col.sel-col-last label a span:nth-child(2)').textContent);
                                    });
                                    console.log(market);
                                    let FTCategoryBtn = document.querySelector('.mg-category:nth-child(5) a');
                                    await FTCategoryBtn.click();
                                    setTimeout(() => {
                                        let FTBtn = document.querySelector('.mg-list-element:nth-child(9) a');
                                        console.log("The button is ", FTBtn);
                                        FTBtn.click();
                                    }, 10000);
                                }, 20000);
                                setTimeout(async () => {
                                    let oddsBody = leagueContainer.querySelectorAll('.bon-container.level .mg-container .selections-container');
                                    oddsBody = Array.prototype.slice.call(oddsBody);
                                    oddsBody.map((oddBody, index) => {
                                        console.log("ok ");
                                        odds[index].push(oddBody.querySelector('.sel-col.sel-col-first label a span:nth-child(2)').textContent);
                                        odds[index].push(oddBody.querySelector('.sel-col:nth-child(3) label a span:nth-child(2)').textContent);
                                        odds[index].push(oddBody.querySelector('.sel-col.sel-col-last label a span:nth-child(2)').textContent);
                                    });
                                    console.log(market);
                                    resolve(true);
                                }, 30000);
                            });
                            await odd1X2.then(res => console.log("Scraping DC data"));
                            console.log("market is ", market);
                            market = await market.map((mkt, index) => {
                                let data = mkt;
                                data.odds['1X'] = odds[index][3];
                                data.odds['12'] = odds[index][4];
                                data.odds['2X'] = odds[index][5];
                                data.odds['GG'] = odds[index][6];
                                data.odds['NG'] = odds[index][7];
                                data.odds['1HT'] = odds[index][8];
                                data.odds['XHT'] = odds[index][9];
                                data.odds['2HT'] = odds[index][10];
                                return data;
                            });
                            console.log("the market is ", market);
                            return market;
                        }
                    });
                }
                catch(err){
                    console.log(err);
                }
                page.close();
                resolve(oddListData);
            })
            return pagePromise;
        }
        const markets = []

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


        // For all premierLeagues matches
        await pageScraper(scraper.premierLeagueURL).then(res => {
            let data = res.filter(x => x.odds['12'] !== undefined && x.odds['1X'] !== undefined);
            res = addID(res, 'pl')
            markets.push(res);
        })
        .catch(err => {
            console.log("An error occured when scraping Premier League data ", err);
            markets.push([]);
        });

        // For all la liga matches
        await pageScraper(scraper.laLigaURL).then(res => {
            let data = res.filter(x => x.odds['12'] !== undefined && x.odds['1X'] !== undefined);
            res = addID(res, 'll')
            markets.push(res);
        })
        .catch(err => {
            console.log("An error occured when scraping la liga data ", err);
            markets.push([]);
        });

        //for all serai A matches
        await pageScraper(scraper.seriaAURL).then(res => {
            let data = res.filter(x => x.odds['12'] !== undefined && x.odds['1X'] !== undefined);
            res = addID(res, 'sa')
            markets.push(res);
        })
        .catch(err => {
            console.log("An error occured when scraping Seria A data ", err);
            markets.push([]);
        });

        //for all European Leagues matches
        // await pageScraper(scraper.euURL).then(res => {
        //     console.log("The EU data is ", res);
        //     let data = res.filter(x => x.odds['12'] !== undefined && x.odds['1X'] !== undefined);
        //     res = addID(res, 'eu')
        //     markets.push(res);
        // })
        // .catch(err => {
        //     console.log("An error occured when scraping European Championship data ", err);
        //     markets.push([]);
        // });

        // //for all Major League Soccer matches
        // await pageScraper(scraper.mlsURL).then(res => {
        //     console.log("The MLS data is ", res);
        //     let data = res.filter(x => x.odds['12'] !== undefined && x.odds['1X'] !== undefined);
        //     data = addID(res, 'mls');
        //     market.push(data);
        // })
        // .catch(err => {
        //     console.log("An error occured when scraping Major League Soccer data ", err);
        //     markets.push([]);
        // });
        // console.log("The markets are ", markets);
        return markets;
    }
}
//08117512976
module.exports = scraper;