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

## User Login Endpoint

### Endpoint: `/users/login`

**Method:** `POST`

---

## Description

The `/users/login` endpoint allows registered users to authenticate and obtain an authentication token. Users must provide their registered email address and password. The endpoint validates the credentials, compares the provided password with the stored hashed password using bcrypt, and returns an authentication token along with the user information if credentials are valid.

---

## Request

### URL
```
POST /users/login
```

### Headers
```
Content-Type: application/json
```

### Request Body

The request body must be a JSON object with the following structure:

```json
{
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)"
}
```

### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|-----------|-------------|
| `email` | String | Yes | Valid email format | Registered user's email address |
| `password` | String | Yes | Min 6 characters | User's password |

### Example Request

```bash
curl -X POST http://localhost:5000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

---

## Response

### Success Response (200 OK)

**Status Code:** `200`

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
      "value": "invalid-email",
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Common Validation Errors:**

| Error Message | Cause |
|---------------|-------|
| "Invalid Email" | `email` is not a valid email format |
| "Password should be at least 6 characters long" | `password` is less than 6 characters |

### 400 Bad Request - Invalid Credentials

**Status Code:** `400`

Returned when the email doesn't exist or the password is incorrect.

```json
{
  "error": "Invalid email or password"
}
```

**Note:** The error message is intentionally generic for security reasons (doesn't reveal whether email exists or password is wrong).

### 500 Internal Server Error

**Status Code:** `500`

Returned when an unexpected server error occurs during login.

```json
{
  "error": "Internal server error"
}
```

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200` | User successfully logged in. Returns JWT token and user data. |
| `400` | Bad request. Either validation failed or invalid credentials provided. |
| `500` | Internal server error. Contact support if issue persists. |

---

## Security Notes

- **Password Verification:** Passwords are compared using bcrypt (never stored in plain text)
- **Authentication Token:** JWT tokens are issued with 24-hour expiration
- **Credential Validation:** Generic error messages are used to prevent user enumeration attacks
- **Password Field:** Not returned in the response (never send passwords back to client)
- **HTTPS Recommended:** Always use HTTPS in production to protect credentials in transit

---

## Example Usage

### JavaScript/Node.js (using fetch)

```javascript
const loginUser = async () => {
  const credentials = {
    email: "john.doe@example.com",
    password: "password123"
  };

  try {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      // Store token in localStorage or sessionStorage
      localStorage.setItem('authToken', data.token);
    } else {
      console.error('Login failed:', data.error || data.errors);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Python (using requests)

```python
import requests

url = "http://localhost:5000/users/login"

