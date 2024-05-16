<#
.SYNOPSIS
This script contains several PowerShell functions for various tasks.

.DESCRIPTION
The script includes the following functions:
- Move-Cursor: Moves the cursor position on the console.
- Destruct: Retrieves the properties of an input object.
- New-Temp: Generates a temporary file with an optional extension.
- Add-Path: Adds a path to the system or user's PATH environment variable.
- Remove-Path: Removes a path from the system or user's PATH environment variable.
- ColorTest: Displays a color test on the console.
- FakePaste: Simulates a paste operation by sending keystrokes.
- Write-Object: Formats and displays an object's properties.
- Object: Creates a PowerShell object from a string.
#>


<#
.SYNOPSIS
Moves the cursor to a specified position on the console.

.DESCRIPTION
The Move-Cursor function is used to move the cursor to a specified position on the console. It can move the cursor either absolutely or relatively.

.PARAMETER X
The X coordinate of the new cursor position. If not specified, the current X coordinate will be used.

.PARAMETER Y
The Y coordinate of the new cursor position. If not specified, the current Y coordinate will be used.

.PARAMETER Absolute
Specifies that the cursor should be moved to an absolute position on the console. If this switch is not used, the cursor will be moved relatively.

.PARAMETER Relative
This switch doesn't have any effect on the cursor movement. It is included for peace of mind.

.EXAMPLE
Move-Cursor -X 10 -Y 5
Moves the cursor to the absolute position (10, 5) on the console.

.EXAMPLE
Move-Cursor -X 5 -Y 2 -Relative
Moves the cursor relatively by adding 5 to the current X coordinate and 2 to the current Y coordinate.
#>
function Move-Cursor {
    param (
        [Parameter()]
        [AllowNull()]
        [nullable[int]]$X,

        [Parameter()]
        [AllowNull()]
        [nullable[int]]$Y,

        [Parameter()]
        [switch]$Absolute,

        [Parameter()]
        [switch]$Relative # Doesn't do anything but good for peace of mind
    )

    $cursorPos = $Host.UI.RawUI.CursorPosition # Current cursor position
    $pos = New-Object System.Management.Automation.Host.Coordinates

    if ($Absolute) {
        $pos.X = $X ?? $cursorPos.X
        $pos.Y = $Y ?? $cursorPos.Y
    } else {
        $pos.X = $X + $cursorPos.X
        $pos.Y = $Y + $cursorPos.Y
    }

    $Host.UI.RawUI.CursorPosition = $pos
}

function Destruct {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory, ValueFromPipeline)]
        [System.Object] $InputObject
    )

    $propertiesList = Get-Member -InputObject $InputObject -MemberType Properties

    $properties = $propertiesList.Foreach({
        $InputObject.$($_.Name)
    })

    return $properties
}

<#
.SYNOPSIS
Creates a new temporary file with an optional extension.

.DESCRIPTION
The New-Temp function creates a new temporary file using the GetTempFileName method from the System.IO.Path class. 
It can also add an optional extension to the file.

.PARAMETER Extension
Specifies the extension to be added to the temporary file. If the extension does not start with a dot (.), 
the function automatically adds one.

.EXAMPLE
New-Temp -Extension ".txt"
Creates a new temporary file with the .txt extension.

.EXAMPLE
New-Temp -Extension "csv"
Creates a new temporary file with the .csv extension.

.OUTPUTS
System.String
Returns the path of the newly created temporary file.

#>
function New-Temp {
    [CmdletBinding()]
    param (
        [Alias("Type")]
        [string]$Extension
    )

    $tempFile = [System.IO.Path]::GetTempFileName()

    if ($Extension) {
        if (-not $Extension.StartsWith(".")) {
            $Extension = "." + $Extension
        }

        $tempFile = $tempFile.Split(".")[0]
    }

    return ($tempFile + $Extension)
}

<#
.SYNOPSIS
Adds a path to the system, user, or process environment variable PATH.

.DESCRIPTION
The Add-Path function adds a specified path to the system, user, or process environment variable PATH. It ensures that the path is not already present in the PATH variable and handles empty strings in the PATH variable.

.PARAMETER Path
Specifies the path to be added to the PATH variable. This parameter is mandatory and accepts a string value.

.PARAMETER User
Specifies that the path should be added to the user environment variable PATH. This parameter is mutually exclusive with the Machine and Process parameters.

.PARAMETER Machine
Specifies that the path should be added to the machine environment variable PATH. This parameter is mutually exclusive with the User and Process parameters.

