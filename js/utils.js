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
	$("#active_content").load("../html/games/wastadium.html"); 
}


function parseSoftTools()
{
	$("#active_content").load("../html/soft_tools/substance_tex.html"); 	
}


function parseRobotics()
{
	$("#active_content").load("../html/robotics/trubik.html"); 
}


$(document).ready(parseGames());    // Default to games
