# Frontend Configuration for Deployed Backend

Your backend is deployed at: `https://att-manageo-back-office-tx84.vercel.app`

## 1. Update Frontend API Configuration

In your frontend project, update the API base URL:

### File: `frontend/src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://att-manageo-back-office-tx84.vercel.app'
```

### File: `frontend/.env`

```env
VITE_API_URL=https://att-manageo-back-office-tx84.vercel.app
```

### File: `frontend/.env.production`

```env
VITE_API_URL=https://att-manageo-back-office-tx84.vercel.app
```

## 2. Update Vite Configuration (if using proxy)

### File: `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, '../shared')
    }
  },
  server: {
    port: 3000,
    // Remove or comment out the proxy in production
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:3001',
    //     changeOrigin: true
    //   }
    // }
  }
})
```

## 3. Test Your Backend

Test these endpoints to make sure your backend is working:

- **Root**: https://att-manageo-back-office-tx84.vercel.app/
- **Health Check**: https://att-manageo-back-office-tx84.vercel.app/api/health
- **Test Excel**: https://att-manageo-back-office-tx84.vercel.app/api/test/excel

## 4. Update CORS in Backend (Already Done)

The backend CORS has been updated to accept requests from:
- Any Vercel app (*.vercel.app)
- localhost:3000 and localhost:5173 (for development)

## 5. Deploy Frontend to Vercel

When you deploy your frontend to Vercel, make sure to:

1. Set the environment variable `VITE_API_URL=https://att-manageo-back-office-tx84.vercel.app`
2. Update the backend CORS to include your frontend domain

## 6. Example API Calls

```typescript
// Login example
const response = await fetch('https://att-manageo-back-office-tx84.vercel.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'admin@att-forms.com',
    password: 'admin123'
  })
});

// Get forms example
const formsResponse = await fetch('https://att-manageo-back-office-tx84.vercel.app/api/forms', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  credentials: 'include'
});
```

## 7. Important Notes

- **HTTPS Only**: Your backend only accepts HTTPS requests in production
- **CORS**: Make sure your frontend domain is added to the CORS whitelist
- **Environment Variables**: Use environment variables for the API URL
- **Credentials**: Include credentials in requests for authentication