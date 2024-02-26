$source = "C:\workspace\Playground\esign\assets\build"
$destination = "C:\xampp\htdocs\esignature\wp-content\plugins\esignature-wordpress-plugin\assets\build"

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $source
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

$action = {
    robocopy $source $destination /MIR
}

Register-ObjectEvent $watcher "Changed" -Action $action

Write-Host "Monitoring for file changes. Press Ctrl+C to stop."
while ($true) {
    Start-Sleep -Seconds 1
}
