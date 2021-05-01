/**
 * All defined route have an endpoint `<routeName>/test`
 * This endpoint simply responds with an object that has a success property set to true
 * If no response is gotten, the route doesn't work
 */
const fetch = require('node-fetch');
const baseUrl = "http://localhost:9500/api";
describe("Check if all defined routes works", () => {
    const routes = ['bet9ja', 'bet1960', 'betking', 'betway', 'merrybet', 'nairabet', 'sportybet', 'surebet'];
    routes.forEach(_route => {
        test(`Check if ${_route} route is working appropriately`, () => {
            expect.assertions(1);
            return fetch(`${baseUrl}/${_route}/test`)
                .then(data => data.json())
                .then(data => {
                    expect(data.success).toBeTruthy();
                })
                .catch(err => {
                    console.log(err);
                })
        });
    })
});