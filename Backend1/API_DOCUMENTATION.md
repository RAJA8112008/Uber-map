# API Documentation

## User Registration Endpoint

### Endpoint: `/users/register`

**Method:** `POST`

---

## Description

The `/users/register` endpoint allows new users to create an account in the Uber-map application. Users must provide their full name (first and last), email address, and password. The endpoint validates all input data, hashes the password using bcrypt, creates a new user record in the database, and returns an authentication token along with the user information.

---

## Request

### URL
```
POST /users/register
```

### Headers
```
Content-Type: application/json
```

### Request Body

The request body must be a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "string (required, min 3 characters)",
    "lastname": "string (optional, min 3 characters)"
  },
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)"
}
```

### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|-----------|-------------|
| `fullname.firstname` | String | Yes | Min 3 characters | User's first name |
| `fullname.lastname` | String | No | Min 3 characters (if provided) | User's last name |
| `email` | String | Yes | Valid email format, unique | User's email address (must be unique in the system) |
| `password` | String | Yes | Min 6 characters | User's password (will be hashed with bcrypt) |

### Example Request

```bash
curl -X POST http://localhost:5000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

---

## Response

### Success Response (201 Created)

**Status Code:** `201`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5ec49c1234567890abcde",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `token` | String | JWT authentication token (expires in 24 hours) |
| `user._id` | String | Unique user identifier (MongoDB ObjectId) |
| `user.fullname.firstname` | String | User's first name |
| `user.fullname.lastname` | String | User's last name |
| `user.email` | String | User's email address |
| `user.socketId` | String/Null | Socket ID for real-time communication (null initially) |

---

## Error Responses

### 400 Bad Request - Validation Errors

**Status Code:** `400`

Returned when request validation fails.

```json
{
  "errors": [
    {
      "type": "field",
      "value": "ab",
      "msg": "First name should be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

**Common Validation Errors:**

| Error Message | Cause |
|---------------|-------|
| "First name should be at least 3 characters long" | `fullname.firstname` is less than 3 characters |
| "Last name should be at least 3 characters long" | `fullname.lastname` is provided but less than 3 characters |
| "Invalid Email" | `email` is not a valid email format |
| "Password should be at least 6 characters long" | `password` is less than 6 characters |

### 409 Conflict - Duplicate Email

**Status Code:** `409` (or database error)

Returned when attempting to register with an email that already exists in the system.

```json
{
  "error": "Email already exists"
}
```

### 500 Internal Server Error

**Status Code:** `500`

Returned when an unexpected server error occurs during registration.

```json
{
  "error": "Internal server error"
}
```

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `201` | User successfully registered. Returns JWT token and user data. |
| `400` | Bad request. Validation failed. Check error messages for details. |
| `409` | Conflict. Email already registered in the system. |
| `500` | Internal server error. Contact support if issue persists. |

---

## Security Notes

- **Password Hashing:** Passwords are hashed using bcrypt (salt rounds: 10) before storage
- **Authentication Token:** JWT tokens are issued with 24-hour expiration
- **Email Uniqueness:** Email addresses must be unique across all users
- **Password Field:** The password field is not selected by default in user queries (security best practice)

---

## Example Usage

### JavaScript/Node.js (using fetch)

```javascript
const registerUser = async () => {
  const userData = {
    fullname: {
      firstname: "John",
      lastname: "Doe"
    },
    email: "john.doe@example.com",
    password: "securePassword123"
  };

  try {
    const response = await fetch('/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.status === 201) {
      console.log('Registration successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      // Store token in localStorage or sessionStorage
      localStorage.setItem('authToken', data.token);
    } else {
      console.error('Registration failed:', data.errors);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Python (using requests)

```python
import requests

url = "http://localhost:5000/users/register"

payload = {
    "fullname": {
        "firstname": "John",
        "lastname": "Doe"
    },
    "email": "john.doe@example.com",
    "password": "securePassword123"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 201:
    data = response.json()
    print("Registration successful!")
    print("Token:", data['token'])
    print("User:", data['user'])
else:
    print("Registration failed:", response.json())
```

---

## Notes

- All fields in the request body are required except `fullname.lastname`
- Email addresses are case-sensitive and must be unique
- Passwords must be at least 6 characters long for security
- The returned JWT token should be used for authenticated requests (typically stored in Authorization header as "Bearer {token}")
- User registrations are stored in MongoDB

---

**Last Updated:** June 9, 2026
