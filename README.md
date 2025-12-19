# Social Media App 2.0 - Backend API

A Node.js/Express REST API backend for a social media application with user authentication, posts, comments, likes, and file upload functionality.

## 📁 Project Structure

```
backend/
├── app.js                      # Main application entry point
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── .nvmrc                      # Node version specification
│
├── config/
│   └── constants.json          # Application constants & encoding keys
│
├── constants/
│   └── roles.js                # Role definitions (SUPERADMIN, ADMIN, USER)
│
├── db/
│   ├── migrations.sql          # Database migration scripts
│   ├── schemas/
│   │   ├── schUsers.js         # User model
│   │   ├── schRoles.js         # Roles model
│   │   ├── schPosts.js         # Posts model
│   │   ├── schComments.js      # Comments model
│   │   ├── schLikes.js         # Likes model
│   │   ├── file.js             # File model
│   │   ├── schAuthorizations.js# Auth tokens model
│   │   ├── schTemppass.js      # Temp password tokens
│   │   ├── schSubscription.js  # Subscription model
│   │   ├── schIntent_logs.js   # Stripe intent logs
│   │   └── schWhookslogs.js    # Webhook logs
│   └── sequelize/
│       ├── sequelize.js        # Sequelize configuration
│       └── associations.js     # Model relationships
│
├── docs/
│   └── Social_Media_App_API.postman_collection.json  # Postman API Collection
│
├── helpers/
│   └── common.js               # Common utility functions
│
├── middleware/
│   ├── auth.js                 # JWT/Token authentication middleware
│   ├── checkRole.js            # Role-based authorization middleware
│   ├── checkRoleForCreation.js # Role validation for user creation
│   ├── multer.js               # File upload configuration
│   ├── response_handler.js     # Standardized response handling
│   └── verifyAuth.js           # Alternative auth verification
│
├── src/modules/
│   ├── users/
│   │   ├── app.js              # User module router
│   │   ├── routes/rtUsers.js   # User routes (public & protected)
│   │   ├── controllers/
│   │   │   ├── ctrlUsers.js    # User controller
│   │   │   └── ctrlUserStripe.js # Stripe subscription controller
│   │   ├── services/srvcUsers.js # User service layer
│   │   └── validations/
│   │       ├── valUser.js      # User validation rules
│   │       └── validation.js   # Validation middleware
│   │
│   ├── posts/
│   │   ├── app.js              # Posts module router
│   │   ├── routes/rtPosts.js   # Post routes
│   │   ├── controllers/ctrlPosts.js
│   │   ├── services/srvcPosts.js
│   │   └── validations/valdPosts.js
│   │
│   ├── comments/
│   │   ├── app.js              # Comments module router
│   │   ├── routes/rtComments.js
│   │   ├── controllers/ctrlComments.js
│   │   ├── services/srvcComments.js
│   │   └── validations/valdComments.js
│   │
│   ├── likes/
│   │   ├── app.js              # Likes module router
│   │   ├── routes/rtLikes.js
│   │   ├── controllers/ctrlLikes.js
│   │   ├── services/srvcLikes.js
│   │   └── validations/valdLikes.js
│   │
│   └── files/
│       ├── app.js              # Files module router
│       ├── routes/rtFiles.js
│       ├── controllers/ctrlFiles.js
│       └── services/srvcFiles.js
│
├── utils/
│   └── (utility functions)
│
└── __tests__/
    └── users.test.js           # User tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- MySQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your database in .env
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=social_media_app

# Start development server
npm run dev

# Or start production server
npm start
```

### Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=social_media_app
STRIPE_SECRET_KEY=sk_test_xxx  # Optional, for subscriptions
```

## 📡 API Endpoints

### Base URL

- Development: `http://localhost:3000`

### Authentication

Protected routes require an `Authorization` header with the access token:

```
Authorization: <access_token>
```

---

## 👤 User Routes

### Public Routes (No Auth Required)

| Method | Endpoint                         | Description                                            |
| ------ | -------------------------------- | ------------------------------------------------------ |
| POST   | `/api/v1/user/create`            | Register a new user                                    |
| POST   | `/api/v1/user/login`             | Login and get tokens                                   |
| POST   | `/api/v1/user/forgotPassword`    | Request password reset                                 |
| POST   | `/api/v1/user/updatePassword`    | Reset password (requires x-reset-token header)         |
| POST   | `/api/v1/user/Refresh-Token`     | Get new access token (requires x-refresh-token header) |
| POST   | `/api/v1/user/getAllUsers`       | Get all users                                          |
| POST   | `/api/v1/user/getUserTotalCount` | Get total user count                                   |
| POST   | `/api/v1/user/subscribe`         | Create Stripe subscription intent                      |

