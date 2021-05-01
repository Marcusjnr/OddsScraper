/**
* This module is used to filter out teams that have invalid ID's in them and also and returns only thise with valid ID's 
*/

function filterID(events){
	let data = events;
	console.log("length ", data.length);
	let validData = data.filter(event => event.eventID.search('00') === -1);
	// console.log("The data ID is ", validData);
	return validData;
}

module.exports = filterID;