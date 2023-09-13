
# Install some programs
choco install steam
choco install opera-gx
choco install nordvpn
choco install nanazip
choco install nordlocker
choco install vscode
choco install micro
choco install python3
choco install nodejs

# WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