### Protected Routes (Auth Required)

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| POST   | `/api/v1/user/get-user`    | Get current user profile |
| POST   | `/api/v1/user/update`      | Update user profile      |
| POST   | `/api/v1/user/updateEmail` | Update email address     |
| POST   | `/api/v1/user/soft-delete` | Soft delete user account |

---

## 📝 Post Routes (All Protected)

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/v1/posts/create`      | Create a new post        |
| POST   | `/api/v1/posts/list`        | Get all posts (feed)     |
| POST   | `/api/v1/posts/get`         | Get post by ID           |
| POST   | `/api/v1/posts/update`      | Update a post            |
| POST   | `/api/v1/posts/soft-delete` | Delete a post            |
| POST   | `/api/v1/posts/user-posts`  | Get current user's posts |

---

## 💬 Comment Routes (All Protected)

| Method | Endpoint                      | Description                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| POST   | `/api/v1/comments/add`        | Add a comment (supports replies via parentId) |
| POST   | `/api/v1/comments/getby-post` | Get comments by post ID                       |
| POST   | `/api/v1/comments/edit`       | Edit a comment                                |
| POST   | `/api/v1/comments/delete`     | Delete a comment                              |
| POST   | `/api/v1/comments/like`       | Toggle like on comment                        |

---

## ❤️ Like Routes (All Protected)

| Method | Endpoint                                        | Description                 |
| ------ | ----------------------------------------------- | --------------------------- |
| POST   | `/api/v1/likes/toggle`                          | Toggle like on post/comment |
| POST   | `/api/v1/likes/toggleComment`                   | Toggle like on comment      |
| POST   | `/api/v1/likes/post/:postId`                    | Get likes by post           |
| POST   | `/api/v1/likes/comment/:commentId`              | Get likes by comment        |
| POST   | `/api/v1/likes/user/:userId`                    | Get likes by user           |
| POST   | `/api/v1/likes/user/:userId/post/:postId`       | Check if user liked post    |
| POST   | `/api/v1/likes/user/:userId/comment/:commentId` | Check if user liked comment |
| POST   | `/api/v1/likes/post/:postId/count`              | Count likes on post         |

---

## 📁 File Routes (All Protected)

| Method | Endpoint               | Description                     |
| ------ | ---------------------- | ------------------------------- |
| POST   | `/api/v1/files/upload` | Upload files (max 2, form-data) |

---

## 🔐 Role-Based Access Control

The application supports three roles:

| Role       | ID  | Description           |
| ---------- | --- | --------------------- |
| SUPERADMIN | 1   | Full system access    |
| ADMIN      | 2   | Administrative access |
| USER       | 3   | Standard user access  |

### Using Role Middleware

```javascript
const { checkRole, isAdmin, isSuperAdmin } = require('../middleware/checkRole');
const authMiddleware = require('../middleware/auth');

// Only superadmin can access
router.post('/admin-only', authMiddleware, isSuperAdmin, controller);

// Admin or superadmin can access
router.post('/staff', authMiddleware, isAdmin, controller);

// Custom role check
router.post('/custom', authMiddleware, checkRole([ROLES.ADMIN, ROLES.USER]), controller);
```

---

## 📮 Postman Collection

Import the Postman collection from:

```
docs/Social_Media_App_API.postman_collection.json
```

The collection includes:

- All API endpoints organized by module
- Pre-configured request bodies
- Auto-saving of tokens to collection variables
- Detailed endpoint descriptions

### Quick Start with Postman

1. Import the collection
2. Set `base_url` variable (default: `http://localhost:3000`)
3. Run "Create User" to register
4. Run "Login" - tokens are automatically saved
5. Use other endpoints - Authorization header is auto-populated

---

## 🛠️ Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm test         # Run tests with coverage
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint issues
```

---

## 📊 Database

The application uses MySQL with Sequelize ORM. Tables are auto-synced on startup.

### Main Tables

- `users` - User accounts
- `roles` - User roles
- `posts` - User posts
- `comments` - Post comments (supports nested replies)
- `likes` - Likes on posts and comments
- `files` - Uploaded file metadata
- `authorizations` - Access/refresh tokens
- `temp_tokens` - Password reset tokens

---

## 🔄 Response Format

All API responses follow a standardized format handled by the `response_handler` middleware.

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📝 License

ISC
