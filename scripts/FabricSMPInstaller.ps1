Write-Host "Part 1. Installing Iris and Fabric."

$ProgressPreference = "SilentlyContinue"

$confirm = Read-Host "Install Iris and Fabric? Required. (y/n)"

if ($confirm -eq "y" -or $confirm -eq "Y") {
    Write-Host "1. Select Fabric install for 1.20.1 then press install and close the program when complete."

    $irisJar = "iris-installer.jar"

    Write-Host "Downloading $($irisJar)"

    Invoke-WebRequest "https://github.com/IrisShaders/Iris-Installer/releases/download/3.0.2/Iris-Installer-3.0.2.jar" -OutFile $irisJar

    java -jar $irisJar -Wait

    Start-Sleep -Seconds 1

    Remove-Item $irisJar
}

Write-Host "Creating folders..."

$appDataPath = [System.Environment]::GetFolderPath('ApplicationData')
$minecraftPath = Join-Path $appDataPath ".minecraft/"
$profilePath = Join-Path $minecraftPath "profiles/Fabric SMP/"
$resourcepacksPath = Join-Path $profilePath "resourcepacks/" 
$modsPath = Join-Path $profilePath "mods/" 

New-Item -ItemType Directory -Path $profilePath -Force | Out-Null
New-Item -ItemType Directory -Path $resourcepacksPath -Force | Out-Null
New-Item -ItemType Directory -Path $modsPath -Force | Out-Null

$confirm = Read-Host ("Install a cool-ass texturepack with quality of life improvements? Optional (y/n)")

if ($confirm -eq "y" -or $confirm -eq "Y") {

    $vanillaTweaks = "VanillaTweaks_1.20.zip"

    Write-Host "Downloading $($vanillaTweaks)"

    Invoke-WebRequest "https://cdn.discordapp.com/attachments/1061066185778667661/1137873427965939732/VanillaTweaks_1.20.zip" -OutFile $(Join-Path $resourcepacksPath $vanillaTweaks)
}

Write-Host "Downloading mods..."

class Mod {
    static $mods = @()

    [string]$URL
    [string]$modName

    Mod([string]$URL) {
        $this.URL = $URL
        $this.modName = [System.Uri]::UnescapeDataString($URL.Split("/")[-1])

        [Mod]::mods += $this
    }

    [void] download() {
        if (Test-path $(Join-Path $script:modsPath $this.modName)) {
            Write-Host "Mod found already, skipping..."
        }
        else {
            Invoke-WebRequest $this.URL -OutFile $(Join-Path $script:modsPath $this.modName) | Out-Null
        }
    }
}

