# PetHome — Pet Adoption Platform (Server API)

## Purpose

REST API for the PetHome pet adoption platform. Handles user authentication (JWT + HTTP-only cookies), pet CRUD, adoption requests, search/filter with MongoDB operators, and owner approval workflows.

## Live URL

The API is deployed with the client on Vercel:

**Base URL:** [https://pet-adoption-client-alpha.vercel.app/api](https://pet-adoption-client-alpha.vercel.app/api)

**Health check:** [https://pet-adoption-client-alpha.vercel.app/api/health](https://pet-adoption-client-alpha.vercel.app/api/health)

For local development, the server runs on `http://localhost:5000`.

## Features

- **JWT authentication** stored in HTTP-only cookies with Bearer header fallback
- **Register, login, Google auth**, and logout endpoints
- **Pet CRUD** with owner-only update/delete
- **Adoption requests** — pending by default, approve/reject, only one approval per pet
- **Search & filter** using MongoDB `$regex` (name) and `$in` (species)
- **Owner protection** — pet owners cannot adopt their own listings
- **MongoDB Atlas** via secure environment variables
- **CORS** with credentials for cross-origin cookie auth
- **Seed script** for demo pets and sample data

## NPM Packages Used

| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT generation and verification |
| `bcryptjs` | Password hashing |
| `cookie-parser` | HTTP-only cookie parsing |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variable loading |
| `nodemon` | Dev auto-restart (dev dependency) |

## Environment Variables

Copy `.env.example` to `.env`:

- `PORT` — server port (default 5000)
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — secret key for JWT signing
- `CLIENT_URL` — frontend URL for CORS (optional)
- `NODE_ENV` — `development` or `production`

## Scripts

```bash
npm install
npm run dev    # development with nodemon
npm start      # production
npm run seed   # seed sample pets
```

## API Routes

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/google` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Private |
| GET | `/api/pets` | Public (search/filter/sort) |
| GET | `/api/pets/featured` | Public |
| GET | `/api/pets/:id` | Public |
| POST | `/api/pets` | Private |
| PUT | `/api/pets/:id` | Private (owner) |
| DELETE | `/api/pets/:id` | Private (owner) |
| GET | `/api/pets/my-listings` | Private |
| POST | `/api/adoptions` | Private |
| GET | `/api/adoptions/my-requests` | Private |
| GET | `/api/adoptions/pet/:petId` | Private (owner) |
| PATCH | `/api/adoptions/:id/approve` | Private (owner) |
| PATCH | `/api/adoptions/:id/reject` | Private (owner) |
| DELETE | `/api/adoptions/:id` | Private (requester) |

## Deploy

**Vercel (recommended):** Deploy the `client` repo — the API lives in `client/server/` and is served at `/api`.

**Render (alternative):** Use `render.yaml` — build `npm install`, start `npm start`, set env vars in dashboard.

## GitHub Repository

[pet-adoption-server](https://github.com/Rumman954/pet-adoption-server)
