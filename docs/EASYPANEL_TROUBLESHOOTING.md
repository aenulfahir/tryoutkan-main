
# Troubleshooting EasyPanel Deployment

## Common Issues and Solutions

### 1. npm ci Error
**Error**: `npm ci --only=production` failed with exit code 1

**Cause**: The `--only=production` flag is not compatible with `npm ci` in newer npm versions.

**Solution**: 
- Use `npm ci` without the `--only=production` flag
- The Dockerfile has been updated to fix this issue

### 2. Missing package-lock.json
**Error**: `The npm ci command can only install with an existing package-lock.json`

**Cause**: The package-lock.json file is missing or not properly copied.

**Solution**:
```bash
# Generate package-lock.json if missing
npm install

# Ensure package-lock.json exists in the project root
ls -la package-lock.json
```

### 3. Build Context Issues
**Error**: Failed to solve: failed to read dockerfile

**Cause**: Dockerfile not found in the correct location.

**Solution**:
- Ensure Dockerfile is in the project root
- Check file permissions: `ls -la Dockerfile`

### 4. Port Conflicts
**Error**: Port already in use

**Solution**:
```bash
# Check which process is using the port
netstat -tulpn | grep :80

# Kill the process
sudo kill -9 <PID>

# Or use a different port in docker-compose.yml
```

### 5. Environment Variables Not Loading
**Error**: Missing environment variables

**Solution**:
```bash
# Check if .env.production exists
ls -la .env.production

# Verify content
cat .env.production

# Ensure correct file permissions
chmod 644 .env.production
```

### 6. Nginx Configuration Issues
**Error**: nginx: [emerg] invalid number of arguments

**Solution**:
- Check nginx.conf syntax: `nginx -t`
- Verify all directives are properly formatted
- Check for missing semicolons

### 7. Container Won't Start
**Error**: Container exits immediately

**Solution**:
```bash
# Check container logs
docker logs <container-name>

# Run container in interactive mode for debugging
docker run -it --entrypoint /bin/sh <image-name>
```

### 8. EasyPanel Build Failures
**Error**: Build failed in EasyPanel

**Solution**:
1. Check EasyPanel logs in the dashboard
2. Verify build context is correct
3. Ensure all required files are present
4. Test build locally first

## Debugging Steps

### 1. Local Testing
Always test the Docker build locally before deploying:
```bash
# Build the image
docker build -t tryoutkan-app .

# Run the container
docker run -d -p 8080:80 --name tryoutkan-test tryoutkan-app

# Test the application
curl http://localhost:8080

# Check logs
docker logs tryoutkan-test
```

