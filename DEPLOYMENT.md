# TrackTok Web - Deployment Guide

Complete guide for deploying TrackTok to production.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Easy, fast, free tier available, auto-scaling
**Cons**: Vendor lock-in

#### Step-by-Step

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/tracktok-web.git
   git push -u origin main
   ```

3. **Import Project**
   - Go to Vercel dashboard
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure Environment Variables**
   - In Vercel, go to Settings → Environment Variables
   - Add these variables:
     ```
     MONGODB_URI=your_mongodb_atlas_url
     JWT_SECRET=generate_strong_random_string
     NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Option 2: Docker + AWS/GCP/DigitalOcean

**Pros**: Full control, scalable, cost-effective
**Cons**: More setup required

#### AWS ECS Deployment

1. **Build Docker Image**
   ```bash
   docker build -t tracktok:1.0.0 .
   ```

2. **Push to ECR**
   ```bash
   # Create ECR repository
   aws ecr create-repository --repository-name tracktok

   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

   # Tag image
   docker tag tracktok:1.0.0 [account-id].dkr.ecr.us-east-1.amazonaws.com/tracktok:1.0.0

   # Push image
   docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/tracktok:1.0.0
   ```

3. **Create ECS Task Definition**
   ```json
   {
     "family": "tracktok",
     "containerDefinitions": [
       {
         "name": "tracktok",
         "image": "[account-id].dkr.ecr.us-east-1.amazonaws.com/tracktok:1.0.0",
         "memory": 512,
         "cpu": 256,
         "essential": true,
         "portMappings": [
           {
             "containerPort": 3000,
             "hostPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "MONGODB_URI",
             "value": "your_mongodb_uri"
           },
           {
             "name": "JWT_SECRET",
             "value": "your_jwt_secret"
           },
           {
             "name": "NEXT_PUBLIC_API_URL",
             "value": "https://your-domain.com"
           }
         ]
       }
     ]
   }
   ```

4. **Create ECS Service**
   - Go to AWS ECS Console
   - Create cluster
   - Create service using the task definition
   - Configure load balancer
   - Deploy

#### DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to https://www.digitalocean.com

2. **Connect GitHub**
   - Go to App Platform
   - Click "Create App"
   - Connect GitHub account
   - Select repository

3. **Configure**
   - Set build command: `npm install && npm run build`
   - Set run command: `npm start`
   - Add environment variables
   - Configure MongoDB database

4. **Deploy**
   - Click "Deploy"

### Option 3: Traditional VPS (DigitalOcean Droplet, Linode, etc.)

#### Ubuntu 22.04 Setup

1. **Connect to Server**
   ```bash
   ssh root@your_server_ip
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/tracktok-web.git
   cd tracktok-web
   npm install
   npm run build
   ```

6. **Start Application with PM2**
   ```bash
   pm2 start npm --name "tracktok" -- start
   pm2 save
   sudo pm2 startup
   ```

7. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install -y nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Certbot**
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 🔐 Production Security Checklist

### Environment Variables
- [ ] Set strong JWT_SECRET (use `openssl rand -hex 32`)
- [ ] Use MongoDB Atlas with authentication
- [ ] Set NEXT_PUBLIC_API_URL to production domain
- [ ] Store secrets in environment, not in code

### Database
- [ ] Enable MongoDB authentication
- [ ] Use strong database password
- [ ] Enable IP whitelist on MongoDB Atlas
- [ ] Regular backups
- [ ] Use private MongoDB instance (not public)

### Application
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set security headers
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Enable logging
- [ ] Setup monitoring

### Server
- [ ] Keep OS updated
- [ ] Setup firewall
- [ ] Use SSH keys only (no passwords)
- [ ] Disable root login
- [ ] Setup fail2ban
- [ ] Monitor disk space
- [ ] Setup automatic restarts

### Example Security Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring & Maintenance

### Setup Monitoring
```bash
# PM2 Plus (Free tier available)
pm2 plus

# Or use external services:
# - New Relic
# - DataDog
# - Sentry
# - LogRocket
```

### Regular Maintenance
```bash
# Update dependencies monthly
npm outdated
npm update

# Check for security vulnerabilities
npm audit

# Monitor logs
pm2 logs tracktok

# Check server health
pm2 status
```

### Backup Strategy
- Daily MongoDB backups to AWS S3
- Keep 30 days of backups
- Test restore regularly
- Document recovery procedure

## 🎯 Performance Optimization

### Next.js Optimization
```bash
# Enable Image Optimization
# In next.config.ts:
images: {
  formats: ['image/avif', 'image/webp'],
}

# Enable compression
compress: true
```

### Database Optimization
```javascript
// Add indexes to frequently queried fields
db.collection('transactions').createIndex({ userId: 1, date: -1 });
db.collection('users').createIndex({ email: 1 });
```

### CDN Setup
- Use Vercel's built-in CDN (if using Vercel)
- Or setup CloudFlare
- Or use AWS CloudFront

## 🚨 Troubleshooting Deployment

### Build Fails
```bash
# Check build logs
npm run build

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "your_connection_string"

# Check credentials
echo $MONGODB_URI

# Verify IP whitelist on MongoDB Atlas
```

### Application Won't Start
```bash
# Check logs
pm2 logs tracktok

# Test locally
npm run dev

# Check environment variables
env | grep MONGO
env | grep JWT
```

## 📞 Support

For deployment issues:
- Check application logs
- Verify environment variables
- Test MongoDB connection
- Review security settings
- Contact your hosting provider

---

**Production ready! 🎉**
