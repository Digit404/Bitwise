function Move-Cursor {
    param (
        [int]$X,
        [int]$Y
    )

    $cursorPos = $Host.UI.RawUI.CursorPosition
    $pos = New-Object System.Management.Automation.Host.Coordinates

    $pos.X = $X + $cursorPos.X
    $pos.Y = $Y + $cursorPos.Y

    $Host.UI.RawUI.CursorPosition = $pos
}

function Set-Cursor {
    param (
        [int]$X,
        [int]$Y
    )

    $cursorPos = $Host.UI.RawUI.CursorPosition
    $pos = New-Object System.Management.Automation.Host.Coordinates

    $pos.X = $X ?? $cursorPos.X
    $pos.Y = $Y ?? $cursorPos.Y

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