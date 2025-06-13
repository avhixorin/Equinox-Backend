
# 📘 GraphQL & REST API Documentation

This document provides a complete overview of the GraphQL API (queries, mutations, types, subscriptions) and REST API routes for frontend integration.

---

## 🧠 GraphQL Schema Reference

### 📌 Type Definitions

#### `User`
```graphql
type User {
  id: ID!
  email: String!
  name: String
  profileImgUrl: String
}
```

#### `MiniNews`
```graphql
type MiniNews {
  id: ID!
  title: String!
  content: String
  pubDate: String
  source: String
  imageUrl: String
  newsId: String!
  category: String!
}
```

#### `News`
```graphql
type News {
  id: ID!
  category: String!
  childNews: [MiniNews]!
}
```

#### `Subscription`
```graphql
type Subscription {
  newlyAddedNews: String!
}
```

---
### `graphql route - backend_base_url/graphql`

### 🔍 Queries

#### `getUserToken(email: String!, password: String!): String`
- **Purpose:** To login the User.
- **Returns:** JWT token as `String`.

#### `getCurrentLoggedInUser: User`
- **Purpose:** Fetch the currently authenticated user details.

#### `getNews(query: String, lim: Int, offset: Int): [MiniNews]!`
- **Purpose:** Fetch news with optional search query, limit and offset.

#### `getNewsByCategory(query: String, category: String!, lim: Int, offset: Int): [MiniNews]!`
- **Purpose:** Fetch news filtered by category.

#### `getNewsOfSameParent(query: String, parentNewsId: String!, lim: Int, offset: Int): [MiniNews]!`
- **Purpose:** Fetch grouped news items (child news under a parent).

#### `getBookmarks(limit: Int!, offset: Int!): [MiniNews]!`
- **Purpose:** Fetch user's bookmarked articles.

---

### ✏️ Mutations

#### `createUser(email: String!, password: String!): String!`
- **Purpose:** Register a new user.
- **Returns:** JWT token.

#### `updateUserName(newUserName: String): String!`
- **Purpose:** Update current user's username.

#### `notifyAddedNews: String!`
- **Purpose:** Notify subscribers about newly added news.

#### `createBookmark(miniNewsId: String): String!`
- **Purpose:** Add an article to bookmarks.

#### `deleteBookmark(miniNewsId: String): String!`
- **Purpose:** Remove an article from bookmarks.

#### `deleteAllBookmarks: String!`
- **Purpose:** Clear all bookmarks.

---

### 📡 Subscriptions

#### `newlyAddedNews: String!`
- **Purpose:** Real-time push for newly added news notifications.

---

## 🌐 REST API Endpoints

### `All RestApi_base_url = backend_base_url/api/v1`



### `GET RestApi_base_url/oauth/login-register/google`
- **Purpose:** Returns Google OAuth login URL.
- **Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### `GET RestApi_base_url/oauth/callback/google?code=${You_Will_Get_It_After_OauthConsent_Screen}`
- **Purpose:** Handles Google OAuth callback, creates user if needed, and returns a JWT token.
- **Response:**
```json
{
  "token": "JWT_TOKEN_HERE"
}
```

### `PUT RestApi_base_url/user/update-profileImg`
- **Middleware:** `verifyJWT`, `upload.single('profilepic')`
- **Purpose:** Uploads a new profile image to Cloudinary and updates user in DB.
- **Response:**
```json
{
  "data": "https://cloudinary.com/profile-img.jpg",
  "message": "profile image successfully updated"
}
```

---

## 🔐 Notes

- All protected routes require `Authorization: <token>` header.(No Bearer in front of Token)
- Bookmark operations, user updates, and profile uploads are secured.

---

**Generated on:** June 13, 2025 at 16:17
