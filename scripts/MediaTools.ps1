<#
.SYNOPSIS
Extracts audio from a given link and saves it to a specified path.

.DESCRIPTION
The ExtractAudio function is used to download audio from a given link using yt-dlp and save it to a specified path. It supports specifying the name, artist, and format of the audio file. If the path is not provided, it defaults to the user's Music folder. If the name is not provided, the audio is downloaded without a name.

.PARAMETER Link
The link of the audio to be downloaded.

.PARAMETER Path
The path where the audio file will be saved. If not provided, it defaults to the user's Music folder.

.PARAMETER Name
The name of the audio file. If not provided, the audio is downloaded without a name.

.PARAMETER Artist
The artist of the audio file. This is an optional parameter.

.PARAMETER Format
The format of the audio file. Defaults to "mp3" if not provided.

.EXAMPLE
ExtractAudio -Link "https://www.example.com/audio" -Path "C:\Music" -Name "MySong" -Artist "John Doe" -Format "mp3"
This example extracts audio from the given link and saves it as "MySong.mp3" in the "C:\Music" folder with the artist metadata set to "John Doe".

.EXAMPLE
ExtractAudio -Link "https://www.example.com/audio"
This example extracts audio from the given link and saves it without a name in the user's Music folder.

#>
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

<#
.SYNOPSIS
Downloads a video from a given URL using yt-dlp.

.DESCRIPTION
The DownloadVideo function downloads a video from a specified URL using yt-dlp, a command-line program to download videos from YouTube and other sites. It provides various options to customize the download process, such as downloading audio only, specifying the format, setting the verbosity level, downloading subtitles, embedding subtitles, limiting the download rate, and more.

.PARAMETER Url
The URL of the video to download.

.PARAMETER AudioOnly
Specifies whether to download only the audio of the video. By default, it is set to False.

.PARAMETER Format
Specifies the format of the downloaded video. Valid values are 'mp4', 'flv', 'webm', 'mkv', 'mp3', 'ogg', 'm4a', 'opus', and 'wav'.

.PARAMETER VerbosityLevel
Specifies the verbosity level of the download process. Valid values are 1 to 10. The default value is 1.

.PARAMETER DownloadSubtitles
Specifies whether to download subtitles for the video. By default, it is set to False.

.PARAMETER EmbedSubtitles
Specifies whether to embed subtitles into the video file. By default, it is set to False.

.PARAMETER OutputTemplate
Specifies the output template for the downloaded video file. The default value is "%(title)s.%(ext)s".

.PARAMETER NoOverwrites
Specifies whether to skip downloading if the file already exists. By default, it is set to False.

.PARAMETER ExtractAudio
Specifies whether to extract audio from the video. By default, it is set to False.

.PARAMETER Quality
Specifies the quality of the video to download. Valid values are 'best', 'worst', 'bestaudio', 'worstaudio', 'bestvideo', and 'worstvideo'.

.PARAMETER DownloadArchive
Specifies whether to download videos from the archive file. By default, it is set to False.

.PARAMETER ArchiveFile
Specifies the path to the archive file containing the list of downloaded videos.

.PARAMETER LimitRate
Specifies whether to limit the download rate. By default, it is set to False.

.PARAMETER RateLimit
Specifies the download rate limit in bytes per second.

.EXAMPLE
DownloadVideo -Url "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -AudioOnly -Format "mp3" -VerbosityLevel 2 -DownloadSubtitles -OutputTemplate "MyVideo.%(ext)s"
Downloads the audio of the video from the specified URL in MP3 format, sets the verbosity level to 2, downloads subtitles, and saves the file as "MyVideo.mp3".

#>
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

<#
.SYNOPSIS
Updates the metadata of an audio file.

.DESCRIPTION
The Update-Metadata function allows you to update the metadata of an audio file, such as the title, artist, album, track number, genre, etc. It uses FFmpeg to modify the metadata and saves the changes to the original file.

.PARAMETER FilePath
The path to the audio file that you want to update the metadata for.

.PARAMETER Title
The new title of the audio file.

.PARAMETER Artist
The new artist of the audio file.

.PARAMETER Album
The new album of the audio file.

.PARAMETER Track
The new track number of the audio file.

