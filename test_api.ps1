$body = @{
    username = "hieu"
    password = "123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/auth/register" -Method Post -Body $body -ContentType "application/json"
