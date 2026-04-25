$BaseURL = "http://localhost:3000/api"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Content Broadcasting System - API Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseURL/health" -Method GET
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register Teacher
Write-Host "2. Registering Teacher..." -ForegroundColor Yellow
try {
    $body = @{
        name     = "Rajesh Kumar"
        email    = "rajesh@school.com"
        password = "password123"
        role     = "teacher"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseURL/auth/register" -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host $response.Content -ForegroundColor Green
    $TEACHER_ID = $data.data.user.id
    Write-Host "Teacher ID: $TEACHER_ID" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Register Principal
Write-Host "3. Registering Principal..." -ForegroundColor Yellow
try {
    $body = @{
        name     = "Dr. Sharma"
        email    = "principal@school.com"
        password = "principal123"
        role     = "principal"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseURL/auth/register" -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host $response.Content -ForegroundColor Green
    $PRINCIPAL_ID = $data.data.user.id
    Write-Host "Principal ID: $PRINCIPAL_ID" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Login Teacher
Write-Host "4. Logging in as Teacher..." -ForegroundColor Yellow
try {
    $body = @{
        email    = "rajesh@school.com"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseURL/auth/login" -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host $response.Content -ForegroundColor Green
    $TEACHER_TOKEN = $data.data.token
    Write-Host "Teacher Token: $($TEACHER_TOKEN.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Login Principal
Write-Host "5. Logging in as Principal..." -ForegroundColor Yellow
try {
    $body = @{
        email    = "principal@school.com"
        password = "principal123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseURL/auth/login" -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host $response.Content -ForegroundColor Green
    $PRINCIPAL_TOKEN = $data.data.token
    Write-Host "Principal Token: $($PRINCIPAL_TOKEN.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Get Pending Contents (should be empty)
Write-Host "6. Getting Pending Contents..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseURL/approval/pending" -Method GET `
        -Headers @{"Authorization" = "Bearer $PRINCIPAL_TOKEN"}
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get All Contents (should be empty)
Write-Host "7. Getting All Contents..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseURL/content" -Method GET `
        -Headers @{"Authorization" = "Bearer $TEACHER_TOKEN"}
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get My Contents (teacher)
Write-Host "8. Getting My Contents (Teacher)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseURL/content/my-contents" -Method GET `
        -Headers @{"Authorization" = "Bearer $TEACHER_TOKEN"}
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 9: Get Public Live Content (no auth required)
Write-Host "9. Getting Live Content (Public - Teacher 1)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseURL/schedule/live/1" -Method GET
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Teacher ID: $TEACHER_ID" -ForegroundColor Green
Write-Host "Principal ID: $PRINCIPAL_ID" -ForegroundColor Green
Write-Host "Teacher Token: $TEACHER_TOKEN" -ForegroundColor Green
Write-Host "Principal Token: $PRINCIPAL_TOKEN" -ForegroundColor Green