.PARAMETER Genre
The new genre of the audio file.

.PARAMETER Date
The new date of the audio file.

.PARAMETER Composer
The new composer of the audio file.

.PARAMETER Copyright
The new copyright information of the audio file.

.PARAMETER Description
The new description of the audio file.

.PARAMETER Comment
The new comment of the audio file.

.PARAMETER AlbumArtist
The new album artist of the audio file.

.PARAMETER Disc
The new disc number of the audio file.

.PARAMETER Publisher
The new publisher of the audio file.

.PARAMETER EncodedBy
The new encoded by information of the audio file.

.PARAMETER Language
The new language of the audio file.

.EXAMPLE
Update-Metadata -FilePath "C:\Music\song.mp3" -Title "My Song" -Artist "John Doe" -Album "My Album" -Track "1" -Genre "Pop"

This example updates the metadata of the audio file "C:\Music\song.mp3" with the specified values for title, artist, album, track number, and genre.

.NOTES
- This function requires FFmpeg to be installed on your system.
- The original audio file will be overwritten with the updated metadata.
#>
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

<#
.SYNOPSIS
Compresses a video file using FFmpeg.

.DESCRIPTION
The Compress-Video function takes an input video file and compresses it using FFmpeg. It offers three methods of compression: by target size, by target bitrate, or by quality. The function uses a two-pass encoding process for optimal results.

.PARAMETER InputFile
Specifies the path to the input video file. This parameter is mandatory and can accept pipeline input.

.PARAMETER TargetSizeMB
Specifies the target size of the output video in megabytes. This parameter is part of the 'Size' parameter set.

.PARAMETER TargetBitRateKbps
Specifies the target bitrate of the output video in kilobits per second. This parameter is part of the 'BitRate' parameter set.

.PARAMETER Quality
Specifies the quality level for the output video. This parameter is part of the 'Quality' parameter set and is the default parameter. Default value is 1.

A quality value of 1 was chosen as a balanced setting, aiming to provide a good compromise between 
video quality and file size for most scenarios. It corresponds to a base bitrate of 4000 Kbps 
(or 500 KB/s) per megapixel at 60 fps, which translates to approximately 8.33 KB per megapixel per frame.

The actual bitrate scales linearly with the quality value, resolution, and frame rate. Higher quality 
values result in better video quality but larger file sizes, while lower values produce smaller files 
at the cost of quality.

For example, for a 1080p (2.07 megapixels) video at 30 fps:
- Quality 1.0: Balanced setting (default)--would result in a bitrate of about 4,140 Kbps
- Quality 2.0: High quality, larger file size--would result in a bitrate of about 8,280 Kbps
- Quality 0.5: Lower quality, smaller file size--would result in a bitrate of about 2,070 Kbps

Users can adjust the quality value to fine-tune the balance between video quality and file size 
according to their specific needs.

.PARAMETER OutDir
Specifies the output directory for the compressed video. If not specified, the current working directory is used.

.PARAMETER TargetFPS
Specifies the target frame rate for the output video. If not specified, the original frame rate is maintained.

.PARAMETER AudioBitRateKbps
Specifies the audio bitrate in kilobits per second. Default value is 128Kbps.

.EXAMPLE
Compress-Video -InputFile "C:\Videos\input.mp4" -Quality 2
Compresses the input video using a quality level of 2 and saves it in the current directory.

.EXAMPLE
Compress-Video -InputFile "C:\Videos\input.mp4" -TargetSizeMB 100 -OutDir "D:\Compressed"
Compresses the input video to approximately 100MB and saves it in the D:\Compressed directory.

.EXAMPLE
Compress-Video -InputFile "C:\Videos\input.mp4" -TargetBitRateKbps 5000 -TargetFPS 30
Compresses the input video to a bitrate of 5000Kbps and sets the frame rate to 30 FPS.

.EXAMPLE
Get-ChildItem "C:\Videos\*.mp4" | Compress-Video -Quality 3 -OutDir "D:\Compressed"
Compresses all MP4 files in the C:\Videos directory using a quality level of 3 and saves them in the D:\Compressed directory.

