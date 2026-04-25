#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "================================"
echo "Content Broadcasting System - API Tests"
echo "================================"
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -X GET $BASE_URL/health
echo ""
echo ""

# Test 2: Register Teacher
echo "2. Registering Teacher..."
TEACHER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "email": "rajesh@school.com",
    "password": "password123",
    "role": "teacher"
  }')
echo $TEACHER_RESPONSE | jq .
TEACHER_ID=$(echo $TEACHER_RESPONSE | jq -r '.data.user.id')
echo "Teacher ID: $TEACHER_ID"
echo ""

# Test 3: Register Principal
echo "3. Registering Principal..."
PRINCIPAL_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Sharma",
    "email": "principal@school.com",
    "password": "principal123",
    "role": "principal"
  }')
echo $PRINCIPAL_RESPONSE | jq .
PRINCIPAL_ID=$(echo $PRINCIPAL_RESPONSE | jq -r '.data.user.id')
echo "Principal ID: $PRINCIPAL_ID"
echo ""

# Test 4: Login Teacher
echo "4. Logging in as Teacher..."
TEACHER_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh@school.com",
    "password": "password123"
  }')
echo $TEACHER_LOGIN | jq .
TEACHER_TOKEN=$(echo $TEACHER_LOGIN | jq -r '.data.token')
echo "Teacher Token: $TEACHER_TOKEN"
echo ""

# Test 5: Login Principal
echo "5. Logging in as Principal..."
PRINCIPAL_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@school.com",
    "password": "principal123"
  }')
echo $PRINCIPAL_LOGIN | jq .
PRINCIPAL_TOKEN=$(echo $PRINCIPAL_LOGIN | jq -r '.data.token')
echo "Principal Token: $PRINCIPAL_TOKEN"
echo ""

echo "================================"
echo "Test Summary"
echo "================================"
echo "Teacher ID: $TEACHER_ID"
echo "Principal ID: $PRINCIPAL_ID"
echo "Teacher Token: $TEACHER_TOKEN"
echo "Principal Token: $PRINCIPAL_TOKEN"
