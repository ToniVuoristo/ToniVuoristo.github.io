function updateLastEdit()
{
	var last_edit = document.getElementById("j_last_edit");
	if (last_edit === null){
		return;
	}

	last_edit.innerHTML = "Last Update: " + document.lastModified;
}

$(document).ready(updateLastEdit());


function parseGames()
{
	$("#active_content").load("../html/games/games.html");
}


function parseSoftTools()
{
	$("#active_content").load("../html/soft_tools/tools.html"); 	
}


function parseRobotics()
{
	$("#active_content").load("../html/robotics/robotics.html");
}


//$(document).ready(parseGames());    // Default to games
