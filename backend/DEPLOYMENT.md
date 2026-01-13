# Vercel Deployment Guide

## Prerequisites

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`

## Environment Variables

Set these environment variables in Vercel dashboard:

```bash
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
```

## Deployment Steps

### 1. From the backend directory:

```bash
cd backend
vercel
```

### 2. Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N** (for first deployment)
- Project name: `att-forms-backend`
- Directory: `./` (current directory)

### 3. Set environment variables:

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

### 4. Deploy:

```bash
vercel --prod
```

## Important Notes

### Database Setup
- Make sure your Neon database is accessible from Vercel
- Run `npx prisma db push` to sync your schema
- The `vercel-build` script will automatically run `prisma generate`

### File Uploads
- Vercel serverless functions don't support file system writes
- Excel files are generated in memory and returned as buffers
- Consider using cloud storage (AWS S3, Cloudinary) for persistent file storage

### CORS Configuration
- Update the CORS origins in `api/index.ts` with your frontend domain
- Add your Vercel frontend URL to the allowed origins

### Function Limits
- Vercel free tier has 10-second execution limit
- Pro tier has 60-second limit
- Large Excel files might need optimization

## Testing

After deployment, test these endpoints:

- `https://your-backend.vercel.app/` - Root endpoint
- `https://your-backend.vercel.app/api/health` - Health check
- `https://your-backend.vercel.app/api/auth/login` - Login endpoint

## Troubleshooting

### Common Issues:

1. **Database Connection**: Ensure DATABASE_URL is correct and accessible
2. **CORS Errors**: Update allowed origins in the CORS configuration
3. **Function Timeout**: Optimize database queries and Excel generation
4. **Environment Variables**: Double-check all required env vars are set

### Logs:
```bash
vercel logs your-deployment-url
```

### Redeploy:
```bash
vercel --prod
```