.NOTES
This function requires FFmpeg to be installed on the system and accessible via the PATH environment variable.
The function uses a fixed audio bitrate of 128Kbps. Adjust the $audioBitRateKbps variable if needed.
Temporary log files are created during the compression process and are automatically removed upon completion.

.LINK
https://ffmpeg.org/
#>

function Compress-Video {
    [CmdletBinding(DefaultParameterSetName='Quality')]
    param(
        [Parameter(Mandatory, ValueFromPipeline, Position=0)]
        [Alias('Path', 'InputVideo', 'Input', 'InputPath')]
        [string]$InputFile,

        [Parameter(ParameterSetName='Size', Mandatory=$true)]
        [Alias('MB', 'TargetSize', 'SizeMB', 'Size')]
        [Nullable[int]]$TargetSizeMB,

        [Parameter(ParameterSetName='BitRate', Mandatory=$true)]
        [Alias('Kbps', 'BitRate', 'TargetBR')]
        [Nullable[int]]$TargetBitRateKbps,

        [Parameter(ParameterSetName='Quality', Mandatory=$true)]
        [Alias('Qual')]
        [Nullable[double]]$Quality,

        [Parameter()]
        [Alias('Output', 'OutputVideo', 'OutVideo', 'OutputFile', 'OutputPath')]
        [string]$OutDir = $PWD,

        [Parameter()]
        [Alias('FPS', 'FrameRate')]
        [Nullable[int]]$TargetFPS,

        [Parameter()]
        [Alias('AudioBR', 'AudioBitRate', 'ABR')]
        [int]$AudioBitRateKbps = 128
    )

    begin {
        if ($PSCmdlet.ParameterSetName -eq 'Quality') {
            $Quality = $null -ne $Quality ? $Quality : 1
        }
    }

    Process {
        # Calculate duration in seconds
        $durationSec = [math]::Ceiling([double](ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$InputFile"))

        # Extract video resolution (width and height)
        $videoInfo = ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0:s=x "$InputFile"
        $resolution = $videoInfo.Split('x')
        $width = [int]$resolution[0]
        $height = [int]$resolution[1]
        $frameRate = [double]($resolution[2] -replace '/.*', '')
        $megaPixels = ($width * $height) / 1000000

        # Calculations for video bit rate
        switch ($PSCmdlet.ParameterSetName) {
            'Quality' {
                $framerateRatio = $frameRate / 60.0
                $videoBitRateKbps = $Quality * 4000 * $megaPixels * $framerateRatio
            }
            'Size' {
                $targetSizeKB = [Math]::Ceiling($TargetSizeMB * 95 / 100) * 1024
                $videoBitRateKbps = [math]::Ceiling(($targetSizeKB * 8 - $audioBitRateKbps * $durationSec) / $durationSec)
            }
            'BitRate' {
                $videoBitRateKbps = $TargetBitRateKbps
            }
        }

        # Get output file path
        $outFile = Join-Path -Path $OutDir -ChildPath ("$((Get-Item (Split-Path -Leaf $inputFile)).BaseName)_compressed.mp4")

        # FFMPEG commands for two-pass encode
        $ffmpegCmdPass1 = "ffmpeg -y -i `"$InputFile`" -c:v libx264 -b:v ${videoBitRateKbps}k -pass 1 -an -f null NUL"
        $ffmpegCmdPass2 = "ffmpeg -i `"$InputFile`" -c:v libx264 -b:v ${videoBitRateKbps}k -pass 2 -c:a aac -b:a ${audioBitRateKbps}k"

        # Add FPS cap if specified
        if ($null -ne $TargetFPS) {
            $ffmpegCmdPass2 += " -r $TargetFPS"
        }

        $ffmpegCmdPass2 += " `"$outFile`""

        # Execute the two-pass encoding
        Write-Host "Starting first pass for $InputFile..."
        Invoke-Expression $ffmpegCmdPass1
        Write-Host "Starting second pass for $InputFile..."
        Invoke-Expression $ffmpegCmdPass2

        Write-Host "Encoding complete. File saved to $outFile"

        # Clean up: Delete the log files generated by the two-pass process
        Remove-Item ffmpeg2pass-0.log* -ErrorAction SilentlyContinue
        Write-Host "Clean-up complete. Temporary files removed."
    }
}
