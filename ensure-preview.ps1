$ErrorActionPreference = "SilentlyContinue"

$mutex = New-Object System.Threading.Mutex($false, "Global\TruckNotesPreviewWatchdog")
if (-not $mutex.WaitOne(0, $false)) {
  exit 0
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$healthUrl = "http://localhost:8010/__health"
$nodeCandidates = @(
  "C:\Program Files\nodejs\node.exe",
  "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)

function Get-NodePath {
  foreach ($candidate in $nodeCandidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }
  return $null
}

function Test-TruckNotesPreview {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $healthUrl -TimeoutSec 2
    $health = $response.Content | ConvertFrom-Json
    return $health.app -eq "truck-notes"
  } catch {
    return $false
  }
}

while ($true) {
  if (-not (Test-TruckNotesPreview)) {
    $node = Get-NodePath
    if ($node) {
      Start-Process -FilePath $node -ArgumentList (Join-Path $root "serve.mjs") -WorkingDirectory $root -WindowStyle Hidden
      Start-Sleep -Seconds 5
    }
  }

  Start-Sleep -Seconds 15
}
