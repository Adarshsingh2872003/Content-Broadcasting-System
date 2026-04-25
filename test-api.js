#!/usr/bin/env node

/**
 * Content Broadcasting System - Integration Test Suite
 * Tests all API endpoints and core functionality
 */

const http = require('http');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let teacherToken, principalToken, teacherId, principalId, contentId = null;

// Test helper
async function request(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + endpoint);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('\n🧪 Starting Content Broadcasting System Tests\n');
    console.log(`📍 Base URL: ${BASE_URL}\n`);

    let passed = 0;
    let failed = 0;

    try {
        // Test 1: Health Check
        console.log('1️⃣  Testing Health Check...');
        const health = await request('GET', '/api/health');
        if (health.status === 200) {
            console.log('✅ Health Check: PASSED\n');
            passed++;
        } else {
            console.log('❌ Health Check: FAILED\n');
            failed++;
        }

        // Test 2: Register Teacher
        console.log('2️⃣  Testing Teacher Registration...');
        const teacherReg = await request('POST', '/api/auth/register', {
            name: 'Test Teacher',
            email: `teacher${Date.now()}@test.com`,
            password: 'password123',
            role: 'teacher',
        });

        if (teacherReg.status === 201) {
            console.log('✅ Teacher Registration: PASSED\n');
            passed++;
        } else {
            console.log('❌ Teacher Registration: FAILED', teacherReg.data, '\n');
            failed++;
        }

        // Test 3: Register Principal
        console.log('3️⃣  Testing Principal Registration...');
        const principalReg = await request('POST', '/api/auth/register', {
            name: 'Test Principal',
            email: `principal${Date.now()}@test.com`,
            password: 'password123',
            role: 'principal',
        });

        if (principalReg.status === 201) {
            console.log('✅ Principal Registration: PASSED\n');
            passed++;
        } else {
            console.log('❌ Principal Registration: FAILED\n');
            failed++;
        }

        // Test 4: Login Teacher
        console.log('4️⃣  Testing Teacher Login...');
        const teacherLogin = await request('POST', '/api/auth/login', {
            email: teacherReg.data.data.user.email,
            password: 'password123',
        });

        if (teacherLogin.status === 200 && teacherLogin.data.data.token) {
            teacherToken = teacherLogin.data.data.token;
            teacherId = teacherLogin.data.data.user.id;
            console.log('✅ Teacher Login: PASSED\n');
            passed++;
        } else {
            console.log('❌ Teacher Login: FAILED\n');
            failed++;
        }

        // Test 5: Login Principal
        console.log('5️⃣  Testing Principal Login...');
        const principalLogin = await request('POST', '/api/auth/login', {
            email: principalReg.data.data.user.email,
            password: 'password123',
        });

        if (principalLogin.status === 200 && principalLogin.data.data.token) {
            principalToken = principalLogin.data.data.token;
            principalId = principalLogin.data.data.user.id;
            console.log('✅ Principal Login: PASSED\n');
            passed++;
        } else {
            console.log('❌ Principal Login: FAILED\n');
            failed++;
        }

        // Test 6: Get Pending Contents (Empty)
        console.log('6️⃣  Testing Get Pending Contents (Principal)...');
        const pending = await request('GET', '/api/approval/pending', null, principalToken);
        if (pending.status === 200) {
            console.log('✅ Get Pending Contents: PASSED\n');
            passed++;
        } else {
            console.log('❌ Get Pending Contents: FAILED\n');
            failed++;
        }

        // Test 7: Get All Contents (Teacher)
        console.log('7️⃣  Testing Get All Contents (Teacher)...');
        const contents = await request('GET', '/api/content', null, teacherToken);
        if (contents.status === 200) {
            console.log('✅ Get All Contents: PASSED\n');
            passed++;
        } else {
            console.log('❌ Get All Contents: FAILED\n');
            failed++;
        }

        // Test 8: Get My Contents (Empty)
        console.log('8️⃣  Testing Get My Contents (Teacher)...');
        const myContents = await request('GET', '/api/content/my-contents', null, teacherToken);
        if (myContents.status === 200 && myContents.data.data.total === 0) {
            console.log('✅ Get My Contents: PASSED\n');
            passed++;
        } else {
            console.log('❌ Get My Contents: FAILED\n');
            failed++;
        }

        // Test 9: Get My Schedule (Empty)
        console.log('9️⃣  Testing Get My Schedule (Teacher)...');
        const schedule = await request('GET', '/api/schedule/my-schedule', null, teacherToken);
        if (schedule.status === 200) {
            console.log('✅ Get My Schedule: PASSED\n');
            passed++;
        } else {
            console.log('❌ Get My Schedule: FAILED\n');
            failed++;
        }

        // Test 10: Get Live Content (No Auth - Public API)
        console.log('🔟 Testing Get Live Content (Public - No Content Available)...');
        const liveContent = await request('GET', '/api/schedule/live/999');
        if (liveContent.status === 200 && liveContent.data.message === 'No content available') {
            console.log('✅ Get Live Content: PASSED (Edge case: no content)\n');
            passed++;
        } else {
            console.log('❌ Get Live Content: FAILED\n');
            failed++;
        }

        // Test 11: Reject without token
        console.log('1️⃣1️⃣  Testing Authorization (Reject without token)...');
        const reject = await request('POST', '/api/approval/reject', {
            content_id: 1,
            rejection_reason: 'test',
        });
        if (reject.status === 401) {
            console.log('✅ Authorization Check: PASSED (401 returned)\n');
            passed++;
        } else {
            console.log('❌ Authorization Check: FAILED\n');
            failed++;
        }

        // Test 12: Teacher trying to approve (should fail)
        console.log('1️⃣2️⃣  Testing Role-Based Access (Teacher approving)...');
        const teacherApprove = await request('POST', '/api/approval/approve', {
            content_id: 1,
        }, teacherToken);
        if (teacherApprove.status === 403) {
            console.log('✅ RBAC Check: PASSED (403 returned)\n');
            passed++;
        } else {
            console.log('❌ RBAC Check: FAILED\n');
            failed++;
        }

        // Test 13: Invalid subject in content list
        console.log('1️⃣3️⃣  Testing Edge Case (Invalid subject)...');
        const invalidSubject = await request('GET', '/api/content?subject_id=99999', null, teacherToken);
        if (invalidSubject.status === 200 && invalidSubject.data.data.total === 0) {
            console.log('✅ Invalid Subject Handling: PASSED (empty array)\n');
            passed++;
        } else {
            console.log('❌ Invalid Subject Handling: FAILED\n');
            failed++;
        }

        console.log('\n' + '='.repeat(50));
        console.log(`\n📊 Test Results:`);
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📈 Total:  ${passed + failed}\n`);

        if (failed === 0) {
            console.log('🎉 All tests passed!\n');
        } else {
            console.log(`⚠️  ${failed} test(s) failed\n`);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

runTests().catch(console.error);
