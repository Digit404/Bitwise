# Here is a part of my powershell profile made to be compatible with 7+ and 5.0
# Terminal Icons
if (!(Get-Module -ListAvailable -Name Terminal-Icons)) {
	Install-Module -Name Terminal-Icons -Repository PSGallery
}
Import-Module Terminal-Icons

# Escape characters and color codes
$ESC = [char]27

$Colors = @{
	Black         = "$ESC[30m"
	Red           = "$ESC[31m"
	Green         = "$ESC[32m"
	Yellow        = "$ESC[33m"
	Blue          = "$ESC[34m"
	Magenta       = "$ESC[35m"
	Cyan          = "$ESC[36m"
	White         = "$ESC[37m"
	BrightBlack   = "$ESC[90m"
	BrightRed     = "$ESC[91m"
	BrightGreen   = "$ESC[92m"
	BrightYellow  = "$ESC[93m"
	BrightBlue    = "$ESC[94m"
	BrightMagenta = "$ESC[95m"
	BrightCyan    = "$ESC[96m"
	BrightWhite   = "$ESC[97m"
}

# Put your preferred name here
$CustomName = ""

$Name = If ($CustomName.Length) { $CustomName } Else { $env:USERNAME }

# Better, more colorful prompt
function prompt {
	$homeDir = $env:userprofile
	$currentDir = $PWD.Path

	if ($currentDir.StartsWith($homeDir)) {
		$currentDir = "~" + $currentDir.Substring($homeDir.Length)
	}

	Write-Host ("$Name $($Colors.Yellow)$currentDir $($Colors.White)>") -NoNewLine
	return " "
}