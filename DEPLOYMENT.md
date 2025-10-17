# Deploying TradingView Strategy Analyzer on Coolify

This guide walks you through deploying the TradingView Strategy Analyzer on Coolify, a self-hosted application deployment platform.

## 📋 Prerequisites

- Coolify instance running and accessible
- Git repository access (GitHub, GitLab, or Gitea)
- Domain name (optional, can use IP address)

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to Git Repository**
   ```bash
   # Initialize git repository (if not already done)
   git init
   git add .
   git commit -m "Initial commit - TradingView Strategy Analyzer"
   
   # Add your remote repository
   git remote add origin https://github.com/yourusername/tradingview-strategy-analyzer.git
   git push -u origin main
   ```

### Step 2: Create Application in Coolify

1. **Access Coolify Dashboard**
   - Navigate to your Coolify instance
   - Click on "New Resource" or "Applications"

2. **Select Source**
   - Choose "Git Repository"
   - Connect your GitHub/GitLab/Gitea account if not already connected
   - Select the repository containing your TradingView Strategy Analyzer

3. **Configure Application**
   - **Name**: `tradingview-strategy-analyzer`
   - **Branch**: `main` (or your default branch)
   - **Build Pack**: `Docker` (Coolify will auto-detect the Dockerfile)

### Step 3: Environment Configuration

#### Build Settings
```yaml
# Coolify will automatically detect these from your Dockerfile
Build Command: docker build -t tradingview-analyzer .
Start Command: nginx -g "daemon off;"
Port: 80
```

#### Environment Variables (Optional)
```env
# Add any custom environment variables here
NODE_ENV=production
REACT_APP_VERSION=1.0.0
```

### Step 4: Domain Configuration

1. **Custom Domain** (Recommended)
   - In Coolify dashboard, go to your application settings
   - Add your domain: `trading-analyzer.yourdomain.com`
   - Coolify will automatically handle SSL certificates via Let's Encrypt

2. **Using IP Address**
   - Access via `http://your-coolify-server-ip:port`

### Step 5: Deploy

1. **Initial Deployment**
   - Click "Deploy" in your Coolify application dashboard
   - Monitor the build logs for any issues
   - Wait for deployment to complete (usually 2-5 minutes)

2. **Verify Deployment**
   - Visit your configured domain or IP address
   - You should see the TradingView Strategy Analyzer interface

## 🔧 Configuration Options

### Resource Limits
```yaml
# Recommended resource allocation
CPU: 0.5 cores
Memory: 512MB
Storage: 1GB
```

### Health Check Configuration
```yaml
Health Check Path: /health
Health Check Port: 80
Health Check Method: GET
Interval: 30s
Timeout: 10s
Retries: 3
```

### Auto-Deployment
Enable automatic deployments on git push:
1. Go to application settings in Coolify
2. Enable "Deploy on Push"
3. Coolify will watch your repository for changes

## 📁 File Structure for Deployment
```
tradingview-strategy-analyzer/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   └── TradingViewStrategyAnalyzer.js
├── Dockerfile
├── nginx.conf
├── package.json
├── .dockerignore
├── .gitignore
├── README.md
└── DEPLOYMENT.md
```

## 🐳 Docker Build Process

The deployment uses a multi-stage Docker build:

1. **Stage 1**: Build React application
   - Install Node.js dependencies
   - Build optimized production bundle
   - Generate static files

2. **Stage 2**: Serve with Nginx
   - Copy built files to Nginx
   - Configure reverse proxy
   - Enable gzip compression
   - Add security headers

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Coolify build logs
   - Verify Dockerfile syntax
   - Ensure all dependencies are in package.json

2. **Application Won't Start**
   - Check if port 80 is correctly exposed
   - Verify nginx configuration
   - Review container logs in Coolify

3. **502 Bad Gateway**
   - Container might not be running
   - Port mapping issues
   - Check health check endpoint

### Debug Commands
```bash
# Check container status
docker ps

# View container logs
docker logs <container_id>

# Access container shell
docker exec -it <container_id> /bin/sh
```

## 🔄 Updates and Maintenance

### Automatic Updates
- Push changes to your git repository
- Coolify will automatically rebuild and redeploy
- Monitor deployment in Coolify dashboard

### Manual Deployment
1. Go to Coolify application dashboard
2. Click "Force Deploy"
3. Monitor build and deployment progress

### Backup Strategy
- **Code**: Already in git repository
- **Configuration**: Export from Coolify settings
- **User Data**: Application is stateless (no database required)

## 🌐 Performance Optimization

### CDN Integration (Optional)
- Configure Cloudflare or similar CDN
- Point domain to CDN
- Set CDN origin to your Coolify deployment

### Monitoring
- Use Coolify's built-in monitoring
- Set up alerts for downtime
- Monitor resource usage

## 🔒 Security Considerations

### SSL/HTTPS
- Coolify automatically provisions SSL certificates
- Ensure domain is properly configured
- Verify HTTPS redirection works

### File Upload Limits
- Current limit: 50MB (configured in nginx.conf)
- Adjust if needed for larger CSV files
- Monitor disk usage

### Security Headers
Already configured in nginx.conf:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## 📊 Monitoring and Logs

### Application Logs
- Access via Coolify dashboard
- Monitor build and runtime logs
- Set up log retention policies

### Performance Metrics
- Monitor response times
- Track resource usage
- Set up alerts for high usage

## 🎯 Next Steps

After successful deployment:

1. **Test thoroughly** with sample CSV files
2. **Set up monitoring** and alerting
3. **Configure backups** for any persistent data
4. **Document** your specific configuration
5. **Plan updates** and maintenance schedule

---

**Deployment Time**: ~5-10 minutes  
**Resources Required**: 512MB RAM, 0.5 CPU cores  
**Supported Platforms**: Any platform that runs Coolify