# OddsScraper server

The OddsScraper server runs using the express module and an headless puppeteer browser. 

## File Structures

+ api
    + routes
        - page routes.....
    + controllers
        - page controllers....
+ config
    - browser.js
    - continuos_scrape
    - cors.js
    - db_config.js
    - db_init.js
    - db_update.js
+ docs
    - API.md
    - CONTRIBUTING.md
+ models
    - betSitesSchema.js
+ scraper
    - masterScraper.js
    - scrapers......
+ test
- app.js
- cluster.js
- config.js
- README.md

### Cluster
When the server is started, internally, the server uses clusters and child processes to scale the node js application to the fll capacity of its host machine. 

### Browser
The whole application uses a single browser instance! This was done so as to prevent memory loss from the application and make it scale better. The browser instance used can be found in the `config` folder which is used

### Scrapers

The Scraper folder was structured so that every website has its own scraper file that scrapes odds concerning it.
Each of this folder scrapes data for both premier league, la liga and seria A And this data 

There is a `masterScraper` file in the `scraper` folder, the master script runs a browser instance and calls the functions that scrapes the data for every site synchronously, after which it saves this data in the database


### Controllers

The controllers are used along line with the routes which exposes the API, the controllers majorly checks if this data is present in the database, returns the data for each league and also handle every error that is likely to happen. This controllers are served as a middleware function to their respective routes
    
    
## Adding new leagues to the  app
The process below only applies to `surebet`, `nairabet`, `merrybet`, `betway`.

The scraper for this sites returns an array of 3 elements, each element being an array of the league data, the way this elements are rendered into their parents array are through a three promises thats are called on each of this leagues at the end of their scrapers like so.

```javascript
let market = [];
await pageScraper(scraper.premierLeagueURL)
.then(res => {
    market.push(res); 
});
await pageScraper(scraper.laLigaURL)
.then(res => {
    market.push(res); 
});
await pageScraper(scraper.seriaAURL)
.then(res => {
    market.push(res); 
});
```

Notice that it scrapes each league synchronously and waits for one league to finish scraping before scraping the other.
Also note that the same function is called thrice on each league? why? Every league has a similar layout with a similar way of rendering data to this layout.

To add a new league to our scraper, we would simply create a new `URL` property for our object containing the league's url at the top of the Object as such

```javascript
newLeagueURL: "https://www.surebet247.com/sports/football/france-ligue-1/"
```

Then the new league can be added to the await tasks as such 

```javascript
await pageScraper(scraper.newLeagueURL)
.then(res => {
    market.push(res); 
});
```

This would automatically make the new league the fourth item in the array with an index of 3.


Now, head on to `./api/controllers`, find the controller for the site you want to add a new league to.

In the controller file, you'll see a code similar to the following code

```javascript
 /**
 * This module exports an Objects of express middlewares for different sureBet routes
 * A middleware for premier leage, seria A and also la liga 
 * 
 */ 

const betSitesDB = require("../../models/betSitesSchema");


module.exports = function(req, res, next){
    betSitesDB.find({'siteName':'<site-name>'})
    .then(<site-name>Data => {
        req.<site-name>PLData = <site-name>Data[0].data[0]; //premier league
        req.<site-name>LLData = <site-name>Data[0].data[1]; //la liga 
        req.<site-name>SAData = <site-name>Data[0].data[2]; //serai A 
        next();
    })
    .catch(err => {
        res.status(404).json({
            "success": false,
            "error": {
                "code": 404,
                "message": `Could not find any data for ${site-name}`,
                "err_message": err
            }
        })
    })
}

```

Add the following code to the `.then` code block before the `next()` middleware is called.

```javascript 
req.{site-name}{alias}Data = {site-name}Data[0].data[3]; //league Name 
```

Good!, Now to the next step. Head on to `./api/routes` and open the route file of the site you want to edit. 

Now, you have to create a route on the API for the new league you just added.

Add the following code to the file just before the module is exported

```javascript
//For new league
app.get('/<site-name>)/<league-alias>', <site-name>Controller, (req, res, next) => {
    //Routes to get all <league-name> leagues odds
    let data = req.<site-name><alias>Data;
    res.status(200).json({
        "success": true,
        "site": "<site-name>",
        "league": "<league-name>",
        "marketCount": data.length,
        "market": data
    });
});
```

Now, You're good to go!! Another league has been successfully added to the site 

Yaaaay!!!!!

![Celebration](https://media.giphy.com/media/1PMVNNKVIL8Ig/giphy.gif)
