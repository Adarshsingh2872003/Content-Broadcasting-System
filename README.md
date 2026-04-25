# Content Broadcasting System - Backend API

A production-ready Node.js + Express backend for distributing subject-based educational content with approval workflow and dynamic scheduling.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Validation:** Joi

## 📋 Requirements

- Node.js 14+
- PostgreSQL 12+
- npm or yarn

## 🔧 Setup Instructions

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:7985966575@localhost:5432/content
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FORMATS=jpg,jpeg,png,gif
```

### 3. Database Setup

Execute the provided SQL schema to create tables:

```bash
psql -U postgres -d content -f database-schema.sql
```

Or manually run the SQL commands from your database client.

### 4. Start the Server

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "teacher"  // or "principal"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "teacher",
      "created_at": "2026-04-26T10:00:00.000Z"
    }
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teacher"
    }
  }
}
```

### Content Upload (Teacher Only)

#### Upload Content
```
POST /api/content/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Form Data:
- title: "Algebra Basics"
- description: "Introduction to algebraic equations"
- subject_id: 1
- file: <image-file>
- start_time: "2026-04-26T09:00:00Z"
- end_time: "2026-04-26T18:00:00Z"
- rotation_duration: 5  // minutes (optional)
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "content": {
      "id": 10,
      "title": "Algebra Basics",
      "subject_id": 1,
      "status": "pending",
      "created_at": "2026-04-26T10:00:00.000Z"
    }
  }
}
```

#### Get My Contents
```
GET /api/content/my-contents
Authorization: Bearer {teacher-token}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "contents": [
      {
        "id": 10,
        "title": "Algebra Basics",
        "status": "pending",
        "subject_id": 1,
        "uploaded_by": 1
      }
    ]
  }
}
```

### Approval Workflow (Principal Only)

#### Get Pending Contents
```
GET /api/approval/pending
Authorization: Bearer {principal-token}
```

#### Approve Content
```
POST /api/approval/approve
Content-Type: application/json
Authorization: Bearer {principal-token}

{
  "content_id": 10
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Content approved successfully",
  "data": {
    "content": {
      "id": 10,
      "title": "Algebra Basics",
      "status": "approved",
      "approved_at": "2026-04-26T10:30:00.000Z"
    }
  }
}
```

#### Reject Content
```
POST /api/approval/reject
Content-Type: application/json
Authorization: Bearer {principal-token}

{
  "content_id": 10,
  "rejection_reason": "File quality is not good enough"
}
```

#### Get All Contents (Principal Dashboard)
```
GET /api/approval?status=pending
Authorization: Bearer {principal-token}

Query Parameters:
- status: "pending", "approved", "rejected" (optional)
```

### Public Broadcasting API (Student Access)

#### Get Live Content for Teacher
```
GET /api/schedule/live/1
```

**Response (Content Available):**
```json
{
  "status": "success",
  "data": {
    "content": {
      "id": 10,
      "title": "Algebra Basics",
      "file_path": "uploads/unique-id.png",
      "subject_id": 1,
      "status": "approved",
      "start_time": "2026-04-26T09:00:00.000Z",
      "end_time": "2026-04-26T18:00:00.000Z"
    }
  }
}
```

**Response (No Content Available):**
```json
{
  "status": "success",
  "message": "No content available",
  "data": null
}
```

#### Get Live Content by Subject Filter
```
GET /api/schedule/live/1?subject_id=2
```

#### Get My Schedule (Teacher)
```
GET /api/schedule/my-schedule
Authorization: Bearer {teacher-token}
```

### Content Management

#### Get All Content (with filters)
```
GET /api/content?status=approved&subject_id=1
Authorization: Bearer {token}

Query Parameters:
- status: "pending", "approved", "rejected" (optional)
- subject_id: ID number (optional)
```

#### Get Specific Content
```
GET /api/content/10
Authorization: Bearer {token}
```

#### Delete Content
```
DELETE /api/content/10
Authorization: Bearer {token}
```

Only content uploader or principal can delete.

### Health Check

```
GET /api/health
```

## 🎯 Key Features

### 1. Authentication & RBAC
- JWT-based authentication
- Two roles: Principal, Teacher
- Role-based access control on routes

### 2. Content Upload
- Supported formats: JPG, PNG, GIF
- Max file size: 10MB
- File stored locally with unique naming
- Accessible via `/uploads/{filename}`

### 3. Approval Workflow
- Content lifecycle: pending → approved/rejected
- Only principal can approve/reject
- Rejection reason stored for visibility

### 4. Dynamic Scheduling & Rotation
- Teacher controls content visibility via start_time/end_time
- Multiple content items rotate in sequence
- Each subject has independent rotation
- System calculates active content in real-time

### 5. Public Broadcasting API
- Students access content via `/api/schedule/live/:teacherId`
- Only approved content shown
- Respects teacher-defined time windows
- Returns empty response if no content available

## 🔐 Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Role-based access control
- CORS enabled for frontend
- Helmet.js for security headers
- Input validation with Joi

## 📁 Folder Structure

```
src/
├── config/          - Database connection
├── controllers/     - Route handlers
├── routes/          - API endpoints
├── middlewares/     - Auth, role validation
├── services/        - Business logic
└── utils/           - Validators, error handlers
```

## 🧪 Testing with Postman

### Setup:
1. Import the Postman collection (if available)
2. Set base URL: `http://localhost:5000`
3. Use JWT token from login response in Authorization header

### Example Flow:
1. Register as Teacher
2. Login → Get JWT token
3. Upload content
4. Login as Principal
5. Approve content
6. Access public API to get live content

## 📊 Database Schema

### Tables:
- **users**: User accounts with roles
- **subjects**: Available subjects (maths, science, english)
- **contents**: Uploaded content with metadata
- **content_slots**: Subject-based scheduling slots
- **content_schedule**: Content rotation info

### Relationships:
- Contents has many Schedules
- Users uploads many Contents
- Subjects has many Contents

## 🚀 Deployment

### Production Checklist:
- Change JWT_SECRET to strong random value
- Set NODE_ENV=production
- Use environment-specific database URL
- Enable HTTPS
- Configure CORS origins
- Setup error monitoring

### Bonus Features (Optional):
- Redis caching for /api/schedule/live
- Rate limiting for public API
- S3 for cloud file storage
- Email notifications
- Analytics dashboard

## 📝 Assumptions & Limitations

1. **File Storage**: Currently uses local filesystem. For production, consider S3.
2. **Rotation Duration**: Default 5 minutes if not specified
3. **Time Format**: Uses UTC timestamps
4. **File Limit**: Single file upload per request
5. **Public API**: No authentication required for students

## 🔍 Edge Cases Handled

1. **No Content Available**: Returns empty response
2. **Approved But Not Scheduled**: Not shown (outside time window)
3. **Invalid Subject**: Returns empty array (not error)
4. **Duplicate Email**: Returns 400 error
5. **Invalid Token**: Returns 401 Unauthorized
6. **Insufficient Permissions**: Returns 403 Forbidden

## 📞 Support

For issues or questions, please check:
- `/api/health` - Server status
- Error responses include descriptive messages
- Check logs for detailed error information

## 📄 License

ISC

---

**Last Updated:** April 26, 2026
