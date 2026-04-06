# TrackTok Web - API Documentation

Complete API reference for TrackTok web application.

## Base URL

```
http://localhost:3000/api
https://your-domain.com/api  (production)
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## Response Format

All responses are JSON:

```json
{
  "message": "Operation description",
  "data": { /* response data */ }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0000",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f7a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `400` - Email already registered

---

### Login User

**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f7a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `401` - Invalid email or password
- `400` - Missing email or password

---

## 👤 User Endpoints

### Get User Profile

**GET** `/user/profile`

Retrieves authenticated user's profile.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "id": "64f7a1b2c3d4e5f6g7h8i9j0",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0000",
  "avatar": "https://...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found

---

### Update User Profile

**PUT** `/user/profile`

Updates user's profile information.

**Headers:**
```
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+1-555-1111"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - User not found

---

## 💰 Transaction Endpoints

### Get Transactions

**GET** `/transactions`

Retrieves user's transactions (last 50).

**Headers:**
```
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `limit` (optional) - Number of transactions to return (default: 50)
- `category` (optional) - Filter by category
- `type` (optional) - Filter by type (income/expense)
- `startDate` (optional) - Filter by start date (ISO format)
- `endDate` (optional) - Filter by end date (ISO format)

**Example:**
```
GET /transactions?limit=20&category=Food&type=expense
```

**Response:**
```json
{
  "transactions": [
    {
      "_id": "64f7a1b2c3d4e5f6g7h8i9j0",
      "userId": "64f7a1b2c3d4e5f6g7h8i9j0",
      "amount": 45.99,
      "description": "Grocery Store",
      "category": "Food",
      "type": "expense",
      "date": "2024-04-05T10:30:00Z",
      "notes": "Weekly groceries",
      "createdAt": "2024-04-05T10:30:00Z"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

### Create Transaction

**POST** `/transactions`

Creates a new transaction.

**Headers:**
```
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 45.99,
  "description": "Grocery Store",
  "category": "Food",
  "type": "expense",
  "date": "2024-04-05T10:30:00Z",
  "notes": "Weekly groceries",
  "location": "Whole Foods"
}
```

**Response:**
```json
{
  "message": "Transaction created",
  "id": "64f7a1b2c3d4e5f6g7h8i9j0"
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized

---

### Update Transaction

**PUT** `/transactions/:id`

Updates an existing transaction.

**Headers:**
```
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Whole Foods Market"
}
```

**Response:**
```json
{
  "message": "Transaction updated successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Transaction not found

---

### Delete Transaction

**DELETE** `/transactions/:id`

Deletes a transaction.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "message": "Transaction deleted successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Transaction not found

---

## 📊 Analytics Endpoints

### Get Analytics

**GET** `/analytics`

Retrieves spending analytics for the current month.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "totalIncome": 3500.00,
  "totalExpense": 1256.75,
  "balance": 2243.25,
  "categoryBreakdown": [
    {
      "category": "Food",
      "amount": 250.00,
      "percentage": "19.9"
    },
    {
      "category": "Transportation",
      "amount": 150.00,
      "percentage": "11.9"
    }
  ],
  "period": "current_month"
}
```

**Errors:**
- `401` - Unauthorized

---

### Get Monthly Analytics

**GET** `/analytics/monthly`

Retrieves monthly breakdown for the past 12 months.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "data": [
    {
      "month": "2024-01",
      "income": 3500,
      "expense": 1200,
      "balance": 2300
    },
    {
      "month": "2024-02",
      "income": 3500,
      "expense": 1400,
      "balance": 2100
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

### Get Category Analytics

**GET** `/analytics/categories`

Retrieves detailed breakdown by category.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `type` (optional) - Filter by income/expense
- `months` (optional) - Number of months to analyze (default: 1)

**Response:**
```json
{
  "categories": [
    {
      "name": "Food",
      "total": 250.00,
      "percentage": 19.9,
      "transactions": 12
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

## 💳 Account Endpoints

### Get Accounts

**GET** `/accounts`

Retrieves user's linked accounts.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "accounts": [
    {
      "_id": "64f7a1b2c3d4e5f6g7h8i9j0",
      "accountName": "Checking Account",
      "accountType": "bank",
      "balance": 5420.50,
      "currency": "USD",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

### Create Account

**POST** `/accounts`

Links a new account.

**Headers:**
```
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "accountName": "Savings Account",
  "accountType": "bank",
  "balance": 10000.00,
  "currency": "USD"
}
```

**Response:**
```json
{
  "message": "Account created",
  "id": "64f7a1b2c3d4e5f6g7h8i9j0"
}
```

**Errors:**
- `400` - Missing required fields
- `401` - Unauthorized

---

## Error Response Example

```json
{
  "message": "Invalid email or password",
  "status": 401
}
```

---

## 🔄 Rate Limiting

- Standard: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes

---

## 📚 Example Usage

### Using Curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# Get Profile (using token from login response)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/profile

# Get Transactions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/transactions

# Create Transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 45.99,
    "description": "Grocery Store",
    "category": "Food",
    "type": "expense",
    "date": "2024-04-05T10:30:00Z"
  }'

# Get Analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/analytics
```

### Using JavaScript/Fetch

```javascript
// Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePassword123'
  })
});

const { token } = await loginRes.json();

// Get Profile
const profileRes = await fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const profile = await profileRes.json();
console.log(profile);

// Get Transactions
const transactionsRes = await fetch('/api/transactions', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { transactions } = await transactionsRes.json();
console.log(transactions);
```

---

## 🆘 API Support

For issues:
- Check the response status code
- Review error messages
- Verify your token is valid
- Ensure required fields are provided
- Check request format matches examples

---

**API Version**: 1.0.0  
**Last Updated**: April 5, 2024
