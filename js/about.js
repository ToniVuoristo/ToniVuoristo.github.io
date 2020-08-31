function parseAboutEN()
{
	$("#active_content").load("misc/about_me_en.html");		
}


function parseAboutFI()
{
	$("#active_content").load("misc/about_me_fi.html");	
}


$(document).ready(parseAboutEN());    // Default to en profile
