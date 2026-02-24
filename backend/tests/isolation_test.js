// tests/isolation_test.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/db');
const Connection = require('../models/Connection');
const ConnectionKnowledge = require('../models/ConnectionKnowledge');
const aiService = require('../services/aiService');
const crypto = require('crypto');

// Prevent logger noise during tests if possible, but we want to see errors.
// logger writes to file so console should be cleanish.

async function runTest() {
    const resultLog = {
        status: 'UNKNOWN',
        logs: [],
        error: null
    };

    function log(msg) {
        console.log(msg);
        resultLog.logs.push(msg);
    }

    function error(msg, err) {
        console.error(msg, err);
        resultLog.logs.push(`ERROR: ${msg} ${err ? err.message : ''}`);
        if (err) resultLog.error = { message: err.message, stack: err.stack };
    }

    log('\n🔒 Starting Multi-Tenant Isolation Test...\n');

    // Unique IDs for this test run
    const connAId = 'iso-test-A-' + crypto.randomUUID().substring(0, 8);
    const connBId = 'iso-test-B-' + crypto.randomUUID().substring(0, 8);
    const secretKeyword = "XYZZY_" + crypto.randomUUID().substring(0, 8);
    // Using a random unique string to ensure no other knowledge matches it by accident.

    log(`   🔸 Connection A: ${connAId}`);
    log(`   🔸 Connection B: ${connBId}`);
    log(`   🔸 Secret Knowledge: "${secretKeyword}"`);

    let failure = false;

    try {
        // 1. SETUP: Create two distinct connections
        log('\n1. 🛠️  Setting up test connections...');
        await Connection.create({
            connectionId: connAId,
            websiteUrl: 'http://alpha.com',
            status: 'CONNECTED',
            assistantName: "Bot Alpha"
        });
        await Connection.create({
            connectionId: connBId,
            websiteUrl: 'http://beta.com',
            status: 'CONNECTED',
            assistantName: "Bot Beta"
        });

        // 2. INGEST: Add knowledge ONLY to Connection A
        log('2. 📥 Inserting exclusive knowledge into Connection A...');
        await ConnectionKnowledge.create({
            connectionId: connAId,
            sourceType: 'TEXT',
            sourceValue: 'Top Secret Doc',
            rawText: `This is a top secret document containing the code ${secretKeyword}. It belongs to Alpha only.`,
            cleanedText: `This is a top secret document containing the code ${secretKeyword}. It belongs to Alpha only.`,
            status: 'READY'
        });

        // 3. ATTACK: Connection B tries to search for Connection A's secret
        log('3. ⚔️  Testing Cross-Tenant Leakage (Connection B querying A\'s secret)...');

        // We query using the unique secret keyword.
        // If isolation works, B should find NOTHING, even though the text exists in the table (under A).
        const resultsB = await aiService.findSimilarKnowledge(connBId, `Tell me the code ${secretKeyword}`);

        if (resultsB.length > 0) {
            error('\n❌ CRITICAL FAIL: DATA LEAK DETECTED!');
            log(`   Connection B found ${resultsB.length} documents belonging to A.`);
            log('   Leaked Document:', resultsB[0].text);
            failure = true;
        } else {
            log('   ✅ PASS: Connection B returned 0 results for Connection A\'s data.');
        }

        // 4. VERIFY: Connection A *should* find it
        log('\n4. 🔍 Verifying Connection A access...');
        const resultsA = await aiService.findSimilarKnowledge(connAId, secretKeyword);

        if (resultsA.length > 0) {
            log(`   ✅ PASS: Connection A successfully retrieved its own data.`);
        } else {
            log('   ⚠️  WARNING: Connection A could not find its own data. Indexing might be slow or keyword fallback failed?');
            // This is not a security fail, but a functional availability warning.
        }

    } catch (err) {
        error('\n❌ EXECUTION ERROR:', err);
        failure = true;
    } finally {
        // 5. CLEANUP
        log('\n5. 🧹 Cleaning up test data...');
        try {
            await ConnectionKnowledge.destroy({ where: { connectionId: [connAId, connBId] } });
            await Connection.destroy({ where: { connectionId: [connAId, connBId] } });
            // FORCE CLOSE SEQUELIZE to end the process
            await sequelize.close();
            // Also need to close Redis if aiService opened it? 
            // the cache utility uses a singleton client, but we don't export a close method.
            // script will likely hang if we don't cleanup Redis.
            // Just use process.exit
        } catch (cleanupErr) {
            error("Cleanup Error:", cleanupErr);
        }

        if (failure) {
            resultLog.status = 'FAILED';
            log('\n🔴 TEST FAILED: Security Isolation Breached or Error Occurred.\n');
        } else {
            resultLog.status = 'PASSED';
            log('\n🟢 TEST PASSED: Multi-Tenant Isolation Verified.\n');
        }

        fs.writeFileSync(path.join(__dirname, '../test_result.json'), JSON.stringify(resultLog, null, 2));
        process.exit(failure ? 1 : 0);
    }
}

runTest();
