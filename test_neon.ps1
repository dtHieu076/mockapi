$headers = @{
    'Authorization' = 'Bearer napi_vj9itfsbc0zun453nvm97m8a9a1woc24zbkeg44pp49chtefcyl9qojsmi9cz4g0'
    'Accept'        = 'application/json'
}
$response = Invoke-RestMethod -Uri 'https://api.neon.tech/v3/projects' -Method GET -Headers $headers
$response | ConvertTo-Json -Depth 10
