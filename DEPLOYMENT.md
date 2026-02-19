# Production Deployment Guide

This guide explains how to deploy the mymonthlybudgetplan MERN stack application to a DigitalOcean VPS with automated CI/CD.

## Architecture

```
Internet → Caddy (ports 80/443, auto-HTTPS)
            ├── / → Frontend static files (React/Vite SPA)
            └── /api/* → Backend API (Node.js/Express)
                           └── MongoDB Atlas (external)
```

## Prerequisites

1. **DigitalOcean VPS**
   - Ubuntu 24.04.4 LTS
   - Docker and Docker Compose installed
   - SSH access configured

2. **Domain**
   - Domain configured: `mymonthlybudgetplan.com`
   - DNS A record pointing to VPS IP

3. **MongoDB Atlas**
   - Cluster created
   - Database user configured
   - Connection string ready

4. **Firebase Project**
   - Firebase project created
   - Authentication enabled
   - Service account key generated (for backend)
   - Web app configuration (for frontend)

## Setup Instructions

### 1. Server Setup

SSH into your VPS and clone the repository:

```bash
ssh user@mmbp-prod
cd ~
git clone https://github.com/MuhammadHussnainShaker/mymonthlybudgetplan.git
cd mymonthlybudgetplan
git checkout deploy
```

### 2. Configure GitHub Secrets

Add the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

**VPS Connection:**
- `VPS_HOST` - Your VPS IP address or hostname (e.g., `123.45.67.89` or `mmbp-prod`)
- `VPS_USER` - SSH username (e.g., `root` or `ubuntu`)
- `VPS_SSH_KEY` - Private SSH key for authentication
- `VPS_PORT` - SSH port (default: `22`)

**Application Configuration:**
- `DOMAIN` - Your domain (e.g., `mymonthlybudgetplan.com`)
- `MONGODB_URI` - MongoDB Atlas connection string
- `CORS_ORIGIN` - CORS origin URL (e.g., `https://mymonthlybudgetplan.com`)
- `JWT_SECRET` - Strong random string for JWT signing

**Firebase Admin (Backend):**
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key (with newlines)

**Firebase Client (Frontend):**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional)

### 3. Initial Deployment

Create a `.env` file on your VPS using `.env.example` as a template:

```bash
cd ~/mymonthlybudgetplan
cp .env.example .env
nano .env  # Edit with your actual values
```

Start the services:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Check status:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Automated Deployments

Once GitHub Secrets are configured, any push to the `deploy` branch will automatically:

1. SSH into your VPS
2. Pull the latest code
3. Rebuild containers
4. Restart services
5. Show deployment logs

## Services

### Backend (mmbp-backend)
- **Port:** 3000 (internal only)
- **Health check:** `http://localhost:3000/api/health`
- **Environment:** Production (NODE_ENV=production)
- **Database:** MongoDB Atlas (external)

### Frontend (mmbp-frontend-build)
- **Build only service** - produces static files
- **Output:** `/app/dist` directory (mounted to volume)
- **Served by:** Caddy reverse proxy

### Caddy (mmbp-caddy)
- **Ports:** 80 (HTTP), 443 (HTTPS), 443/udp (HTTP/3)
- **Features:**
  - Auto-HTTPS via Let's Encrypt
  - Reverse proxy for backend API
  - Static file serving for frontend
  - Automatic HTTP → HTTPS redirect
  - GZIP/Zstd compression

## Useful Commands

### View logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f caddy
```

### Restart services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Rebuild after code changes
```bash
cd ~/mymonthlybudgetplan
git pull origin deploy
docker compose -f docker-compose.prod.yml up -d --build
```

### Stop services
```bash
docker compose -f docker-compose.prod.yml down
```

### View container status
```bash
docker compose -f docker-compose.prod.yml ps
```

## Troubleshooting

### Check Caddy certificate status
```bash
docker compose -f docker-compose.prod.yml exec caddy caddy list-certificates
```

### Force certificate renewal
```bash
docker compose -f docker-compose.prod.yml restart caddy
```

### Check backend connectivity to MongoDB
```bash
docker compose -f docker-compose.prod.yml exec backend wget -qO- http://localhost:3000/api/health
```

### View frontend build output
```bash
docker compose -f docker-compose.prod.yml logs frontend-build
```

### Check volume contents
```bash
docker volume inspect mymonthlybudgetplan_frontend-dist
```

## Security Notes

1. **Environment Variables:** Never commit `.env` files to git
2. **SSH Keys:** Use dedicated deployment keys with limited permissions
3. **MongoDB:** Ensure Atlas IP whitelist includes your VPS IP
4. **Firewall:** Only expose ports 22, 80, and 443
5. **Updates:** Regularly update Docker images and system packages

## Monitoring

### Health Checks

Backend health endpoint:
```bash
curl https://mymonthlybudgetplan.com/api/health
```

### Container Health
```bash
docker compose -f docker-compose.prod.yml ps
```

Healthy containers will show `healthy` in the STATUS column.

## Backup

### Database
MongoDB Atlas provides automated backups. Configure backup schedule in Atlas console.

### Caddy Certificates
Certificates are stored in the `caddy_data` volume and automatically renewed.

To backup:
```bash
docker run --rm -v mymonthlybudgetplan_caddy_data:/data -v $(pwd):/backup alpine tar czf /backup/caddy_data_backup.tar.gz /data
```

## Support

For issues related to:
- **Application code:** Open an issue on GitHub
- **Infrastructure:** Check DigitalOcean status page
- **MongoDB:** Check MongoDB Atlas status page
- **Domain/DNS:** Check name.com DNS settings
