# AI Resume Screening Tool API Documentation

## Overview

The AI Resume Screening Tool provides a comprehensive REST API for managing resume screening, job postings, candidate analysis, and recruitment workflows. This API is built with Node.js, Express, and TypeScript, providing type-safe endpoints with comprehensive validation and error handling.

## Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Responses

Error responses include detailed information:

```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "recruiter",
  "companyId": "optional-company-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "recruiter"
  },
  "message": "User registered successfully. Please check your email for verification."
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "recruiter"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "Login successful"
}
```

#### POST /auth/logout
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### POST /auth/refresh-token
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### Resume Management

#### POST /resumes/upload
Upload a new resume file.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `resume`: File (PDF, DOCX, DOC)
- `candidateId`: String (UUID)
- `jobId`: String (UUID, optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resume-id",
    "fileName": "resume.pdf",
    "fileSize": 1024000,
    "status": "uploaded"
  },
  "message": "Resume uploaded successfully. Parsing in progress."
}
```

#### GET /resumes
Get list of resumes with pagination and filters.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10, max: 100)
- `status`: String (uploaded, processing, processed, failed)
- `candidateId`: String (UUID)
- `jobId`: String (UUID)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "resume-id",
      "fileName": "resume.pdf",
      "status": "processed",
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /resumes/:id
Get specific resume details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "resume-id",
    "fileName": "resume.pdf",
    "parsedData": {
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "education": [],
      "experience": [],
      "skills": []
    },
    "status": "processed"
  }
}
```

#### POST /resumes/:id/parse
Manually trigger resume parsing.

#### GET /resumes/:id/analysis
Get AI analysis of resume.

### Job Management

#### POST /jobs
Create a new job posting.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for a senior software engineer...",
  "requirements": [
    {
      "skill": "JavaScript",
      "level": "advanced",
      "required": true,
      "weight": 0.8
    }
  ],
  "responsibilities": [
    "Develop and maintain web applications",
    "Lead technical projects"
  ],
  "location": "San Francisco, CA",
  "type": "full-time",
  "level": "senior",
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  }
}
```

#### GET /jobs
Get list of job postings.

**Query Parameters:**
- `page`: Number
- `limit`: Number
- `status`: String (draft, active, paused, closed, archived)
- `type`: String (full-time, part-time, contract, internship, freelance)
- `level`: String (entry, junior, mid, senior, lead, executive)

#### GET /jobs/:id
Get specific job details.

#### PUT /jobs/:id
Update job posting.

#### POST /jobs/:id/publish
Publish a draft job.

#### POST /jobs/:id/pause
Pause an active job.

### Screening

#### POST /screening
Create a new screening session.

**Request Body:**
```json
{
  "jobId": "job-id",
  "resumeId": "resume-id",
  "candidateId": "candidate-id"
}
```

#### GET /screening
Get list of screenings.

**Query Parameters:**
- `page`: Number
- `limit`: Number
- `status`: String (pending, in_progress, completed, reviewed, rejected)
- `jobId`: String (UUID)
- `candidateId`: String (UUID)

#### GET /screening/:id
Get specific screening details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "screening-id",
    "score": 85.5,
    "breakdown": {
      "skills": 90,
      "experience": 80,
      "education": 85,
      "culturalFit": 88
    },
    "aiAnalysis": {
      "summary": "Strong candidate with excellent technical skills...",
      "strengths": ["Technical expertise", "Problem solving"],
      "weaknesses": ["Limited leadership experience"],
      "recommendations": ["Consider for technical role"]
    }
  }
}
```

#### POST /screening/:id/notes
Add reviewer note to screening.

**Request Body:**
```json
{
  "note": "Excellent candidate, strong technical background",
  "rating": 4.5
}
```

### Analytics

#### GET /analytics/dashboard
Get dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalCandidates": 150,
      "activeJobs": 12,
      "avgScreeningTime": "2.5 hours",
      "successRate": 78.5
    },
    "charts": {
      "candidateFlow": {},
      "skillDistribution": {},
      "hiringFunnel": {}
    }
  }
}
```

#### GET /analytics/diversity
Get diversity analytics.

**Query Parameters:**
- `startDate`: String (ISO date)
- `endDate`: String (ISO date)
- `department`: String

#### GET /analytics/skills
Get skills analytics.

#### GET /analytics/performance
Get performance analytics.

### Integrations

#### GET /integrations
Get list of integrations.

#### POST /integrations
Create new integration.

**Request Body:**
```json
{
  "type": "linkedin",
  "config": {
    "apiKey": "your-api-key",
    "apiSecret": "your-api-secret"
  }
}
```

#### GET /integrations/linkedin/profile/:candidateId
Get LinkedIn profile data.

#### GET /integrations/github/profile/:candidateId
Get GitHub profile data.

### Video Screening

#### POST /video/screenings
Create video screening session.

**Request Body:**
```json
{
  "screeningId": "screening-id",
  "candidateId": "candidate-id",
  "jobId": "job-id",
  "scheduledAt": "2024-01-01T10:00:00Z"
}
```

#### GET /video/screenings
Get list of video screenings.

#### POST /video/token
Generate Twilio video token.

#### GET /video/screenings/:id/analysis
Get video screening analysis.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **File uploads**: 10 requests per 15 minutes
- **AI processing**: 50 requests per 15 minutes

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## WebSocket Events

The API also provides real-time updates via WebSocket:

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### resume:upload:progress:update
```javascript
socket.on('resume:upload:progress:update', (data) => {
  console.log(`Upload progress: ${data.progress}%`);
});
```

#### screening:progress:update
```javascript
socket.on('screening:progress:update', (data) => {
  console.log(`Screening progress: ${data.progress}%`);
});
```

#### screening:completed
```javascript
socket.on('screening:completed', (data) => {
  console.log('Screening completed:', data);
});
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install ai-resume-screening-sdk
```

```javascript
import { AIScreeningClient } from 'ai-resume-screening-sdk';

const client = new AIScreeningClient({
  baseURL: 'http://localhost:3000/api/v1',
  token: 'your-jwt-token'
});

// Upload resume
const resume = await client.resumes.upload(file, {
  candidateId: 'candidate-id',
  jobId: 'job-id'
});

// Create screening
const screening = await client.screening.create({
  jobId: 'job-id',
  resumeId: resume.id,
  candidateId: 'candidate-id'
});
```

### Python
```bash
pip install ai-resume-screening-python
```

```python
from ai_resume_screening import AIScreeningClient

client = AIScreeningClient(
    base_url="http://localhost:3000/api/v1",
    token="your-jwt-token"
)

# Upload resume
resume = client.resumes.upload(file_path, {
    "candidateId": "candidate-id",
    "jobId": "job-id"
})

# Create screening
screening = client.screening.create({
    "jobId": "job-id",
    "resumeId": resume.id,
    "candidateId": "candidate-id"
})
```

## Support

For API support and questions:

- **Documentation**: https://docs.airesumescreening.com
- **GitHub Issues**: https://github.com/your-repo/issues
- **Email**: api-support@airesumescreening.com

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Basic CRUD operations for resumes, jobs, and screenings
- AI-powered resume analysis
- Real-time WebSocket support
- Comprehensive analytics endpoints 