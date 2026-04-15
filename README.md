# TrackAcademia

TrackAcademia is split into three apps:

- `backend`: Express + Sequelize API
- `web`: Vite + React admin/professor portal
- `mobile`: Expo app for mobile users

This repo is now set up so someone can clone it from GitHub and run it locally on `localhost` without needing Render or Vercel.

## Clone And Run

### 1. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`.

```bash
npm run dev
```

Default local setup uses SQLite automatically, so no MySQL is required to get started.

If you want MySQL instead, fill these vars in `backend/.env`:

- `DB_DIALECT=mysql`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`

You must also set:

- `JWT_SECRET`

Local API health check:

```bash
http://localhost:5000/api/health
```

### 2. Web

```bash
cd web
npm install
```

Optional: copy `.env.example` to `.env` if you want to override the API URL.

```bash
npm run dev
```

By default, local web development talks to `http://localhost:5000/api`.

### 3. Mobile

```bash
cd mobile
npm install
```

For Android emulator, the app works out of the box against the local backend using `http://10.0.2.2:5000/api`.

For a physical phone on the same Wi-Fi:

```bash
npm run setup:local-api
npm start
```

That script auto-detects your computer's LAN IP and writes `mobile/.env` with:

```bash
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:5000/api
```

If you want the mobile app to use plain localhost in an environment that supports it, copy `mobile/.env.example` to `mobile/.env`.

### 4. Localhost Summary

- Backend local API: `http://localhost:5000/api`
- Web local app: runs with `npm run dev` and talks to `http://localhost:5000/api`
- Mobile emulator: uses local backend automatically
- Mobile physical phone: cannot use `localhost` directly; run `npm run setup:local-api` to generate a LAN URL instead

### 5. Deployment

Deployment is optional. If you want hosted versions later:

- Render backend: set the backend service root to `backend`
- Vercel web: set the project root to `web`
- Expo/EAS mobile: set `EXPO_PUBLIC_API_URL` to your deployed backend URL

### 6. Create The First Admin On A Fresh Deployment

The backend currently includes a temporary setup route for creating the first admin on a new deployed database.

After the backend is live, open:

```bash
https://YOUR-BACKEND-URL/api/setup?secret=SETUP_SECRET_DELETE_ME
```

Example:

```bash
https://trackacademia-backend.onrender.com/api/setup?secret=SETUP_SECRET_DELETE_ME
```

It will create or update this admin account:

- email: `admin@trackacademia.com`
- password: `admin123`

Important:

- use it once on a fresh deployment
- then delete the `/api/setup` route from `backend/src/index.js`
- redeploy the backend after removing it

## Files To Commit

Commit:

- source code
- `.env.example` files
- `package-lock.json`

Do not commit:

- real `.env` files
- generated SQLite files
- uploads

## Notes

- The backend currently includes a temporary `/api/setup` route in `backend/src/index.js` for first-admin creation on a fresh deployment. Delete that route after you use it in production.
- The web app uses a Vercel SPA rewrite in `web/vercel.json`, so browser refreshes on nested routes work after deployment.
