function ExtractAudio {
	param (
		[string]$Link,
		[string]$Path,
		[string]$Name,
		[string]$Artist,
		[string]$Format = "mp3"
	)

	if (!(Test-Path $Path)) {
		$Path = (Join-Path $env:USERPROFILE "\Music\")
	}

	if ($Link -match "(.+?)\?si=.+?") {
		$Link = $Matches[1]
	}

	if (-not [string]::IsNullOrWhiteSpace($Name)) {
		yt-dlp $Link -x -o "$Name.$Format"

		$metadataArgs = "-metadata title=`"$Name`""

		if (-not [string]::IsNullOrWhiteSpace($Artist)) {
			$metadataArgs += " -metadata artist=`"$Artist`""
		}

		$ffmpegCommand = "ffmpeg -i `"$Name.$Format`" $metadataArgs -codec copy `"temp.$Format`""

		Invoke-Expression $ffmpegCommand
		
		Move-Item "temp.$Format" "$Name.$Format" -Force
	} else {
		yt-dlp $Link -x
	}
}

function DownloadVideo {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Url,

        [Parameter()]
        [switch]$AudioOnly,

        [Parameter()]
        [ValidateSet('mp4', 'flv', 'webm', 'mkv', 'mp3', 'ogg', 'm4a', 'opus', 'wav')]
        [string]$Format,

        [Parameter()]
        [ValidateRange(1, 10)]
        [int]$VerbosityLevel = 1,

        [Parameter()]
        [switch]$DownloadSubtitles,

        [Parameter()]
        [switch]$EmbedSubtitles,

        [Parameter()]
        [string]$OutputTemplate = "%(title)s.%(ext)s",

        [Parameter()]
        [switch]$NoOverwrites,

        [Parameter()]
        [switch]$ExtractAudio,

        [Parameter()]
        [ValidateSet('best', 'worst', 'bestaudio', 'worstaudio', 'bestvideo', 'worstvideo')]
        [string]$Quality,

        [Parameter()]
        [switch]$DownloadArchive,

        [Parameter()]
        [string]$ArchiveFile,

        [Parameter()]
        [switch]$LimitRate,

        [Parameter()]
        [string]$RateLimit
    )

    $arguments = @($Url)

    if ($AudioOnly) {
        $arguments += "-x"
    }

    if ($Format) {
        $arguments += "--format $Format"
    }

    switch ($VerbosityLevel) {
        1 { $arguments += "-q" }
        10 { $arguments += "-v" }
        Default { $arguments += "-v" * $VerbosityLevel }
    }

    if ($DownloadSubtitles) {
        $arguments += "--write-sub"
    }

    if ($EmbedSubtitles) {
        $arguments += "--embed-subs"
    }

    if ($NoOverwrites) {
        $arguments += "--no-overwrites"
    }

    if ($ExtractAudio) {
        $arguments += "--extract-audio"
    }

    if ($Quality) {
        $arguments += "--quality $Quality"
    }

    if ($DownloadArchive) {
        $arguments += "--download-archive"
        if ($ArchiveFile) {
            $arguments += $ArchiveFile
        }
    }

    if ($LimitRate -and $RateLimit) {
        $arguments += "--limit-rate $RateLimit"
    }

    if ($OutputTemplate) {
        $arguments += "--output $OutputTemplate"
    }

    yt-dlp.exe $arguments
}