.PARAMETER Process
Specifies that the path should be added to the process environment variable PATH. This parameter is mutually exclusive with the User and Machine parameters.

.EXAMPLE
Add-Path -Path "C:\Program Files\MyApp" -User
Adds the path "C:\Program Files\MyApp" to the user environment variable PATH.

.EXAMPLE
Add-Path -Path "C:\Program Files\MyApp" -Machine
Adds the path "C:\Program Files\MyApp" to the machine environment variable PATH.

.EXAMPLE
Add-Path -Path "C:\Program Files\MyApp" -Process
Adds the path "C:\Program Files\MyApp" to the process environment variable PATH.

#>
function Add-Path {
    [CmdletBinding(DefaultParameterSetName='User')]
    param (
        [Parameter(Mandatory, ValueFromPipeline, Position=0)]
        [string]$Path,

        [Parameter(ParameterSetName='User')]
        [Alias("AsUser")]
        [switch]$User,

        [Parameter(ParameterSetName='Machine')]
        [Alias("AsMachine")]
        [switch]$Machine,

        [Parameter(ParameterSetName='Process')]
        [Alias("Temp", "Temporary")]
        [switch]$Process
    )
    
    $Scope = $PSCmdlet.ParameterSetName

    $Path = Resolve-Path -Path $Path -ErrorAction Stop

    Write-Host "Adding $Path to $Scope PATH..."

    $SystemPath = [Environment]::GetEnvironmentVariable("PATH", $Scope).Split(";")

    if ($SystemPath -contains $Path) {
        throw "$Path already in PATH!"
    }

    # clean up empty strings
    $SystemPath = $SystemPath.Where({ $_ -ne ""})

    $SystemPath += $Path

    $NewPath = $SystemPath -join ";"

    [Environment]::SetEnvironmentVariable("PATH", $NewPath, $Scope)
}

<#
.SYNOPSIS
Removes a specified path from the system or user PATH environment variable.

.DESCRIPTION
The Remove-Path function removes a specified path from the system or user PATH environment variable. It provides three parameter sets to specify the scope of the removal: User, Machine, and Process.

.PARAMETER Path
Specifies the path to be removed from the PATH environment variable.

.PARAMETER User
Specifies that the path should be removed from the user-level PATH environment variable.

.PARAMETER Machine
Specifies that the path should be removed from the machine-level PATH environment variable.

.PARAMETER Process
Specifies that the path should be removed from the current process-level PATH environment variable.

.EXAMPLE
Remove-Path -Path "C:\Program Files\MyApp" -User
Removes "C:\Program Files\MyApp" from the user-level PATH environment variable.

.EXAMPLE
Remove-Path -Path "C:\Program Files\MyApp" -Machine
Removes "C:\Program Files\MyApp" from the machine-level PATH environment variable.

.EXAMPLE
Remove-Path -Path "C:\Program Files\MyApp" -Process
Removes "C:\Program Files\MyApp" from the current process-level PATH environment variable.
#>
function Remove-Path {
    [CmdletBinding(DefaultParameterSetName='User')]
    param (
        [Parameter(Mandatory, ValueFromPipeline, Position=0)]
        [string]$Path,

        [Parameter(ParameterSetName='User')]
        [Alias("AsUser")]
        [switch]$User,

        [Parameter(ParameterSetName='Machine')]
        [Alias("AsMachine")]
        [switch]$Machine,

        [Parameter(ParameterSetName='Process')]
        [Alias("Temp", "Temporary")]
        [switch]$Process
    )
    
    $Scope = $PSCmdlet.ParameterSetName

    $Path = Resolve-Path $Path -ErrorAction Stop

    Write-Host "Removing $Path from $Scope PATH..."

    $SystemPath = [Environment]::GetEnvironmentVariable("PATH", $Scope).Split(";")
    
    $PathInPath = $SystemPath.Where({ $_ -eq $Path })

    $SystemPath = $SystemPath.Where({ $_ -ne $Path -and $_ -ne ""})

    if (-not $PathInPath) {
        throw "$Path not in PATH!"
    }

    $NewPath = $SystemPath -join ";"

    [Environment]::SetEnvironmentVariable("PATH", $NewPath, $Scope)
}

<#
.SYNOPSIS
    Performs a color test by displaying all possible combinations of foreground and background colors.

