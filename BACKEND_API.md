# Hyprbuild Dashboard - Backend API Documentation

## Base URL
- **Production**: `https://hyprbuild.app/api`
- **Development**: `{your_domain}/api`

## Authentication
The dashboard uses **Clerk** for authentication. All API requests must include a Bearer token in the Authorization header:
```
Authorization: Bearer {clerk_session_token}
```

## Required Endpoints

### 1. Health Check
```
GET /health
```
**Response:**
```json
{ "ok": true }
```

---

### 2. Get Current User
```
GET /me
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user": {
    "id": "user_xxx",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "primaryEmailAddress": "john@example.com",
    "imageUrl": "https://...",
    "role": "user",
    "publicMetadata": {
      "activeProjects": 5,
      "successRate": 98,
      "avgDeploySeconds": 45,
      "leadsCaptured": 120
    }
  }
}
```

---

### 3. Update User Profile
```
PATCH /me
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{ "user": { ...updated user object... } }
```

---

### 4. Upload Profile Image
```
POST /me/profile-image
```
**Headers:** `Authorization: Bearer {token}`
**Content-Type:** `multipart/form-data`

**Body:** `file` (image file)

**Response:**
```json
{
  "user": {
    "imageUrl": "https://..."
  }
}
```

---

### 5. Add Backup Email
```
POST /me/backup-email
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "email": "backup@example.com"
}
```

---

### 6. Change Password
```
PATCH /me/password
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

### 7. Admin: Get All Users
```
GET /admin/users
```
**Headers:** `Authorization: Bearer {token}` (admin only)

**Response:**
```json
{
  "users": [
    {
      "id": "user_xxx",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "admin",
      "publicMetadata": {}
    }
  ]
}
```

---

### 8. Create Project
```
POST /projects
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "name": "My Awesome Project"
}
```

**Response:**
```json
{
  "projectId": "my-awesome-project",
  "id": "my-awesome-project"
}
```

---

### 9. Update Project
```
PATCH /projects/{projectId}
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "stage": "name_set",
  "projectJson": {
    "stage": "name_set",
    "projectName": "My Project",
    "projectId": "my-project",
    "domainRoot": "",
    "selectedDomain": "",
    "prompt": "",
    "planSummary": "",
    "chatHistory": [],
    "buildCompleted": false,
    "publishCompleted": false,
    "assets": [],
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### 10. Publish Project
```
POST /projects/{projectId}/publish
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{ "success": true }
```

---

### 11. Search Domains
```
GET /domains/search?name=mybrand
```
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "domains": [
    { "name": "mybrand.com", "available": true, "price": 14 },
    { "name": "mybrand.ai", "available": true, "price": 79 },
    { "name": "mybrand.io", "available": false, "price": 49 }
  ]
}
```

---

### 12. AI: Generate Project
```
POST /ai/projects/generate
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "projectId": "my-project",
  "userRequest": "Build a SaaS dashboard with auth, analytics, and billing",
  "images": [
    { "url": "https://...", "dataUrl": "data:image/...", "mimeType": "image/png" }
  ]
}
```

**Response:**
```json
{
  "projectId": "my-project",
  "status": "completed",
  "planner": {
    "summary": "Build plan summary...",
    "goals": ["Goal 1", "Goal 2"]
  },
  "backend": {
    "contracts": { "auth": {}, "billing": {} },
    "files": { "server.js": "..." }
  },
  "pages": [
    { "title": "Dashboard", "route": "/dashboard" },
    { "title": "Analytics", "route": "/analytics" }
  ],
  "tester": {
    "status": "pass",
    "score": 95,
    "issues": []
  },
  "usage": {
    "totalCalls": 45,
    "totalInputTokens": 12000,
    "totalOutputTokens": 8000,
    "byAgent": {
      "planner": { "calls": 5, "inputTokens": 2000 },
      "builder": { "calls": 30, "inputTokens": 10000 }
    }
  }
}
```

---

### 13. AI: Generate Plan
```
POST /ai/projects/plan
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "projectId": "my-project",
  "userRequest": "Build a modern SaaS platform...",
  "images": []
}
```

**Response:**
```json
{
  "planSummary": "1. Set up authentication\n2. Create dashboard UI\n3. Add billing integration...",
  "summary": "...",
  "planner": { ... }
}
```

---

### 14. AI: Build Project
```
POST /ai/projects/build
```
**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "projectId": "my-project",
  "userRequest": "Generate backend and frontend based on approved plan"
}
```

**Response:**
```json
{
  "success": true,
  "buildId": "build_xxx"
}
```

---

## Domain Price Map (Reference)
```javascript
{
  '.com': 14,
  '.ai': 79,
  '.io': 49,
  '.app': 22,
  '.dev': 18
}
```

## User Verification (Current Hardcoded Check)
The dashboard currently has a hardcoded verification check:
```javascript
// Verified user: aladdinshenewa@outlook.com with user ID: user_39yQlq5ya1GnuppSSQnYPwjO9YP
```

This should be replaced with proper role-based access control (RBAC).

---

## Error Responses
All endpoints should return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (redirect to login)
- `403` - Forbidden (insufficient permissions)
- `429` - Rate Limited
- `500` - Server Error

Error format:
```json
{
  "error": {
    "message": "Error description"
  }
}
```
or
```json
{
  "message": "Error description"
}
```

