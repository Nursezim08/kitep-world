# Script to fix Prisma imports in all API files

$files = Get-ChildItem -Path ".\app\api" -Recurse -Filter "*.ts" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    $content -match "from '@/lib/prisma'"
}

$totalFiles = $files.Count
$currentFile = 0

Write-Host "Found files to fix: $totalFiles" -ForegroundColor Cyan

foreach ($file in $files) {
    $currentFile++
    Write-Host "[$currentFile/$totalFiles] Processing: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    
    # Replace import
    $content = $content -replace "import \{ prisma \} from '@/lib/prisma';", "import { PrismaClient } from '@prisma/client';"
    
    # Find first exported function (GET, POST, PATCH, DELETE)
    if ($content -match '(export async function (GET|POST|PATCH|DELETE)\([^)]+\)\s*\{)') {
        $functionStart = $matches[1]
        
        # Add Prisma client creation after opening brace
        $newFunctionStart = $functionStart + "`n  const prisma = new PrismaClient();`n"
        $content = $content -replace [regex]::Escape($functionStart), $newFunctionStart
        
        # Find catch block and add finally
        if ($content -match '(\}\s*catch\s*\([^)]+\)\s*\{[^}]*\})(\s*\})') {
            $catchBlock = $matches[1]
            $closingBrace = $matches[2]
            
            $finallyBlock = " finally {`n    await prisma.`$disconnect();`n  }"
            
            $replacement = $catchBlock + $finallyBlock + $closingBrace
            $content = $content -replace [regex]::Escape($catchBlock + $closingBrace), $replacement
        }
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "  Done" -ForegroundColor Green
}

Write-Host "`nCompleted! Fixed files: $totalFiles" -ForegroundColor Green
