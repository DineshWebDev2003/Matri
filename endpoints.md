# 90skalyanam Mobile App - API Endpoints Documentation

**Base URL:** `https://app.90skalyanam.com/api`

## 📱 Mobile App API Integration Guide

### Authentication Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /login
```
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "remark": "login_success",
  "status": "success",
  "message": {"success": ["Login successful"]},
  "data": {
    "access_token": "token_here",
    "user": {...}
  }
}
```

### Register
```http
POST /register
```
**Body (Form-encoded):**
```
firstname=string&lastname=string&email=string&username=string&password=string&password_confirmation=string&mobile=string&country_code=string
```

### Logout
```http
GET /logout
```

---

## 👤 User Profile Endpoints

### Get User Info
```http
GET /user-info
```
**Used in:** Profile screens, user dashboard

### Get Dashboard Data
```http
GET /dashboard
```
**Used in:** Home screen, user stats

### Update Profile
```http
POST /profile-setting
```
**Body:**
```json
{
  "firstname": "string",
  "lastname": "string",
  "address": "string",
  "state": "string",
  "city": "string",
  "zip": "string"
}
```

### Change Password
```http
POST /change-password
```
**Body:**
```json
{
  "current_password": "string",
  "password": "string",
  "password_confirmation": "string"
}
```

---

## 👥 Member/Profile Discovery Endpoints

### Get Members List
```http
GET /members
```
**Query Parameters:**
- `type`: `newly_joined`, `new_matches`, `premium`
- `per_page`: Number (default: 8)

**Used in:** 
- Home screen (newly joined, new matches)
- Profiles listing page
- Premium member filtering

**Mobile App Usage:**
```typescript
// Get newly joined members
apiService.getProfiles({ type: 'newly_joined', limit: 8 })

// Get new matches
apiService.getProfiles({ type: 'new_matches', limit: 8 })

// Get premium members
apiService.getProfiles({ type: 'premium', limit: 10 })
```

### Get Individual Member
```http
GET /members/{id}
```
**Used in:** Profile detail screen

**Mobile App Usage:**
```typescript
apiService.getProfile(memberId)
```

### Search Members
```http
GET /members/search
```
**Query Parameters:**
- `search`: Name/username search
- `age`: Age range (e.g., "25-30")
- `religion`: Religion filter
- `per_page`: Number (default: 8)

**Used in:** Search functionality, advanced filters

**Mobile App Usage:**
```typescript
apiService.getProfiles({ 
  search: 'john', 
  type: 'search',
  limit: 10 
})
```

---

## 🌍 General Data Endpoints

### Get General Settings
```http
GET /general-setting
```
**Used in:** App configuration, settings

### Get Countries List
```http
GET /get-countries
```
**Used in:** Registration form, profile setup

---

## 🔍 KYC & Verification Endpoints

### Get KYC Form
```http
GET /kyc-form
```

### Submit KYC
```http
POST /kyc-submit
```

### Verify Email
```http
POST /verify-email
```
**Body:**
```json
{
  "code": "string"
}
```

### Verify Mobile
```http
POST /verify-mobile
```
**Body:**
```json
{
  "code": "string"
}
```

---

## 💳 Payment Endpoints

### Get Deposit Methods
```http
GET /deposit/methods
```

### Get Deposit History
```http
GET /deposit/history
```
**Query Parameters:**
- `search`: Transaction ID search

---

## 📱 Mobile App Current Integration

### ✅ Currently Integrated Endpoints:
1. **Authentication:** `/login`, `/register`, `/logout`
2. **User Data:** `/user-info`, `/dashboard`
3. **Member Discovery:** `/members`, `/members/{id}`, `/members/search`
4. **Profile Management:** `/profile-setting`, `/change-password`
5. **General Data:** `/general-setting`, `/get-countries`

### 🔄 Data Transformation
The mobile app uses `transformMemberToProfile()` function to convert backend data to mobile app format:

**Backend Response → Mobile App Format:**
- `basic_info.religion.name` → `religion`
- `physical_attributes.height` → `height`
- `career_info[0].designation` → `job`
- `family.father_name` → `fatherName`
- Image URLs automatically prefixed with `https://app.90skalyanam.com/assets/images/`

### 📊 Response Format
All endpoints return consistent JSON structure:
```json
{
  "remark": "endpoint_identifier",
  "status": "success|error",
  "message": {
    "success": ["Success message"] | "error": ["Error message"]
  },
  "data": {
    // Endpoint specific data
  }
}
```

### 🎯 Key Mobile App Features Using APIs:

1. **Home Screen:**
   - Newly joined members: `GET /members?type=newly_joined`
   - New matches: `GET /members?type=new_matches`

2. **Profiles Screen:**
   - All profiles: `GET /members`
   - Search: `GET /members/search?search=query`

3. **Profile Detail:**
   - Individual profile: `GET /members/{id}`

4. **User Profile:**
   - User info: `GET /user-info`
   - Update profile: `POST /profile-setting`

5. **Authentication:**
   - Login: `POST /login`
   - Register: `POST /register`

---

## 🚀 Implementation Notes

1. **Token Management:** Automatically handled by axios interceptor
2. **Error Handling:** Consistent error responses with user-friendly messages
3. **Image URLs:** All profile images use app.90skalyanam.com domain
4. **Pagination:** Supported on member listing endpoints
5. **Real Data:** No mock/simulated data - 100% real API integration

## 🔧 Development Status
- ✅ Authentication flow complete
- ✅ Member discovery complete
- ✅ Profile management complete
- ✅ Real data integration complete
- ✅ Error handling implemented
- ✅ Token management automated
