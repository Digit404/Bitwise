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

function Download-Video {
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