.DESCRIPTION
    The ColorTest function displays all possible combinations of foreground and background colors in the console.
    It uses the GetValues method of the ConsoleColor enumeration to retrieve all available colors.
    For each background color, it iterates through all foreground colors and displays the color combination using Write-Host.

.EXAMPLE
    ColorTest
    Displays all possible combinations of foreground and background colors in the console.

.NOTES
    Author: [Your Name]
    Date: [Current Date]
#>
function ColorTest {
     $colors = [enum]::GetValues([System.ConsoleColor])
     Foreach ($bgcolor in $colors) {
          Foreach ($fgcolor in $colors) { Write-Host "$fgcolor|" -ForegroundColor $fgcolor -BackgroundColor $bgcolor -NoNewLine }
          Write-Host
     }
}

<#
.SYNOPSIS
    Simulates a paste operation by sending keystrokes to the active window.

.DESCRIPTION
    The FakePaste function simulates a paste operation by sending the specified value as keystrokes to the active window.

.PARAMETER Value
    Specifies the value to be pasted. This parameter is mandatory and accepts input from the pipeline.

.EXAMPLE
    PS C:\> "Hello, World!" | FakePaste
    Sends the string "Hello, World!" as keystrokes to the active window.

.NOTES
    This function requires the System.Windows.Forms assembly to be loaded.
#>
function FakePaste {
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [string]$Value
    )
    [void] [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") 
    [System.Windows.Forms.SendKeys]::SendWait($Value)
}

<#
.SYNOPSIS
Writes the properties of an object to the console.

.DESCRIPTION
The Write-Object function writes the properties of an object to the console using the Format-List cmdlet. It can be used to display specific properties or all properties of an object.

.PARAMETER InputObject
Specifies the object whose properties will be written to the console. This parameter is mandatory and accepts input from the pipeline.

.PARAMETER All
Indicates whether all properties of the object should be displayed. By default, only the default properties are displayed.

.EXAMPLE
$object = Get-Process
$object | Write-Object

This example retrieves a process object using the Get-Process cmdlet and pipes it to the Write-Object function. The properties of the process object are displayed on the console.

.EXAMPLE
$object = Get-Process
$object | Write-Object -All

This example retrieves a process object using the Get-Process cmdlet and pipes it to the Write-Object function with the -All parameter. All properties of the process object are displayed on the console.

#>
function Write-Object {
    param (
        [Parameter(Mandatory, ValueFromPipeline)]
        [Alias("Object")]
        [object]$InputObject,

        [switch]$All
    )

    $formatListParams = @{
        InputObject = $InputObject
    }

    if ($All) {
        $formatListParams['Property'] = '*'
    }

    Format-List @formatListParams
}

<#
.SYNOPSIS
Creates a custom PowerShell object.

.DESCRIPTION
The Object function creates a custom PowerShell object using the input object provided.

.PARAMETER InputObject
Specifies the input object to be used for creating the custom PowerShell object.

.EXAMPLE
$myObject = Object @{
    Name = "John"
    Age = 30
}

This example creates a custom PowerShell object named $myObject with properties Name and Age.

.INPUTS
[string]
The function accepts a string as the input object.

.OUTPUTS
[psobject]
The function returns a custom PowerShell object.

#>
function Object {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory, ValueFromPipeline, Position=0)]
        [string] $InputObject
    )

    $object = New-Object psobject -Property $InputObject
    return $object
}

$BoxChars = @{
    Corner = @{
        TopLeft = '┌'
        TopRight = '┐'
        BottomLeft = '└'
        BottomRight = '┘'
        Rounded = @{
            TopLeft = '╭'
            TopRight = '╮'
            BottomLeft = '╰'
            BottomRight = '╯'
        }
    
    }
    Horizontal = '─'
    Vertical = '│'
    Cap = @{
        Left = '╴'
        Right = '╶'
        Top = '╵'
        Bottom = '╷'
    }
}

