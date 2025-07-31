# PowerShell script to create a clean deployment ZIP
# This excludes large folders that shouldn't be uploaded to GitHub

Write-Host "Creating clean deployment ZIP..." -ForegroundColor Green

# Define the source directory
$sourceDir = "D:\Testing123\xcelerator-assessment"

# Define the output ZIP file
$outputZip = "D:\Testing123\xcelerator-assessment-deployment.zip"

# Remove existing ZIP if it exists
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
    Write-Host "Removed existing ZIP file" -ForegroundColor Yellow
}

# Create temporary directory for clean files
$tempDir = "D:\Testing123\xcelerator-assessment-temp"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy only the necessary files and folders
Write-Host "Copying project files..." -ForegroundColor Cyan

# Copy main folders
Copy-Item "$sourceDir\src" -Destination "$tempDir\src" -Recurse -Force
Copy-Item "$sourceDir\public" -Destination "$tempDir\public" -Recurse -Force
Copy-Item "$sourceDir\supabase" -Destination "$tempDir\supabase" -Recurse -Force

# Copy configuration files
Copy-Item "$sourceDir\package.json" -Destination "$tempDir\package.json" -Force
Copy-Item "$sourceDir\package-lock.json" -Destination "$tempDir\package-lock.json" -Force
Copy-Item "$sourceDir\next.config.ts" -Destination "$tempDir\next.config.ts" -Force
Copy-Item "$sourceDir\tailwind.config.js" -Destination "$tempDir\tailwind.config.js" -Force
Copy-Item "$sourceDir\tsconfig.json" -Destination "$tempDir\tsconfig.json" -Force
Copy-Item "$sourceDir\postcss.config.mjs" -Destination "$tempDir\postcss.config.mjs" -Force
Copy-Item "$sourceDir\eslint.config.mjs" -Destination "$tempDir\eslint.config.mjs" -Force
Copy-Item "$sourceDir\vercel.json" -Destination "$tempDir\vercel.json" -Force
Copy-Item "$sourceDir\.gitignore" -Destination "$tempDir\.gitignore" -Force
Copy-Item "$sourceDir\README.md" -Destination "$tempDir\README.md" -Force
Copy-Item "$sourceDir\SETUP.md" -Destination "$tempDir\SETUP.md" -Force
Copy-Item "$sourceDir\supabase-schema.sql" -Destination "$tempDir\supabase-schema.sql" -Force

# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputZip -Force

# Clean up temporary directory
Remove-Item $tempDir -Recurse -Force

# Get file size
$fileSize = (Get-Item $outputZip).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)

Write-Host "✅ Deployment ZIP created successfully!" -ForegroundColor Green
Write-Host "📁 Location: $outputZip" -ForegroundColor Cyan
Write-Host "📊 Size: $fileSizeMB MB" -ForegroundColor Cyan

if ($fileSizeMB -lt 25) {
    Write-Host "✅ File size is under 25MB - ready for GitHub upload!" -ForegroundColor Green
} else {
    Write-Host "⚠️  File size is over 25MB - may need further optimization" -ForegroundColor Yellow
}

Write-Host "`n🚀 You can now upload this ZIP file to GitHub!" -ForegroundColor Green 