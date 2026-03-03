const https = require('https');

const requestBody = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "list_projects",
        arguments: {
        }
    }
});

const options = {
    hostname: 'mcp.neon.tech',
    port: 443,
    path: '/mcp',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': 'Bearer napi_vj9itfsbc0zun453nvm97m8a9a1woc24zbkeg44pp49chtefcyl9qojsmi9cz4g0'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(requestBody);
req.end();
