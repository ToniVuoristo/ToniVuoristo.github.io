function updateLastEdit()
{
	var last_edit = document.getElementById("j_last_edit");
	if (last_edit === null){
		return;
	}

	last_edit.innerHTML = "Last Update: " + document.lastModified;
}

$(document).ready(updateLastEdit());
