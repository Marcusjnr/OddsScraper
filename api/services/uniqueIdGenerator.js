/**
* @description - This module automatically generates a unique ID for every team and ultimately
* every combination of teams across all leagues
*/
const premierLeague = require('./premierLeagueTeams');
const laLiga = require('./laLigaTeams');
const seriaA = require('./seriaATeams');
const europeanChampionship = require('./euTeams');
const maljorLeagueSoccer = require('./mlsTeams');


function searchTeam(team, league){
	/**
	* @property team - the team an ID is being generated for
	* @property league - The league the team belongs to
	*/
	let matchedTeam;
	let teams = Object.values(league); //Get the unique ID's of every team into an array
	let teamsKey = Object.keys(league); //Get the unique league name of every team into an array
	if(team === undefined){
		matchedTeam = 'invalid';
	}
	else{
		matchedTeam = teams.find(te => team.search(new RegExp(te, 'gi')) !== -1);//Find the team that matches the search
	}
	if(matchedTeam !== undefined){
		let teamIndex = teams.indexOf(matchedTeam); //Index of the matched team in the teams array
		let teamID = teamsKey[teamIndex]; //The key of the team that matches the search
		// console.log(teamID, " ", teamIndex);
		return teamID;
	}
	else{
		// when no league matches, return an error ID
		return '00';
	}
}

function searchTeam2(team, league){
	let matchedTeam;
	let teams = Object.values(league);
	let teamsKey = Object.keys(league);
	if(team === undefined){
		// matchedTeam = 'invalid';
		return '00';
	}
	else{
		let teamLength = team.length;
		teams = teams.map((teamName, index) => {
			let teamToMatch = team.split('');
			let teamMatchedTo = teamName.split('');
			let matchRate = 0;
			teamToMatch.forEach(teamLetter => {
				let matchedLetter = teamMatchedTo.find(te => te === teamLetter);
				if(matchedLetter !== undefined){
					if(teamMatchedTo.indexOf(matchedLetter) === teamToMatch.indexOf(matchedLetter)){
						matchRate += 2;
					}
					teamMatchedTo = removeLettter(teamMatchedTo, matchedLetter);
					teamToMatch = removeLettter(teamToMatch, matchedLetter);
					matchRate++;
				}
				// console.log("Letter is =>", matchedLetter, "and team letter is => ", teamLetter);
			})
			return matchRate;
		});
		let highestRate = Math.max(...teams);
		let highestRateIndex = teams.indexOf(highestRate);
		let matchedId = teamsKey[highestRateIndex];
		return matchedId;
	}
}

function removeLettter(arr, letter){
	/** 
	This function removes a specified letter from an array given the array and the letter to remove
	*/
	let letterIndex = arr.indexOf(letter);
	let letterBefore = arr.slice(0, letterIndex);
	let letterAfter = arr.slice(letterIndex + 1, )
	let result = letterBefore.concat(letterAfter);
	return result;
}

// let match = 'toronto - dallas'; 

function generateID(event, league){
	event = event.split(' - ');
	// console.log("event teams are ", event[0], ' and ', event[1]);
	function createID(lg){
		let homeTeamID = searchTeam2(event[0], lg);
		let awayTeamID = searchTeam2(event[1], lg);
		let eventID = String(homeTeamID) + String(awayTeamID);
		// console.log("The ID is ", eventID);
		return eventID;
	}
	if(league === 'pl'){
		return createID(premierLeague);
	}
	else if(league === 'll'){
		return createID(laLiga);
	}
	else if(league === 'sa'){
		return createID(seriaA);
	}
	else if(league === 'eu'){
		return createID(europeanChampionship);
	}
	else if(league === 'mls'){
		return createID(majorLeagueSoccer);
	}
	else{
		throw new Error('An invalid league was provided');
	}
}


// console.log(searchTeam2('chelsea', premierLeague));
let match = 'arsenal - burnley'
console.log(generateID(match, 'pl'));
module.exports = generateID;