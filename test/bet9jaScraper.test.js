/**
 * The bet9ja scraper scarpes data for 3 leagues on the bet9ja site
 * The bet9ja scraper returns a pending Promise of an Array of Objects if the data was successfully scraped 
 */

describe("Make sure all bet9ja data for any league are successfully scraped", () => {
const bet9jaScraper = require("../scraper/bet9jaScraper");
test("make sure the general fetcher is working", () => {
    expect.assertions(1);
    bet9jaScraper.bet9jafetcher("https://web.bet9ja.com/Sport/Odds?EventID=170880", 170880)
        .then(data => {
            expect(data.length).toBeGreaterThan(0);
        })
        .catch(err => console.log("The error is ", err))
})

});