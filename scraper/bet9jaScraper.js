const rp = require("request-promise");
const $ = require("cheerio");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const generateID = require('../api/services/uniqueIdGenerator');

const scraper = {
  /**
   * the scraper object is used to scrape data from the bet9ja site for three major leagues
   * - Premier League
   * - La liga 
   * - seria A
   * It scrapes data for 8 differennt kind of odds- 1, 2, X, 1X, 2X, 12, GG, NG
   * @property premierEvent {Number} - The event number for the premier league
   * @property ligaEvent {Number} - The event number for the laliga
   * @property seriaEvent {Number} - The event number for the seriaA league
   * @param bet9jaFetcher {method} - It fetches information for any  league on the bet9ja page
   * @param fetchPL {method} - It fetches information only premier league  and depends on the bet9jaFetcher to work
   * @param fetchLiga {method} - It fetches information only laliga  and depends on the bet9jaFetcher to work
   * @param fetchSeria {method} - It fetches information seriaA  and depends on the bet9jaFetcher to work
   */

  //URL's for all endpoints to be scraped from
  premierLeagueURL: "https://web.bet9ja.com/Sport/Odds?EventID=170880",
  laLigaURL: "https://web.bet9ja.com/Sport/Odds?EventID=180928",
  seriaAURL: "https://web.bet9ja.com/Sport/Odds?EventID=167856",
  euURL: "https://web.bet9ja.com/Sport/Odds?EventID=516996",
  mlsURL: "https://web.bet9ja.com/Sport/Odds?EventID=506175",
  premierEvent: 170880,
  ligaEvent: 180928,
  seriaEvent: 167856,
  euEvent: 516996,
  mlsEvent: 506175,
  bet9jafetcher: async (browser, url, eventId) => {
    /**
     * This is the method that scrapes all bet9ja related data.
     * It scrapes fo both la liga, premier league and seria A
     * Data scraped depends on the parameter passed to the annonymous function
     * @property url {String} - specifies the url of the league to be scraped
     * @property eventId {String} - specifies the id of the league to be scraped
     */
    return (async () => {
      let page;
      //create a new browser instance
      // const browser = await puppeteer.launch({
      //   args: ["--no-sandbox", "--disable-setuid-sandbox"]
      // });
      //create a page inside the browser
      try{
        page = await browser.newPage();
      }catch(err){
        console.log("Could not open a new page ", err);
      }
      //navigate to required site
      try{
        await page.goto(url, {
          waitUntil: "domcontentloaded"
        });
      }catch(err){
        console.log("Could not navigate to the url => url : ", err);
      } 
      console.log("scraping, wait...");
      //Load needed DOm from the page
      const data = await page.evaluate(() => {
        //Convert the returned NodeList into an Array and map out the feature needed
        return Array.from(document.querySelectorAll(".item")).map(
          element => element.innerHTML
        );
      });

      const fetchHT = () => {
        return fetch(
            "https://web.bet9ja.com/Controls/ControlsWS.asmx/OddsViewDetails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: "ASP.NET_SessionId=dn4p04vhmh4rdkdahoyvx0x0; ISBets_CurrentCulture=2; mb9j_nodesession=rd201o00000000000000000000ffff0a070184o80"
              },
              body: JSON.stringify({
                IDEvento: eventId,
                IDGruppoQuota: 12,
                TipoVisualizzazione: 1,
                DataInizio: 636932160000000000,
                DataFine: 636938208000000000
              })
            }
          )
          .then(res => res.json())
          .then(data => {
            return data;
          })
          .catch(err => err);
      }

      async function fetchHTData() {
        let HT = await [];
        return fetchHT().then(data => {
          if(data.d.SottoEventiList.length === 0){
            return HT;
          }
          else{
            data.d.SottoEventiList.forEach(data => {
              let detail = {};
              detail["match"] = data.SottoEvento; //Clubs playing
              data.Quote[0] ? detail["1HT"] = data.Quote[0].StrQuotaValore : detail['1HT'] = '-'; //1HT odd
              data.Quote[1] ? detail["2HT"] = data.Quote[1].StrQuotaValore : detail['2HT'] = '-'; //2HT odd
              data.Quote[2] ? detail["XHT"] = data.Quote[2].StrQuotaValore : detail['XHT'] = '-'; //XHT odd
              HT.push(detail);
              // console.log(detail);
              detail = {};
            });
          return HT;
          }
        });
      }

      const HT = await fetchHTData().then(res => {
        return res;
      });



      //fetch odds for GG/NG from their api endpoint
      const fetchGG = () => {
        return fetch(
            "https://web.bet9ja.com/Controls/ControlsWS.asmx/OddsViewDetails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: "ASP.NET_SessionId=dn4p04vhmh4rdkdahoyvx0x0; ISBets_CurrentCulture=2; mb9j_nodesession=rd201o00000000000000000000ffff0a070184o80"
              },
              body: JSON.stringify({
                IDEvento: eventId,
                IDGruppoQuota: 10,
                TipoVisualizzazione: 1,
                DataInizio: 636914016000000000,
                DataFine: 636920064000000000
              })
            }
          )
          .then(res => res.json())
          .then(data => {
            return data;
          })
          .catch(err => err);
      };
      //After the Odd is fetched, prepare the required details from the JSON response
      async function fetchGGNG() {
        let GGNG = await [];
        return fetchGG().then(data => {
          if(data.d.SottoEventiList.length === 0){
            return GGNG
          }
          else{
            data.d.SottoEventiList.forEach(data => {
              let detail = {};
              detail["match"] = data.SottoEvento; //Clubs playing
              data.Quote[0] ? detail["GG"] = data.Quote[0].StrQuotaValore: detail['GG'] = '-'; //GG odd
              data.Quote[1] ? detail["NG"] = data.Quote[1].StrQuotaValore : detail['NG'] = '-'; //NG odd
              GGNG.push(detail);
              // console.log(detail);
              detail = {};
            });
            return GGNG;
          }
        });
      }
      //Get the JSON response prepared
      const GGNG = await fetchGGNG().then(res => {
        return res;
      });
      const dataDetails = []; //An empty array to be filled with the necessary detail of scraped data
      const dataDetail = data.forEach(val => {
        let thatData = {};
        thatData["date"] = $(".sepData", val).text();
        thatData["time"] = $(".Time > .ng-binding", val)
          .text()
          .substr(0, 5);
        thatData["event"] = $(".Event", val).text();
        let eventRef = $(".Event", val).text();
        eventRef = eventRef.split(" - ");
        eventRef[0].search(/manchester/gi) !== -1 && eventRef[0].search(/united/gi) !== -1 ? eventRef[0] = eventRef[0].slice(0,3) + 'U' : eventRef[0] = eventRef[0].slice(0,3);
        eventRef[1].search(/manchester/gi) !== -1 && eventRef[1].search(/city/gi) !== -1 ? eventRef[1] = eventRef[1].slice(0,3) + 'C' : eventRef[1] = eventRef[1].slice(0,3);
        eventRef = eventRef.join(" - ");
        thatData["eventRef"] = eventRef;
        thatData["odds"] = {
          "1": $(
            ".odds > .gq > .ng-isolate-scope > .cq:first-child > .odd:nth-child(2) > .oddsType + div",
            val
          ).text(),
          X: $(
            ".odds > .gq > .ng-isolate-scope > .cq:first-child > .odd:nth-child(3) > .oddsType + div",
            val
          ).text(),
          "2": $(
            ".odds > .gq > .ng-isolate-scope > .cq:first-child > .odd:nth-child(4) > .oddsType + div",
            val
          ).text(),
          "1X": $(
            ".odds > .gq > .ng-isolate-scope > .cq:nth-child(2) > .odd:nth-child(2) > .oddsType + div",
            val
          ).text(),
          "12": $(
            ".odds > .gq > .ng-isolate-scope > .cq:nth-child(2) > .odd:nth-child(3) > .oddsType + div",
            val
          ).text(),
          X2: $(
            ".odds > .gq > .ng-isolate-scope > .cq:nth-child(2) > .odd:nth-child(4) > .oddsType + div",
            val
          ).text(),
          "O2.5": $(
            ".odds > .gq > .ng-isolate-scope > .cq:nth-child(3) > .odd:nth-child(2) > .oddsType + div",
            val
          ).text(),
          "U2.5": $(
            ".odds > .gq > .ng-isolate-scope > .cq:nth-child(3) > .odd:nth-child(3) > .oddsType + div",
            val
          ).text()
        };
        dataDetails.push(thatData);
        // console.log(thatData);
        thatData = {};
      });
      // console.log("The data details is ", dataDetails);
      for (let i = 0; i < dataDetails.length; i++) {
        dataDetails[i].odds["GG"] = GGNG[i].GG;
        dataDetails[i].odds["NG"] = GGNG[i].NG;
        dataDetails[i].odds["1HT"] = HT[i]["1HT"];
        dataDetails[i].odds["2HT"] = HT[i]["2HT"];
        dataDetails[i].odds["XHT"] = HT[i]["XHT"];
      }
      page.close();
      // console.log("The data details is 2 ", dataDetails);
      return dataDetails;
      // await browser.close(); //Make sure the browser closes after all operations
    })();
  },
  fetchData: async (browser) => {
    let market = [];

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

    await scraper.bet9jafetcher(browser,scraper.premierLeagueURL,scraper.premierEvent)
    .then(res => {
      let data = addID(res, 'pl');
      market.push(data);
    })

    await scraper.bet9jafetcher(browser, scraper.laLigaURL, scraper.ligaEvent)
    .then(res => {
      let data = addID(res, 'll');
      market.push(data);
    })

    await scraper.bet9jafetcher(browser, scraper.seriaAURL, scraper.seriaEvent)
    .then(res => {
      let data = addID(res, 'sa');
      market.push(data);
    })

    // await scraper.bet9jafetcher(browser, scraper.euURL, scraper.euEvent)
    // .then(res => {
    //   let data = addID(res, 'eu');
    //   market.push(data);
    // })

    // await scraper.bet9jafetcher(browser, scraper.mlsURL, scraper.mlsEvent)
    // .then(res => {
    //   let data = addID(res, 'mls');
    //   market.push(data);
    // })
    return market;
  }
};

// //For test purpose
// scraper.fetchSeria().then(data => console.log("the data is ", data));

module.exports = scraper;