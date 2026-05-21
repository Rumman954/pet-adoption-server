# PawHome — Server (Pet Adoption API)

Express + MongoDB backend with JWT authentication via HTTP-only cookies.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `NODE_ENV`

## Scripts

```bash
npm install
npm run dev
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

## Deploy (Render)

- Build command: `npm install`
- Start command: `npm start`
- Set all environment variables in Render dashboard