$COLORS = @{
    DARKRED = "$ESC[31m"
    DARKGREEN = "$ESC[32m"
    DARKYELLOW = "$ESC[33m"
    DARKBLUE = "$ESC[34m"
    DARKMAGENTA = "$ESC[35m"
    DARKCYAN = "$ESC[36m"
    GRAY = "$ESC[37m"
    DARKGRAY = "$ESC[90m"
    RED = "$ESC[91m"
    GREEN = "$ESC[92m"
    YELLOW = "$ESC[93m"
    BLUE = "$ESC[94m"
    MAGENTA = "$ESC[95m"
    CYAN = "$ESC[96m"
    WHITE = "$ESC[97m"
    DARKWHITE = "$ESC[37m" # not a real color
    BLACK = "$ESC[90m"
    DARKBLACK = "$ESC[90m"
    # Bright colors (just the same as the normal colors)
    BRIGHTRED = "$ESC[91m"
    BRIGHTGREEN = "$ESC[92m"
    BRIGHTYELLOW = "$ESC[93m"
    BRIGHTBLUE = "$ESC[94m"
    BRIGHTMAGENTA = "$ESC[95m"
    BRIGHTCYAN = "$ESC[96m"
    BRIGHTWHITE = "$ESC[97m"
    BRIGHTBLACK = "$ESC[37m"
}

<#
.SYNOPSIS
Draws a box with text in the console.

.DESCRIPTION
The DrawBox function draws a box with text inside it in the console. The box can have a label, customizable colors, padding, margins, and more.

.PARAMETER Text
The text to display inside the box.

.PARAMETER Label
The label text to display at the top of the box.

.PARAMETER Width
The width of the box in characters.

.PARAMETER Height
The height of the box in characters.

.PARAMETER Padding
The padding inside the box in characters.

.PARAMETER PaddingX
The horizontal padding inside the box in characters.

.PARAMETER PaddingY
The vertical padding inside the box in characters.

.PARAMETER MarginX
The horizontal margin outside the box in characters.

.PARAMETER MarginY
The vertical margin outside the box in characters.

.PARAMETER BorderColor
The color of the box border. Default is Gray.

.PARAMETER TextColor
The color of the text inside the box. Default is Gray.

.PARAMETER AutoMargin
Automatically centers the box horizontally in the console window.

.PARAMETER Justify
Justifies the text inside the box.

.PARAMETER Rounded
Draws the box with rounded corners.

.EXAMPLE
DrawBox -Text "Hello, World!" -Width 20 -Height 5 -BorderColor Green

Draws a green box with the text "Hello, World!" centered inside.

.EXAMPLE
DrawBox -Text "This is a very long line of text that will wrap inside the box." -Width 30 -AutoMargin -Rounded -BorderColor DarkCyan -TextColor Yellow

Draws a rounded box with a dark cyan border and yellow text that is automatically centered in the console. The text wraps inside the box.