payload = {
    "email": "john.doe@example.com",
    "password": "password123"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Login successful!")
    print("Token:", data['token'])
    print("User:", data['user'])
    # Store token for future authenticated requests
else:
    print("Login failed:", response.json())
```

---

## Notes

- Both `email` and `password` are required fields
- Email addresses are case-sensitive
- Credentials must match exactly (email exists and password is correct)
- The returned JWT token should be included in the Authorization header of subsequent requests: `Authorization: Bearer {token}`
- Tokens expire after 24 hours and users must login again to get a new token
- Failed login attempts are not rate-limited on the server (consider implementing rate limiting in production)

---

## User Profile Endpoint

### Endpoint: `/users/profile`

**Method:** `GET`

---

## Description

The `/users/profile` endpoint retrieves the current authenticated user's profile information. This is a protected endpoint that requires a valid JWT authentication token. The endpoint validates the provided token, retrieves the associated user information from the database, and returns the user's profile data.

---

## Request

### URL
```
GET /users/profile
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

OR (using cookies)
```
Content-Type: application/json
Cookie: token={token}
```

### Authentication
- **Required:** Yes
- **Method:** JWT Token (Bearer token in Authorization header or in cookies)
- **Token Source:** Received from `/users/register` or `/users/login` endpoint

### Request Parameters

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `token` | String | Yes | Header (Authorization: Bearer) or Cookie | Valid JWT authentication token |

### Example Request

```bash
curl -X GET http://localhost:5000/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

OR using cookies:

```bash
curl -X GET http://localhost:5000/users/profile \
  -H "Content-Type: application/json" \
  -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response

### Success Response (200 OK)

**Status Code:** `200`

```json
{
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
| `user._id` | String | Unique user identifier (MongoDB ObjectId) |
| `user.fullname.firstname` | String | User's first name |
| `user.fullname.lastname` | String | User's last name |
| `user.email` | String | User's email address |
| `user.socketId` | String/Null | Socket ID for real-time communication (null if not connected) |
| `user.__v` | Number | MongoDB version field |

---

## Error Responses

### 401 Unauthorized - No Token Provided

**Status Code:** `401`

Returned when the request lacks authentication credentials.

```json
{
  "error": "Access denied. No token provided."
}
```

### 401 Unauthorized - Invalid Token

**Status Code:** `401`

Returned when the provided token is invalid, expired, or malformed.

```json
{
  "error": "Invalid token"
}
```

### 401 Unauthorized - Token Blacklisted

**Status Code:** `401`

Returned when the token has been blacklisted (user has logged out).

```json
{
  "error": "Unauthorized"
}
```

### 401 Unauthorized - User Not Found

**Status Code:** `401`

Returned when the user associated with the token no longer exists in the database.

```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error

**Status Code:** `500`

Returned when an unexpected server error occurs.

```json
{
  "error": "Internal server error"
}
```

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200` | User profile successfully retrieved. Returns user data. |
| `401` | Unauthorized. No token provided, invalid token, or token blacklisted. |
| `500` | Internal server error. Contact support if issue persists. |

---

## Security Notes

- **Authentication Required:** This endpoint is protected and requires a valid JWT token
- **Token Validation:** Token is verified against the JWT secret
- **Blacklist Check:** The token is checked against the blacklist (tokens created before logout)
- **Password Field:** The password field is never returned in the response
- **Token Expiration:** Tokens expire after 24 hours and must be refreshed via re-login

---

## Example Usage

### JavaScript/Node.js (using fetch)

```javascript
const getUserProfile = async (token) => {
  try {
    const response = await fetch('/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('Profile retrieved successfully!');
      console.log('User:', data.user);
      return data.user;
    } else {
      console.error('Failed to retrieve profile:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
const token = localStorage.getItem('authToken');
getUserProfile(token);
```

### Python (using requests)

```python
import requests

url = "http://localhost:5000/users/profile"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Profile retrieved successfully!")
    print("User:", data['user'])
else:
    print("Failed to retrieve profile:", response.json())
```

---

## Notes

- This endpoint is read-only and does not modify user data
- The token must be included in every request to this endpoint
- Token can be provided either in the Authorization header as a Bearer token or in cookies
- The profile reflects the current state of the user in the database
- If user information has been updated by other processes, this endpoint returns the latest data

---

## User Logout Endpoint

### Endpoint: `/users/logout`

**Method:** `GET`

---

## Description

The `/users/logout` endpoint allows authenticated users to end their session and invalidate their authentication token. This is a protected endpoint that requires a valid JWT authentication token. The endpoint adds the token to a blacklist, preventing it from being used for future authenticated requests, and clears the authentication cookie from the client.

---

## Request

### URL
```
GET /users/logout
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {token}
```

OR (using cookies)
```
Content-Type: application/json
Cookie: token={token}
```

### Authentication
- **Required:** Yes
- **Method:** JWT Token (Bearer token in Authorization header or in cookies)
- **Token Source:** Received from `/users/register` or `/users/login` endpoint

### Request Parameters

| Parameter | Type | Required | Location | Description |
|-----------|------|----------|----------|-------------|
| `token` | String | Yes | Header (Authorization: Bearer) or Cookie | Valid JWT authentication token |

### Example Request

```bash
curl -X GET http://localhost:5000/users/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

OR using cookies:

```bash
curl -X GET http://localhost:5000/users/logout \
  -H "Content-Type: application/json" \
  -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response

### Success Response (200 OK)

**Status Code:** `200`

```json
{
  "message": "Logged out successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | String | Confirmation message indicating successful logout |

---

## Error Responses

### 400 Bad Request - No Token Found

**Status Code:** `400`

Returned when the token cannot be found in either the Authorization header or cookies.

```json
{
  "message": "Token not found"
}
```

### 401 Unauthorized - No Token Provided

**Status Code:** `401`

Returned when the request lacks authentication credentials.

```json
{
  "error": "Access denied. No token provided."
}
```

### 401 Unauthorized - Invalid Token

**Status Code:** `401`

Returned when the provided token is invalid, expired, or malformed.

```json
{
  "error": "Invalid token"
}
```

### 401 Unauthorized - Token Blacklisted

**Status Code:** `401`

Returned when the token has already been blacklisted (user has already logged out).

```json
{
  "error": "Unauthorized"
}
```

### 401 Unauthorized - User Not Found

**Status Code:** `401`

Returned when the user associated with the token no longer exists in the database.

```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error

**Status Code:** `500`

Returned when an unexpected server error occurs during logout.

```json
{
  "error": "Internal server error"
}
```

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200` | User successfully logged out. Token has been blacklisted. |
| `400` | Bad request. Token not found in request. |
| `401` | Unauthorized. No token provided, invalid token, or token already blacklisted. |
| `500` | Internal server error. Contact support if issue persists. |

---

## Security Notes

- **Authentication Required:** This endpoint is protected and requires a valid JWT token
- **Token Blacklisting:** The token is added to the blacklist upon logout, preventing future use
- **Cookie Clearing:** The authentication cookie is cleared from the client
- **One-Time Use:** Once a token is blacklisted, it cannot be reused even if valid
- **Immediate Effect:** Token invalidation takes effect immediately across all services

---

## Example Usage

### JavaScript/Node.js (using fetch)

```javascript
const logoutUser = async (token) => {
  try {
    const response = await fetch('/users/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.status === 200) {
      console.log('Logout successful!');
      console.log('Message:', data.message);
      
      // Clear stored token from localStorage or sessionStorage
      localStorage.removeItem('authToken');
      
      // Redirect to login page (example)
      window.location.href = '/login';
    } else {
      console.error('Logout failed:', data.error || data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage
const token = localStorage.getItem('authToken');
logoutUser(token);
```

### Python (using requests)

```python
import requests

url = "http://localhost:5000/users/logout"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}"
}

response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Logout successful!")
    print("Message:", data['message'])
    # Clear stored token
    # Redirect to login page
else:
    print("Logout failed:", response.json())
```

---

## Notes

- This endpoint terminates the user's session immediately
- The token becomes invalid for all future requests after logout
- Users must log in again to obtain a new valid token
- The logout operation is irreversible; the token cannot be reactivated
- Best practice is to clear the stored token from client-side storage after logout
- Users should be redirected to the login page after successful logout
- Multiple logout attempts with the same token will fail on the second attempt (token already blacklisted)

---

## Captain Registration Endpoint

### Endpoint: `/captains/register`

**Method:** `POST`

---

## Description

The `/captains/register` endpoint allows new captains (drivers) to create an account in the Uber-map application. Captains must provide their full name (first and last), email address, password, and vehicle information (color, plate number, capacity, and vehicle type). The endpoint validates all input data, hashes the password using bcrypt, creates a new captain record in the database, and returns an authentication token along with the captain information.

---

## Request

### URL
```
POST /captains/register
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
  "password": "string (required, min 6 characters)",
  "vehicle": {
    "color": "string (required, min 3 characters)",
    "plate": "string (required, min 3 characters)",
    "capacity": "number (required, min 1)",
    "vehicleType": "string (required, one of: 'car', 'auto', 'bike')"
  }
}
```

### Request Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|-----------|-------------|
| `fullname.firstname` | String | Yes | Min 3 characters | Captain's first name |
| `fullname.lastname` | String | No | Min 3 characters (if provided) | Captain's last name |
| `email` | String | Yes | Valid email format, unique | Captain's email address (must be unique in the system) |
| `password` | String | Yes | Min 6 characters | Captain's password (will be hashed with bcrypt) |
| `vehicle.color` | String | Yes | Min 3 characters | Vehicle color |
| `vehicle.plate` | String | Yes | Min 3 characters | Vehicle license plate number |
| `vehicle.capacity` | Number | Yes | Min 1 | Number of passengers the vehicle can accommodate |
| `vehicle.vehicleType` | String | Yes | One of: 'car', 'auto', 'bike' | Type of vehicle |

### Example Request

```bash
curl -X POST http://localhost:5000/captains/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": {
      "firstname": "Raj",
      "lastname": "Kumar"
    },
    "email": "raj.kumar@example.com",
    "password": "securePassword123",
    "vehicle": {
      "color": "white",
      "plate": "DL-01-AB-1234",
      "capacity": 4,
      "vehicleType": "car"
    }
  }'
```

---

## Response

### Success Response (201 Created)

**Status Code:** `201`

```json
{
  "message": "Captain created successfully",
  "captain": {
    "_id": "60d5ec49c1234567890abcde",
    "fullname": {
      "firstname": "Raj",
      "lastname": "Kumar"
    },
    "email": "raj.kumar@example.com",
    "vehicle": {
      "color": "white",
      "plate": "DL-01-AB-1234",
      "capacity": 4,
      "vehicleType": "car"
    },
    "status": "inactive",
    "socketId": null,
    "location": {
      "lat": null,
      "lng": null
    },
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | String | Success message |
| `captain._id` | String | Unique captain identifier (MongoDB ObjectId) |
| `captain.fullname.firstname` | String | Captain's first name |
| `captain.fullname.lastname` | String | Captain's last name |
| `captain.email` | String | Captain's email address |
| `captain.vehicle.color` | String | Vehicle color |
| `captain.vehicle.plate` | String | Vehicle license plate number |
| `captain.vehicle.capacity` | Number | Vehicle passenger capacity |
| `captain.vehicle.vehicleType` | String | Vehicle type (car, auto, or bike) |
| `captain.status` | String | Captain's current status ('active' or 'inactive', defaults to 'inactive') |
| `captain.socketId` | String/Null | Socket ID for real-time communication (null initially) |
| `captain.location.lat` | Number/Null | Captain's latitude location (null initially) |
| `captain.location.lng` | Number/Null | Captain's longitude location (null initially) |
| `token` | String | JWT authentication token (expires in 24 hours) |

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
      "msg": "First name must be at least 3 characters long",
      "path": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

**Common Validation Errors:**

| Error Message | Cause |
|---------------|-------|
| "First name must be at least 3 characters long" | `fullname.firstname` is less than 3 characters |
| "Last name must be at least 3 characters long" | `fullname.lastname` is provided but less than 3 characters |
| "Please provide a valid email address" | `email` is not a valid email format |
| "Password must be at least 6 characters long" | `password` is less than 6 characters |
| "Color must be at least 3 characters long" | `vehicle.color` is less than 3 characters |
| "Plate must be at least 3 characters long" | `vehicle.plate` is less than 3 characters |
| "Capacity must be at least 1" | `vehicle.capacity` is less than 1 |
| "Vehicle type must be either car, auto or bike" | `vehicle.vehicleType` is not one of the allowed types |

### 400 Bad Request - Duplicate Email

**Status Code:** `400`

Returned when attempting to register with an email that already exists in the system.

```json
{
  "message": "Captain with this email already exists"
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
| `201` | Captain successfully registered. Returns JWT token and captain data. |
| `400` | Bad request. Validation failed or email already exists. Check error messages for details. |
| `500` | Internal server error. Contact support if issue persists. |

---

## Security Notes

- **Password Hashing:** Passwords are hashed using bcrypt (salt rounds: 10) before storage
- **Authentication Token:** JWT tokens are issued with 24-hour expiration
- **Email Uniqueness:** Email addresses must be unique across all captains
- **Password Field:** The password field is not selected by default in captain queries (security best practice)
- **Initial Status:** New captains are created with 'inactive' status and must activate their account

---

## Example Usage

### JavaScript/Node.js (using fetch)

```javascript
const registerCaptain = async () => {
  const captainData = {
    fullname: {
      firstname: "Raj",
      lastname: "Kumar"
    },
    email: "raj.kumar@example.com",
    password: "securePassword123",
    vehicle: {
      color: "white",
      plate: "DL-01-AB-1234",
      capacity: 4,
      vehicleType: "car"
    }
  };

  try {
    const response = await fetch('/captains/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(captainData)
    });

    const data = await response.json();

    if (response.status === 201) {
      console.log('Registration successful!');
      console.log('Token:', data.token);
      console.log('Captain:', data.captain);
      // Store token in localStorage or sessionStorage
      localStorage.setItem('authToken', data.token);
    } else {
      console.error('Registration failed:', data.errors || data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Python (using requests)

```python
import requests

url = "http://localhost:5000/captains/register"

payload = {
    "fullname": {
        "firstname": "Raj",
        "lastname": "Kumar"
    },
    "email": "raj.kumar@example.com",
    "password": "securePassword123",
    "vehicle": {
        "color": "white",
        "plate": "DL-01-AB-1234",
        "capacity": 4,
        "vehicleType": "car"
    }
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 201:
    data = response.json()
    print("Registration successful!")
    print("Token:", data['token'])
    print("Captain:", data['captain'])
else:
    print("Registration failed:", response.json())
```

---

## Notes

- All fields in the request body are required except `fullname.lastname`
- Email addresses are case-sensitive and must be unique
- Passwords must be at least 6 characters long for security
- Vehicle type must be exactly one of: 'car', 'auto', or 'bike' (case-insensitive)
- The returned JWT token should be used for authenticated requests (typically stored in Authorization header as "Bearer {token}")
- Captain registrations are stored in MongoDB
- New captains start with 'inactive' status and zero location coordinates

---

**Last Updated:** June 9, 2026
