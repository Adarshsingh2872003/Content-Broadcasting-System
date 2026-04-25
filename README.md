# Content Broadcasting System

## 📝 Assumptions & Limitations

### Assumptions
1. **Role Structure**: The system assumes strictly two user roles: `principal` (approvers) and `teacher` (uploaders). There is no "admin" or "student" role for authentication.
2. **Time Zones**: All scheduling timestamps (`start_time`, `end_time`) and database records are assumed to be handled in UTC format to avoid timezone conflicts across different regions.
3. **File Storage**: Local file system storage (`./uploads`) is assumed to be sufficient for the current scale and deployment environment.
4. **Content Rotation**: If a rotation duration is not provided during upload, it defaults to 5 minutes. The rotation algorithm assumes a continuous, non-stop cycle during the valid time window.
5. **Public Access**: Students accessing the live broadcast via the `/api/schedule/live/*` endpoints do not require authentication. The broadcast is assumed to be publicly accessible.
6. **Subject Availability**: Subjects (e.g., maths, science) are assumed to be pre-populated in the database directly by an administrator. There are no exposed endpoints to create new subjects in the current API scope.

### Limitations
1. **Horizontal Scaling**: Because files are stored locally in the `./uploads` directory, scaling the Node.js server horizontally (running multiple instances) will cause broken file links unless migrated to cloud storage (like AWS S3) or a shared network volume.
2. **Performance under Load**: The public broadcasting API currently queries the PostgreSQL database directly to calculate active content. Without a caching layer like Redis, heavy traffic from students could bottleneck the database performance.
3. **File Types**: The system is currently limited to image formats (`jpg`, `jpeg`, `png`, `gif`). It does not support video streaming or document (PDF) broadcasting out of the box.
4. **File Upload Restrictions**: There is a hard limit of 10MB per file, and the API only accepts a single file per upload request. Bulk uploading is not supported.
5. **Lack of Notifications**: The system does not send email or push notifications. Teachers must manually poll or check the dashboard to see if their content was approved or rejected.
6. **Rate Limiting**: There is currently no rate limiting implemented on the API. Public endpoints are vulnerable to abuse or DDoS attacks without an external API Gateway or reverse proxy (like Nginx) handling rate limits.
