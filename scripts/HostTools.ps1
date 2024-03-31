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