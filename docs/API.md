# OddsScraper server API

This document provides the implementation details of the OddsScraper server API. For detailed description of how the server works see the [server design document](http://......).

## Overview

------------------------------------------------------------------------------------------------------------------

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
    
### Request Format

All requests to the API is expected to be a `GEt` request

### Response format

All request receives a JSON response body.

The response is always in the format given below with an exception of when an error occurs.

```javascript
{
    "success": true,
    "site": "<site-name>", 
    "league": "<league name>",
    "marketCount": data.length, #Number of events data returned
    "market": [Objects] #An Array of events Objects
}
```

* `success` : The success parameter should be the first thing checked to confirm that the server does not return an error. The server only returns a `success` of `true` when everything works fine as intended.

* `site` : the site parameter is the name of the site that was requested for in the API parameter endpoint

* `league`: The name of the league being requested

* `marketCount`: Gives the exact number of event that was returned, this can come on handy when you want to confirm if a league has an event. Just check if the `marketCount` is greater than 0.

* `market`: Returns an Array of events Objects
    * `[Array]` :  `[Objects]`
    
    THe Object looks something iike
    
```javascript
{
    "date":"25 May 2019",
    "time":"17:00",
    "event":"Frosinone - Chievo",
    "eventRef":"Fro - Chi",
    "odds":{             
        "1":"2.32",
        "2":"2.84",
        "12":"1.24",
        "X":"3.75",
        "1X":"1.38",
        "X2":"1.57",
        "O2.5":"1.50",
        "U2.5":"2.50",
        "GG":"1.43",
        "NG":"2.70",
        "1HT":"2.77",
        "2HT":"3.20",
        "XHT":"2.40"
    },
    "eventID": "1335"
}
```


### Error Format

All errors from the server are received as a JSON Object. The errors are always in the format shown below

``` javascript
{
    "success": false,
    "error": {
        "code": 404,
        "message": "Could not find any data for betway",
        "err_message": err
    }
}
```

* `success`: The success returns `false` when an error occured
* `error`: {
        * `code`: Display the error code of the error,
        * `message`: A friemdy message giving more info about the error,
        * `err_message`: The server side verbose error message,
}