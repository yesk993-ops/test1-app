const http = require('http');

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const ENVIRONMENT = process.env.ENVIRONMENT || 'development';
const BRANCH = process.env.GIT_BRANCH || 'main';
const COMMIT_MSG = process.env.COMMIT_MSG || 'N/A';

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jenkins Branch Demo - ${ENVIRONMENT.toUpperCase()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        body.dev { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        body.qa { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        body.prod { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        body.staging { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

        .card {
            background: rgba(255,255,255,0.95);
            border-radius: 20px;
            padding: 40px 50px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            text-align: center;
            max-width: 500px;
            width: 90%;
        }
        h1 { color: #2d3748; font-size: 28px; margin-bottom: 10px; }
        .env-badge {
            display: inline-block;
            padding: 6px 20px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: 15px 0 25px;
            color: white;
        }
        .env-badge.dev { background: #667eea; }
        .env-badge.qa { background: #f5576c; }
        .env-badge.prod { background: #00b4d8; }
        .env-badge.staging { background: #38f9d7; color: #2d3748; }

        .info { text-align: left; margin: 20px 0; }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child { border-bottom: none; }
        .label { color: #718096; font-size: 14px; }
        .value { color: #2d3748; font-weight: 600; font-size: 14px; font-family: monospace; }

        .status { margin-top: 25px; padding: 12px; border-radius: 10px; }
        .status.healthy { background: #c6f6d5; color: #22543d; }
        .status.warning { background: #fefcbf; color: #744210; }

        .pipeline-info {
            margin-top: 20px;
            font-size: 12px;
            color: #a0aec0;
            font-style: italic;
        }
    </style>
</head>
<body class="${ENVIRONMENT}">
    <div class="card">
        <h1>🚀 Jenkins Branch Demo</h1>
        <div class="env-badge ${ENVIRONMENT}">${ENVIRONMENT} Environment</div>

        <div class="info">
            <div class="info-row">
                <span class="label">Application Version</span>
                <span class="value">${APP_VERSION}</span>
            </div>
            <div class="info-row">
                <span class="label">Environment</span>
                <span class="value">${ENVIRONMENT}</span>
            </div>
            <div class="info-row">
                <span class="label">Git Branch</span>
                <span class="value">${BRANCH}</span>
            </div>
            <div class="info-row">
                <span class="label">Deployed At</span>
                <span class="value">${new Date().toISOString()}</span>
            </div>
        </div>

        <div class="status healthy">
            ✅ Application is running successfully on port ${PORT}
        </div>

        <div class="pipeline-info">
            Built by Jenkins Pipeline | Branch: ${BRANCH} | Commit: ${COMMIT_MSG}
        </div>
    </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            version: APP_VERSION,
            environment: ENVIRONMENT,
            branch: BRANCH,
            uptime: process.uptime()
        }));
        return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 Version: ${APP_VERSION}`);
    console.log(`🌍 Environment: ${ENVIRONMENT}`);
    console.log(`🔀 Branch: ${BRANCH}`);
});
