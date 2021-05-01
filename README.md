# Odds Scraper server

This project implements the core server side scripts that scrapes odds off of 8 different betting sites 

The betting sites scraped from on in this project include the following

* [bet9ja](https://web.bet9ja.com)

* [bet king](https://www.betking.com/sports/s/event/p/soccer)

* [merry bet](https://merrybet.com/sports)

* [naira bet](https://www.nairabet.com/UK/sport)

* [sporty bet](https://www.sportybet.com/ng/sport/football)

* [betway](https://www.betway.com.ng/sport)

* [sure bet](https://www.surebet247.com/sports/football)

* [1960 bet](https://www.1960bet.com/XSport)

And the Odds scraped are limited tp the following 0dds

* 1X2

* Double Chance

* Both Teams Score

* Half Time Results (1X2)

### URl structure

All requests use URLs of the form:

`
https://<base-URI>/api/<site-name>/<league-alias>`

Note that :

The currently hosted URL is `https://oddscraper.herokuapp.com`

* The below are the various <site-names> used
    * bet9ja
    * betking
    * bet1960
    * surebet
    * sportybet
    * merrybet
    * nairabet
    * betway
    
* The below are the three league aliases used
    * pl - premier league
    * ll - la liga
    * sa - seria A

## Prerequisites

* *node 6+*

* *npm 2+*

## Install

On some systems running the server as root will cause working directory permissions issues with node. It is recommended that you create a separate, standard user to ensure a clean and more secure installation.

Clone the git repository and install dependencies:

`git https://github.com/Marcusjnr/OddsScraper.git
cd OddsScraper
npm install`

To start the server in dev memory store mode (ie. NODE_ENV=dev), run:

`npm run start`

## Deployment 

### Heroku

To deploy the application to heroku, simply follow this conprehensive guide on how to deploy node js apps to heroku - https://devcenter.heroku.com/articles/deploying-nodejs

### AWS

To deploy the aplication to AWS, simply follow this comprehensive AWS guide on deploying node js applications to AWS - https://aws.amazon.com/getting-started/projects/deploy-nodejs-web-app/