.NOTES
This function uses characters from the BoxChars hashtable to draw the box.
#>
function DrawBox {
    param (
        [string]$Text,
        [string]$Label,
        [int]$Width,
        [int]$Height,
        [int]$Padding,
        [int]$PaddingX,
        [int]$PaddingY,
        [int]$MarginX,
        [int]$MarginY,
        [System.ConsoleColor]$BorderColor,
        [System.ConsoleColor]$TextColor,
        [switch]$AutoMargin,
        [switch]$Justify,
        [switch]$Rounded
    )

    # Add extra chars to label
    if ($Label) {
        $Label = "$($BoxChars.Cap.Left)$Label$($BoxChars.Cap.Right)"
    }

    if (!$BorderColor) {
        $BorderColor = 'Gray'
    }

    if (!$TextColor) {
        $TextColor = 'Gray'
    }

    # Calculate padding
    if (!$PaddingX) {
        $PaddingX = $Padding
    }

    if (!$PaddingY) {
        $PaddingY = $Padding
    }

    # Adjust width and height to fit text
    if ($Text) {
        $SplitText = $Text -split "`n"

        $MaxLength = 0

        for ($i = 0; $i -lt $SplitText.Length; $i++) {
            $SplitText[$i] = (" " * $PaddingX) + $SplitText[$i] + (" " * $PaddingX)
            $MaxLength = [Math]::Max($MaxLength, $SplitText[$i].Length)
        }
        if (!$Width) {
            $Width = $MaxLength
        }
        if (!$Height) {
            $Height = $SplitText.Length + ($PaddingY * 2)
        }
        
        if (!$Justify) {
            for ($i = 0; $i -lt $SplitText.Length; $i++) {
                $LengthDiff = ($MaxLength - $SplitText[$i].Length) / 2
                $SplitText[$i] = (" " * $LengthDiff) + $SplitText[$i]
            }
        }
    }

    if ($Label.Length % 2 -ne 0 -xor $Width % 2 -ne 0) {
        $Label += $BoxChars.Horizontal
    }

    # Make sure width is not less than label
    if ($Width -lt $label.Length) {
        $Width = $Label.Length
    }

    if ($AutoMargin) {
        $MarginX = $Host.UI.RawUI.BufferSize.Width / 2 - $Width / 2
    }

    # Generate padding if height is larger than text height
    if ($Height -gt $SplitText.Length) {
        [double]$PaddingY = ($Height - $SplitText.Length) / 2
    }

    $Corner = if ($Rounded) {
        $BoxChars.Corner.Rounded
    } else {
        $BoxChars.Corner
    }

    $LabelPos = $Width / 2 - $Label.Length / 2

    Write-Host ("`n" * $MarginY) -NoNewline

    Write-Host (" " * $MarginX) -NoNewline
    Write-Host $Corner.TopLeft -ForegroundColor $BorderColor -NoNewline
    Write-Host ([string]$BoxChars.Horizontal * [Math]::Floor($LabelPos)) -ForegroundColor $BorderColor -NoNewline
    Write-Host $Label -ForegroundColor $BorderColor -NoNewline
    Write-Host ([string]$BoxChars.Horizontal * [Math]::Ceiling($LabelPos)) -ForegroundColor $BorderColor -NoNewline
    Write-Host $Corner.TopRight -ForegroundColor $BorderColor

    for ($i = 0; $i -lt $Height; $i++) {
        Write-Host (" " * $MarginX) -NoNewline
        Write-Host $BoxChars.Vertical -ForegroundColor $BorderColor -NoNewline
        if ($i -lt [Math]::Floor($PaddingY) -or $i -ge [Math]::Floor($Height - $PaddingY)) {
            Write-Host (" " * $Width) -NoNewline
        } else {
            for ($j = 0; $j -lt $Width; $j++) {
                # Use null coaslescing if available, but stupid PowerShell 5.1 doesn't recognize
                $char = if ($SplitText[[Math]::floor($i - $PaddingY)][$j]) {
                    $SplitText[[Math]::floor($i - $PaddingY)][$j]
                } else {
                    " "
                }

                Write-Host $char -ForegroundColor $TextColor -NoNewline
            }
        }
        Write-Host $BoxChars.Vertical -ForegroundColor $BorderColor
    }

    Write-Host (" " * $MarginX) -NoNewline
    Write-Host $Corner.BottomLeft -ForegroundColor $BorderColor -NoNewline
    Write-Host ([string]$BoxChars.Horizontal * $Width) -ForegroundColor $BorderColor -NoNewline
    Write-Host $Corner.BottomRight -ForegroundColor $BorderColor

    Write-Host ("`n" * $MarginY) -NoNewline
}

# wrapper function for SetEnvironmentVariable
function Set-EnvironmentVariable {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string] $Name,

        [Parameter(Mandatory)]
        [string] $Value,

        [Parameter()]
        [string] $Scope = "Process"
    )

    [Environment]::SetEnvironmentVariable($Name, $Value, $Scope)
}

<#
.SYNOPSIS
Opens the target location of a shortcut file.

.DESCRIPTION
The Open-Shortcut function opens the target location of a specified shortcut file (.lnk) using the Windows Script Host object model. It resolves the full path of the shortcut file, retrieves the target path from the shortcut object, and then sets the current location to the target path.

.PARAMETER ShortcutPath
The path to the shortcut file (.lnk). This parameter is mandatory and must be provided.

.EXAMPLE
Open-Shortcut C:\Users\MyUser\Desktop\MyShortcut.lnk

Opens the target location of the 'MyShortcut.lnk' file on the desktop.

.EXAMPLE
Get-ChildItem *.lnk | Open-Shortcut

Opens the target locations of all shortcut files in the current directory.

.NOTES
This function requires the Windows Script Host object model (WScript.Shell) to read and interact with shortcut files.

The function releases the COM object used to create the shortcut object to avoid potential memory leaks.

.LINK
https://learn.microsoft.com/en-us/windows/win32/ipc/shorthuts

#>
function Open-Shortcut {
	param
	(
	    [Parameter(Mandatory, Position=0)]
	    [string]$ShortcutPath
	)
	
    if (-not (Test-Path $ShortcutPath)) {
    	Write-Warning "$ShortcutPath does not exist."
    	return
    }

    $ShortcutPath = Resolve-Path $ShortcutPath
    
	$shell = New-Object -ComObject WScript.Shell
	$shortcut = $shell.CreateShortcut($ShortcutPath)
	$targetPath = $shortcut.TargetPath
	
	Set-Location $targetPath

	[System.Runtime.InteropServices.Marshal]::ReleaseComObject($shell) | Out-Null
}