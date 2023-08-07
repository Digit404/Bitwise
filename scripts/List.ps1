class Script {
    static $scripts = @()
    [string] $Name
    [string] $Description

    Script ([string]$name, [string]$description) {
        if (-not [Script]::scripts) {
            [Script]::scripts = @()
        }
        $this.Name = $name
        $this.Description = $description

        [Script]::scripts += $this
    }
}

Write-Host "Here is a list of scripts available:"

[Script]::new("FabricSMPInstaller.ps1", "A simple Minecraft script to download and install fabric and many mods for an SMP server.")