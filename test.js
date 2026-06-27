const http = require('http');

const PORT = process.env.PORT || 3001;
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

let server;
let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${testName}`);
        failed++;
    }
}

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('\n🧪 Running Tests...\n');

    // Start server for testing
    process.env.PORT = PORT;
    server = require('./server');

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Test 1: Main page returns 200
        const homeRes = await makeRequest('/');
        assert(homeRes.status === 200, 'Homepage returns HTTP 200');

        // Test 2: Homepage contains version
        assert(homeRes.body.includes(APP_VERSION), `Homepage contains version ${APP_VERSION}`);

        // Test 3: Homepage contains environment info
        assert(homeRes.body.includes('Environment'), 'Homepage displays environment info');

        // Test 4: Health endpoint returns 200
        const healthRes = await makeRequest('/health');
        assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');

        // Test 5: Health endpoint returns valid JSON
        const healthData = JSON.parse(healthRes.body);
        assert(healthData.status === 'healthy', 'Health endpoint reports healthy status');

        // Test 6: Health endpoint contains version
        assert(healthData.version === APP_VERSION, 'Health endpoint contains correct version');

        // Test 7: Health endpoint contains uptime
        assert(typeof healthData.uptime === 'number', 'Health endpoint contains uptime');

    } catch (err) {
        console.log(`  ❌ ERROR: ${err.message}`);
        failed++;
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
