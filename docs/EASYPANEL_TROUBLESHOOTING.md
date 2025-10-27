# Troubleshooting EasyPanel Deployment

## Common Issues and Solutions

### 1. npm ci Error
**Error**: `npm ci` failed with "The npm ci command can only install with an existing package-lock.json"

**Cause**: The package-lock.json file is missing or incompatible with the npm version.

**Solutions**:
- **Option 1**: Use `npm install` instead of `npm ci` (Dockerfile updated)
- **Option 2**: Use the alternative Dockerfile: `Dockerfile.alternative`
- **Option 3**: Generate a fresh package-lock.json locally first:
  ```bash
  rm package-lock.json
  npm install
  git add package-lock.json
  git commit -m "Update package-lock.json"
  ```

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

### 2. Check File Structure
Ensure all required files are present:
```bash
# List all deployment files
ls -la Dockerfile docker-compose.yml .env.production nginx.conf

# Check .dockerignore
cat .dockerignore
```

### 3. Verify Environment Variables
```bash
# Check environment variables format
cat .env.production

# Test with a simple script
docker run --rm --env-file .env.production node:18-alpine printenv
```

### 4. Network Issues
```bash
# Test network connectivity
docker network ls
docker network inspect bridge

# Check DNS resolution
docker run --rm node:18-alpine nslookup google.com
```

## Performance Optimization

### 1. Reduce Image Size
- Use multi-stage builds (already implemented)
- Remove unnecessary dependencies
- Use .dockerignore effectively

### 2. Improve Build Speed
- Leverage Docker layer caching
- Order COPY commands by frequency of change
- Use .dockerignore to exclude unnecessary files

### 3. Runtime Optimization
- Configure resource limits in docker-compose.yml
- Use health checks
- Implement proper logging

## Security Considerations

### 1. Environment Variables
- Never commit .env files to version control
- Use different keys for production
- Rotate keys regularly

### 2. Container Security
- Use non-root user (if possible)
- Scan images for vulnerabilities
- Keep base images updated

### 3. Network Security
- Use HTTPS in production
- Configure firewall rules
- Limit exposed ports

## Contact Support

If you continue to experience issues:

1. **Check Logs First**: Always check container and EasyPanel logs
2. **Local Testing**: Verify the build works locally
3. **Documentation**: Refer to the main deployment guide
4. **Community**: Check EasyPanel documentation and community forums
5. **Hosting Provider**: Contact your VPS provider for infrastructure issues

## Quick Fix Commands

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Force recreate containers
docker-compose up -d --force-recreate

# Check system resources
docker stats
docker system df
```

---

**Remember**: Most deployment issues are related to environment variables, missing files, or network configuration. Always check these first!