$modList = 
"https://cdn.modrinth.com/data/zV5r3pPn/versions/M8d2bZuk/3dskinlayers-fabric-1.5.4-mc1.20.1.jar",
"https://cdn.modrinth.com/data/3ufwT9JF/versions/IfdLtruQ/ad_astra-fabric-1.20.1-1.15.3.jar",
"https://cdn.modrinth.com/data/EsAfCjCV/versions/CxnVG86Y/appleskin-fabric-mc1.20-2.5.0.jar",
"https://cdn.modrinth.com/data/lhGA9TYQ/versions/Sbew3kXe/architectury-9.1.12-fabric.jar",
"https://cdn.modrinth.com/data/BgNRHReB/versions/bccqbyya/bclib-3.0.13.jar",
"https://cdn.modrinth.com/data/gc8OEnCC/versions/otd2erfL/better-end-4.0.10.jar",
"https://cdn.modrinth.com/data/Lvv4SHrK/versions/1.3.0/betterthanmending-1.3.0.jar",
"https://cdn.modrinth.com/data/2u6LRnMa/versions/YgOh7n9M/botarium-fabric-1.20.1-2.2.0.jar",
"https://cdn.modrinth.com/data/9s6osm5g/versions/s7VTKfLA/cloth-config-11.1.106-fabric.jar",
"https://cdn.modrinth.com/data/cl223EMc/versions/FGDF6byY/cristellib-1.1.2-fabric.jar",
"https://cdn.modrinth.com/data/6FtRfnLg/versions/gbxieggJ/do-a-barrel-roll-3.0.1%2B1.20-fabric.jar",
"https://cdn.modrinth.com/data/8DfbfASn/versions/65GY9WAD/DungeonsArise-1.20.1-2.1.56-fabric-beta.jar",
"https://cdn.modrinth.com/data/ZcR9weSm/versions/rOBAdNim/dynamiccrosshair-7.0.4%2B1.20-fabric.jar",
"https://cdn.modrinth.com/data/rUgZvGzi/versions/OcHlWpeQ/eating-animation-1.9.4%2B1.20.jar",
"https://cdn.modrinth.com/data/mSQF1NpT/versions/6uCj1VmZ/elytraslot-fabric-6.3.0%2B1.20.1.jar",
"https://cdn.modrinth.com/data/fRiHVvU7/versions/4mx41ehI/emi-1.0.18%2B1.20.1%2Bfabric.jar",
"https://cdn.modrinth.com/data/k2ZPuTBm/versions/1.0.0/Essential-fabric_1-19.jar",
"https://cdn.modrinth.com/data/P7dR8mSH/versions/XheZ9iGK/fabric-api-0.86.1%2B1.20.1.jar",
"https://cdn.modrinth.com/data/Ha28R6CL/versions/s10JMAtS/fabric-language-kotlin-1.10.8%2Bkotlin.1.9.0.jar",
"https://cdn.modrinth.com/data/WhbRG4iK/versions/8qK6ANpJ/fallingleaves-1.15.2%2B1.20.1.jar",
"https://cdn.modrinth.com/data/x3HZvrj6/versions/TuRYZ1ou/immersive_aircraft-0.5.2%2B1.20.1-fabric.jar",
"https://cdn.modrinth.com/data/eE2Db4YU/versions/Waf0D48D/immersive_armors-1.6.1%2B1.20.1-fabric.jar",
"https://cdn.modrinth.com/data/Orvt0mRa/versions/HIQfyNd3/indium-1.0.23%2Bmc1.20.1.jar",
"https://cdn.modrinth.com/data/lfHFW1mp/versions/NXNhbImz/journeymap-1.20.1-5.9.12-fabric.jar",
"https://cdn.modrinth.com/data/EFtixeiF/versions/Mk1aTgPH/levelz-1.4.10.jar",
"https://cdn.modrinth.com/data/gvQqBUqZ/versions/ZSNsJrPI/lithium-fabric-mc1.20.1-0.11.2.jar",
"https://cdn.modrinth.com/data/7tKn1fLd/versions/kD4h9ccY/mob-captains-v2.1.2.jar",
"https://cdn.modrinth.com/data/mOgUt4GM/versions/eTCL1uh8/modmenu-7.2.1.jar",
"https://cdn.modrinth.com/data/Ins7SzzR/versions/rQU2ZCZX/Neat-1.20-35-FABRIC.jar",
"https://cdn.modrinth.com/data/nU0bVIaL/versions/tzz6fEoj/Patchouli-1.20.1-81-FABRIC.jar",
"https://cdn.modrinth.com/data/rcTfTZr3/versions/FMF3yzCR/PresenceFootsteps-1.9.0.jar",
"https://cdn.modrinth.com/data/M1953qlQ/versions/nVDWZ9N7/resourcefulconfig-fabric-1.20.1-2.1.0.jar",
"https://cdn.modrinth.com/data/G1hIVOrD/versions/lmvJ0Hcp/resourcefullib-fabric-1.20.1-2.1.9.jar",
"https://cdn.modrinth.com/data/DjLobEOy/versions/ESRfqjkz/Towns-and-Towers-1.11-Fabric%2BForge.jar",
"https://cdn.modrinth.com/data/5aaWibi9/versions/e563ycts/trinkets-3.7.1.jar",
"https://cdn.modrinth.com/data/tA7mQv7R/versions/VeZX2TRB/ultris-v5.6.9b.jar",
"https://cdn.modrinth.com/data/rI0hvYcd/versions/BipSJ05N/visuality-0.7.0%2B1.20.jar",
"https://cdn.modrinth.com/data/kYuIpRLv/versions/9ppedk6Z/waveycapes-fabric-1.4.0-mc1.20.jar",
"https://cdn.modrinth.com/data/1eAoo2KR/versions/CgwTUAR2/yet-another-config-lib-fabric-3.1.0%2B1.20.jar",
"https://cdn.modrinth.com/data/VzAGdu9D/versions/4osKFK3P/things-0.3.1%2B1.20.jar",
"https://cdn.modrinth.com/data/JrIYhb1P/versions/wPdj2uLD/CosmeticArmor-1.20-1.6.0.jar",
"https://cdn.modrinth.com/data/ccKDOlHs/versions/m23n3uIM/owo-lib-0.11.1%2B1.20.jar",
"https://cdn.modrinth.com/data/yBW8D80W/versions/Vsx4I8Np/lambdynamiclights-2.3.1%2B1.20.1.jar",
"https://cdn.modrinth.com/data/AANobbMI/versions/hiO9bwqc/sodium-fabric-mc1.20.1-0.5.0.jar",
"https://cdn.modrinth.com/data/yUBXc3AH/versions/soKX5h3N/libz-1.0.1.jar"


[Mod]::mods = @()

foreach ($url in $modList) {
    [void][Mod]::new($url)
}

# Get the total number of mods in the $mods list
$totalMods = [Mod]::mods.Count

# Use a regular foreach loop to access and work with the instances in the $mods list
foreach ($mod in [Mod]::mods) {
    $currentIndex = [Mod]::mods.IndexOf($mod) + 1
    Write-Host "($currentIndex of $totalMods) Downloading $($mod.modName)"
    $mod.download()
}

$ProgressPreference = "Continue"  # Reset progress preference back to default

Write-Host "Part 2. Setting up the installation."

$minecraftLancher = "C:\XboxGames\Minecraft Launcher\Content\Minecraft.exe"

if (Test-Path $minecraftLancher) {
    Write-Host "Lanching Minecraft Lancher..."
    Start-Process $minecraftLancher
}
else {
    Write-Host "Unable to find Minecraft lancher, please launch it."
}

$confirm = Read-Host "Copy options from main profile? (y/n)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    Copy-Item -Path $(Join-Path $minecraftPath "options.txt") -Destination $(Join-Path $profilePath "options.txt")
}

Write-Host "1. Create new installation"
Write-Host "2. Select ""release fabric-loader-...-1.20.1"" under version."
Write-Host "3. Change the installation location to .minecraft\profiles\Fabric SMP"
Write-Host "4. Launch the installation"

Read-Host "Done. Press enter to continue..."