const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const customEnv = require("custom-env").env();
const cors = require("cors");
const corsConfig = require("./config/cors");

const browserInstance = require('./config/browser')();

require('./config/db_config'); //connect to mongo database
require('./config/db_init'); //Initialize all the data in the collection with some value if they are empty;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json()); 
app.use(express.json());

//Kepp the app awake on heroku free servers
const https = require("https");
setInterval(function() {
    https.get("https://oddscraper.herokuapp.com/api/bet9ja/test");
}, 300000); // every 5 minutes (300000)

/********************************************************************************************
 *                                                                                           *
 * Cors is enabled so the client can acces enpoint on this API wthout having to make request *
 *  from the same Origin                                                                     *
 * read more about CORS here - https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS        *
 *                                                                                           *
 ********************************************************************************************/
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", corsConfig.origins);
  res.header("Access-Control-Allow-Headers", corsConfig.headers);
  if (req.method === "OPTIONS") {
    //preflight request
    res.header("Access-Control-Allow-Methods", corsConfig.methods);
    return res.status(200).json({});
  }
  next();
});

/********************************************************************************************
 *                                                                                           *
 * Makes sure all enpoints from this application must be accessed through the api route      *
 * This would be in the format `<base-url>/api/<required-route>`                             *
 *                                                                                           *
 ********************************************************************************************/

//Require the master scraper to scrape and save all necessary data
const masterScraper = require('./scraper/masterScraper');
masterScraper(browserInstance);
//require the module that keeps the scraping continuos every 30 minutes
require('./config/continuos_scrape');

const bet1960 = require("./api/routes/bet1960Route.js");
const bet9ja = require("./api/routes/bet9jaRoute.js");
const betKing = require("./api/routes/betKingRoute.js");
const betWay = require("./api/routes/betWayRoute.js");
const merryBet = require("./api/routes/merryBetRoute.js");
const nairaBet = require("./api/routes/nairaBetRoute.js");
const sportyBet = require("./api/routes/sportyBetRoute.js");
const sureBet = require("./api/routes/sureBetRoute.js");

app.use("/api", bet9ja);
app.use("/api", bet1960);
app.use("/api", betKing);
app.use("/api", betWay);
app.use("/api", merryBet);
app.use("/api", nairaBet);
app.use("/api", sportyBet);
app.use("/api", sureBet);

// require('./scraper/sportyBetScraper.js').sportyBetFetcher().then(res => console.log("the res is ", res));
// require('./scraper/1960betScraper.js').bet1960Fetcher().then(res => console.log("the res is ", res));
// require('./scraper/nairaBetScraper').nairaBetFetcher();

// require('./config/browser');

const port = process.env.PORT || 9600;

app.listen(port, () => console.log(`Listening on port ${port}`));


/**
 * Email - Okochaebube@gmail.com
 * pass - Ebem123!:.
 */