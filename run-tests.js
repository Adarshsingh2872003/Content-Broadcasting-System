#!/usr/bin/env node

/**
 * Content Broadcasting System - Comprehensive API Test Suite
 * Tests all endpoints with proper flow
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';
let teacherToken = '';
let principalToken = '';
let teacherId = 1;
let principalId = 2;
let contentId = null;

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        }

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body,
                    });
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

// Test functions
async function testHealthCheck() {
    console.log('\n✓ Testing: Health Check');
    try {
        const res = await makeRequest('GET', '/health');
        console.log(`  Status: ${res.status}`);
        console.log(`  Response: ${JSON.stringify(res.data)}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testRegisterTeacher() {
    console.log('\n✓ Testing: Register Teacher');
    try {
        const res = await makeRequest('POST', '/auth/register', {
            name: 'Alice Johnson',
            email: `teacher${Date.now()}@school.com`,
            password: 'password123',
            role: 'teacher',
        });
        console.log(`  Status: ${res.status}`);
        console.log(`  User ID: ${res.data.data?.user?.id}`);
        if (res.data.data?.user?.id) {
            teacherId = res.data.data.user.id;
        }
        return res.status === 201;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testRegisterPrincipal() {
    console.log('\n✓ Testing: Register Principal');
    try {
        const res = await makeRequest('POST', '/auth/register', {
            name: 'Dr. Smith',
            email: `principal${Date.now()}@school.com`,
            password: 'password123',
            role: 'principal',
        });
        console.log(`  Status: ${res.status}`);
        console.log(`  User ID: ${res.data.data?.user?.id}`);
        if (res.data.data?.user?.id) {
            principalId = res.data.data.user.id;
        }
        return res.status === 201;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testLoginTeacher() {
    console.log('\n✓ Testing: Login Teacher');
    try {
        const res = await makeRequest('POST', '/auth/login', {
            email: 'alice@school.com',
            password: 'password123',
        });
        console.log(`  Status: ${res.status}`);
        if (res.data.data?.token) {
            teacherToken = res.data.data.token;
            console.log(`  Token: ${teacherToken.substring(0, 20)}...`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testLoginPrincipal() {
    console.log('\n✓ Testing: Login Principal');
    try {
        const res = await makeRequest('POST', '/auth/login', {
            email: 'principal@school.com',
            password: 'password123',
        });
        console.log(`  Status: ${res.status}`);
        if (res.data.data?.token) {
            principalToken = res.data.data.token;
            console.log(`  Token: ${principalToken.substring(0, 20)}...`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testGetContents() {
    console.log('\n✓ Testing: Get All Contents');
    try {
        const res = await makeRequest('GET', '/content', null, teacherToken);
        console.log(`  Status: ${res.status}`);
        console.log(`  Total Contents: ${res.data.data?.total}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testGetMyContents() {
    console.log('\n✓ Testing: Get My Contents (Teacher)');
    try {
        const res = await makeRequest('GET', '/content/my-contents', null, teacherToken);
        console.log(`  Status: ${res.status}`);
        console.log(`  Total: ${res.data.data?.total}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testGetPendingContents() {
    console.log('\n✓ Testing: Get Pending Contents (Principal)');
    try {
        const res = await makeRequest('GET', '/approval/pending', null, principalToken);
        console.log(`  Status: ${res.status}`);
        console.log(`  Pending: ${res.data.data?.total}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testGetLiveContent() {
    console.log('\n✓ Testing: Get Live Content (Public API)');
    try {
        const res = await makeRequest('GET', `/schedule/live/${teacherId}`);
        console.log(`  Status: ${res.status}`);
        console.log(`  Message: ${res.data.message || 'Content available'}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testGetTeacherSchedule() {
    console.log('\n✓ Testing: Get Teacher Schedule');
    try {
        const res = await makeRequest('GET', '/schedule/my-schedule', null, teacherToken);
        console.log(`  Status: ${res.status}`);
        console.log(`  Total: ${res.data.data?.total}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testGetSubjectSchedule() {
    console.log('\n✓ Testing: Get Subject Schedule');
    try {
        const res = await makeRequest('GET', '/schedule/subject/1');
        console.log(`  Status: ${res.status}`);
        console.log(`  Total: ${res.data.data?.total}`);
        return res.status === 200;
    } catch (error) {
        console.error('  Error:', error.message);
        return false;
    }
}

async function testErrorCases() {
    console.log('\n✓ Testing: Error Cases');

    // Test unauthorized access
    console.log('\n  Testing: Unauthorized (no token)');
    try {
        const res = await makeRequest('GET', '/content/my-contents');
        console.log(`  Status: ${res.status} - Expected 401`);
    } catch (error) {
        console.error('  Error:', error.message);
    }

    // Test invalid subject
    console.log('\n  Testing: Get Content with Invalid ID');
    try {
        const res = await makeRequest('GET', '/content/999999', null, teacherToken);
        console.log(`  Status: ${res.status} - Expected 404`);
    } catch (error) {
        console.error('  Error:', error.message);
    }

    // Test invalid token
    console.log('\n  Testing: Invalid Token');
    try {
        const res = await makeRequest('GET', '/content/my-contents', null, 'invalid.token.here');
        console.log(`  Status: ${res.status} - Expected 401`);
    } catch (error) {
        console.error('  Error:', error.message);
    }
}

// Main test runner
async function runTests() {
    console.log('====================================');
    console.log('Content Broadcasting System - API Tests');
    console.log('====================================');

    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Register Teacher', fn: testRegisterTeacher },
        { name: 'Register Principal', fn: testRegisterPrincipal },
        { name: 'Login Teacher', fn: testLoginTeacher },
        { name: 'Login Principal', fn: testLoginPrincipal },
        { name: 'Get All Contents', fn: testGetContents },
        { name: 'Get My Contents', fn: testGetMyContents },
        { name: 'Get Pending Contents', fn: testGetPendingContents },
        { name: 'Get Live Content (Public)', fn: testGetLiveContent },
        { name: 'Get Teacher Schedule', fn: testGetTeacherSchedule },
        { name: 'Get Subject Schedule', fn: testGetSubjectSchedule },
        { name: 'Error Cases', fn: testErrorCases },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result !== false) passed++;
            else failed++;
        } catch (error) {
            console.error(`\n✗ ${test.name} failed:`, error.message);
            failed++;
        }
        // Add delay between requests
        await new Promise((r) => setTimeout(r, 500));
    }

    console.log('\n====================================');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('====================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
