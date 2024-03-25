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
        [Parameter(Mandatory=$true)]
        [System.Object] $InputObject
    )

    $propertiesList = Get-Member -InputObject $InputObject -MemberType Properties

    $properties = $propertiesList.Foreach({
        $InputObject.$($_.Name)
    })

    return $properties
}

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