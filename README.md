# Social Media App – REST API

Node.js + Express 5 + TypeScript + MongoDB (Mongoose) social media backend with JWT authentication.

## Setup

```bash
npm install
cp .env.example .env.development   # then fill in real values
npm run start:dev                  # tsc --watch + nodemon on dist/index.js
```

Production: create `.env.production`, then `npm run build && npm start`.

> `.env.*` files are git-ignored. Only `.env.example` (no secrets) is committed.

| Variable         | Description                      |
| ---------------- | -------------------------------- |
| `PORT`           | Server port                      |
| `MONGO_URI`      | MongoDB connection string        |
| `JWT_SECRET`     | Secret used to sign JWTs         |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1d`)       |
| `SALT_ROUNDS`    | bcrypt salt rounds               |

## Project structure

```
src/
├── index.ts                 # entry point
├── app.bootstrap.ts         # express app, middlewares, routers
├── common/
│   ├── config/              # env loading
│   ├── middleware/          # auth (JWT) + global error handler
│   ├── types/               # req.user typing
│   └── utils/               # bcrypt + jwt helpers
├── DB/
│   ├── connectionDB.ts
│   ├── models/              # User, Post
│   └── repositories/        # generic DatabaseRepository + User/Post repos
└── modules/
    ├── auth/                # routes / controller / service / validation
    ├── users/
    └── post/
```

## Authentication

Protected routes (🔒) need the header:

```
Authorization: Bearer <token>
```

You get the token from `signup` or `login`.

## Endpoints

### Auth – `/api/auth`

| Method | Endpoint  | Body                                              | Description      |
| ------ | --------- | ------------------------------------------------- | ---------------- |
| POST   | `/signup` | `username, email, password, confirmPassword`      | Create account   |
| POST   | `/login`  | `email, password`                                 | Get a JWT        |

### Users – `/api/users`

| Method | Endpoint             | Auth | Body                                         | Description                      |
| ------ | -------------------- | ---- | -------------------------------------------- | -------------------------------- |
| GET    | `/profile`           | 🔒   | –                                            | My profile                       |
| PATCH  | `/profile`           | 🔒   | `username?, bio?, profilePicture?`           | Update my profile                |
| PATCH  | `/profile/password`  | 🔒   | `oldPassword, newPassword, confirmPassword`  | Change password (returns new token, old tokens are revoked) |
| DELETE | `/profile`           | 🔒   | –                                            | Delete my account (+ my posts, likes, comments) |
| GET    | `/:id`               |      | –                                            | Get user by id                   |
| GET    | `/:id/posts`         |      | –                                            | Posts of a user                  |
| GET    | `/:id/followers`     |      | –                                            | Followers of a user              |
| GET    | `/:id/following`     |      | –                                            | Who a user follows               |
| PATCH  | `/:id/follow`        | 🔒   | –                                            | Follow user                      |
| PATCH  | `/:id/unfollow`      | 🔒   | –                                            | Unfollow user                    |

### Posts – `/api/posts`

| Method | Endpoint                      | Auth | Body               | Description                                   |
| ------ | ----------------------------- | ---- | ------------------ | --------------------------------------------- |
| GET    | `/?page=1&limit=20`           |      | –                  | All posts (paginated, newest first)           |
| GET    | `/feed?page=1&limit=20`       | 🔒   | –                  | Posts from people I follow + mine             |
| GET    | `/:id`                        |      | –                  | Single post with author & comments            |
| POST   | `/`                           | 🔒   | `content, image?`  | Create post                                   |
| PATCH  | `/:id`                        | 🔒   | `content?, image?` | Update post (owner only)                      |
| DELETE | `/:id`                        | 🔒   | –                  | Delete post (owner only)                      |
| PATCH  | `/:id/like`                   | 🔒   | –                  | Like / unlike (toggle)                        |
| POST   | `/:id/comments`               | 🔒   | `text`             | Add comment                                   |
| DELETE | `/:id/comments/:commentId`    | 🔒   | –                  | Delete comment (comment owner or post owner)  |

## Error format

```json
{ "status": "fail", "message": "Post not found", "statusCode": 404 }
```

Handled cases: validation (400), invalid ObjectId (400), unauthenticated / bad or expired token (401), not owner (403), not found (404), duplicate email/username (409), rate limit (429).
