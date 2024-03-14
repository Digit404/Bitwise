param (
    [string]$inputFile
)

# Define a temporary directory (optional)
$tempDir = $env:TEMP  # Change this to your desired temp directory

# Extract the bitrate of the original video
$bitrate = (ffmpeg -i $inputFile 2>&1 | Select-String -Pattern "bitrate: \d+ kb/s").Matches.Value -replace "bitrate: " -replace " kb/s"

Write-Host "Scaling video to 480p..." -ForegroundColor Yellow
# First, scale the input file to a height of 480 pixels while maintaining the aspect ratio
$blurSigma = 1
ffmpeg -loglevel error -stats -i $inputFile -vf "scale=-1:480,pad=ceil(iw/2)*2:ceil(ih/2)*2,gblur=sigma=$blurSigma" -b:v $bitrate"k" -c:a copy "$tempDir\temp_scaled.mp4"

Write-Host "Cropping video to SD..." -ForegroundColor Yellow
# Then, crop the scaled video to a width of 332 pixels while keeping the height unchanged
ffmpeg -loglevel error -stats -i "$tempDir\temp_scaled.mp4" -vf "crop=640:480" -b:v $bitrate"k" -c:a copy "$tempDir\temp_cropped.mp4"

Write-Host "Extracting Luminance and Chrominance information..." -ForegroundColor Yellow
# Extract Y, U, and V planes from the cropped video
ffmpeg -loglevel error -stats -i "$tempDir\temp_cropped.mp4" -vf "extractplanes=y,setsar=1" -b:v $bitrate"k" "$tempDir\temp_y_plane.mp4"
ffmpeg -loglevel error -stats -i "$tempDir\temp_cropped.mp4" -vf "extractplanes=u" -b:v $bitrate"k" "$tempDir\temp_u_plane.mp4"
ffmpeg -loglevel error -stats -i "$tempDir\temp_cropped.mp4" -vf "extractplanes=v" -b:v $bitrate"k" "$tempDir\temp_v_plane.mp4"

Write-Host "Resampling Chroma..." -ForegroundColor Yellow
# Resample and resize U and V planes
ffmpeg -loglevel error -stats -i "$tempDir\temp_u_plane.mp4" -vf "scale=80:240:flags=bilinear,setsar=1" -b:v $bitrate"k" "$tempDir\temp_u_resampled.mp4"
ffmpeg -loglevel error -stats -i "$tempDir\temp_v_plane.mp4" -vf "scale=80:240:flags=bilinear,setsar=1" -b:v $bitrate"k" "$tempDir\temp_v_resampled.mp4"

ffmpeg -loglevel error -stats -i "$tempDir\temp_u_resampled.mp4" -vf "scale=320:240:flags=bilinear,setsar=1" -b:v $bitrate"k" "$tempDir\temp_u_resized.mp4"
ffmpeg -loglevel error -stats -i "$tempDir\temp_v_resampled.mp4" -vf "scale=320:240:flags=bilinear,setsar=1" -b:v $bitrate"k" "$tempDir\temp_v_resized.mp4"

Write-Host "Combining video..." -ForegroundColor Yellow
# Merge Y, U, and V planes with audio
ffmpeg -loglevel error -stats -i "$tempDir\temp_y_plane.mp4" -i "$tempDir\temp_u_resized.mp4" -i "$tempDir\temp_v_resized.mp4" -i "$tempDir\temp_cropped.mp4" -b:v $bitrate"k" -filter_complex "[0:v][1:v][2:v]mergeplanes=0x001020:yuv420p[out]" -map "[out]" -map 3:a -c:a copy "$((Get-Item $inputFile).BaseName)-VHS.mp4"

# Clean up temporary files
Remove-Item "$tempDir\temp_*"
