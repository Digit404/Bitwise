class Script {
    static $scripts = @()
    [string] $Name
    [string] $Description

    Script ([string]$name, [string]$description) {
        $this.Name = $name
        $this.Description = $description

        [Script]::scripts += $this
    }
}

[Script]::new("FabricSMPInstaller.ps1", "A simple Minecraft script to download and install fabric and many mods for an SMP server.")  | Out-Null

Write-Host "Here is a list of scripts available:"

Write-Host ([Script]::scripts | Format-Table | Out-String) -ForegroundColor Blue

Write-Host "You can run any of these scripts using the powershell command ""iwr www.bitwise.live/scrips/{script name}.ps1 | iex""`n"