function Update-Metadata {
    param(
        [string]$FilePath,
        [string]$Title,
        [string]$Artist,
        [string]$Album,
        [string]$Track,
        [string]$Genre,
        [string]$Date,
        [string]$Composer,
        [string]$Copyright,
        [string]$Description,
        [string]$Comment,
        [string]$AlbumArtist,
        [string]$Disc,
        [string]$Publisher,
        [string]$EncodedBy,
        [string]$Language
    )

    $metadataArgs = @()

    if ($Title) { $metadataArgs += "-metadata title=`"$Title`"" }
    if ($Artist) { $metadataArgs += "-metadata artist=`"$Artist`"" }
    if ($Album) { $metadataArgs += "-metadata album=`"$Album`"" }
    if ($Track) { $metadataArgs += "-metadata track=`"$Track`"" }
    if ($Genre) { $metadataArgs += "-metadata genre=`"$Genre`"" }
    if ($Date) { $metadataArgs += "-metadata date=`"$Date`"" }
    if ($Composer) { $metadataArgs += "-metadata composer=`"$Composer`"" }
    if ($Copyright) { $metadataArgs += "-metadata copyright=`"$Copyright`"" }
    if ($Description) { $metadataArgs += "-metadata description=`"$Description`"" }
    if ($Comment) { $metadataArgs += "-metadata comment=`"$Comment`"" }
    if ($AlbumArtist) { $metadataArgs += "-metadata album_artist=`"$AlbumArtist`"" }
    if ($Disc) { $metadataArgs += "-metadata disc=`"$Disc`"" }
    if ($Publisher) { $metadataArgs += "-metadata publisher=`"$Publisher`"" }
    if ($EncodedBy) { $metadataArgs += "-metadata encoded_by=`"$EncodedBy`"" }
    if ($Language) { $metadataArgs += "-metadata language=`"$Language`"" }

    $tempFile = [System.IO.Path]::GetTempFileName() + ".mp3"
    $ffmpegCommand = "ffmpeg -i `"$FilePath`" $($metadataArgs -join ' ') -codec copy `"$tempFile`""
    Invoke-Expression $ffmpegCommand

    Move-Item -Force $tempFile $FilePath
}

function Compress-Video {
    param(
        [Parameter(Mandatory,ValueFromPipeline)]
        [Alias("Path","InputVideo","Input","InputPath")]
        [string]$InputFile,

        [Parameter(Mandatory)]
        [Alias("MB","TargetSize","SizeMB","Size")]
        [int]$TargetSizeMB,

        [Parameter(Mandatory)]
        [Alias("Output","OutputVideo","OutVideo","OutputFile","OutputPath")]
        [string]$OutFile
    )

    # Calculate duration in seconds
    $durationSec = & ffmpeg -i $videoPath 2>&1 | Select-String "Duration" | ForEach-Object {
        $_ -replace ".*Duration: (\d+):(\d+):(\d+).*", '$1 $2 $3' -split ' ' | 
        ForEach-Object { [int]$_ } | 
        ForEach-Object -Begin { $totalSec = 0 } -Process { $totalSec = $totalSec * 60 + $_ } -End { $totalSec }
    }

    # Calculations for video bit rate
    $targetSizeKB = $targetSizeMB * 1024
    $audioBitRateKbps = 128 # Assuming an audio bitrate, adjust as necessary
    $videoBitRateKbps = ($targetSizeKB * 8 - $audioBitRateKbps * $durationSec) / $durationSec

    # FFMPEG commands for two-pass encode
    $ffmpegCmdPass1 = "ffmpeg -y -i `"$videoPath`" -c:v libx264 -b:v ${videoBitRateKbps}k -pass 1 -an -f mp4 NUL"
    $ffmpegCmdPass2 = "ffmpeg -i `"$videoPath`" -c:v libx264 -b:v ${videoBitRateKbps}k -pass 2 -c:a aac -b:a ${audioBitRateKbps}k `"$outputPath`""

    # Execute the two-pass encoding
    Write-Host "Starting first pass..."
    Invoke-Expression $ffmpegCmdPass1
    Write-Host "Starting second pass..."
    Invoke-Expression $ffmpegCmdPass2

    Write-Host "Encoding complete. File saved to $outputPath"

    # Clean up: Delete the log files generated by the two-pass process
    Remove-Item ffmpeg2pass-0.log*
    Write-Host "Clean-up complete. Temporary files removed."
}