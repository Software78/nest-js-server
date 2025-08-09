# Log Visualization with Grafana + Loki

This setup provides beautiful visual dashboards for your NestJS application logs using Grafana and Loki.

## 🚀 Quick Start

### 1. Start the Logging Stack
```bash
# Start all services including logging
docker-compose -f docker-compose.dev.yml up -d

# Or just start the logging services
docker-compose -f docker-compose.dev.yml up -d loki promtail grafana
```

### 2. Access Grafana Dashboard
- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: admin

### 3. View Your Logs
The dashboard will automatically show:
- **Request Rate** - Requests per second
- **Response Status Codes** - 200s, 400s, 500s breakdown
- **Error Rate** - Error frequency tracking
- **Top Endpoints** - Most frequently accessed URLs
- **Live Request Logs** - Real-time request flow
- **Error Logs** - Filtered error messages
- **Response Time Distribution** - Performance metrics

## 📊 What You'll See

### Dashboard Panels

1. **Request Rate**: Live requests/second metric
2. **Status Code Pie Chart**: Visual breakdown of HTTP responses
3. **Error Rate**: Immediate error detection
4. **Top Endpoints Table**: Your most popular API routes
5. **Request Logs**: Live stream of incoming requests
6. **Error Logs**: Filtered view of application errors
7. **Response Time Histogram**: Performance distribution

### Log Sources
The system automatically ingests all your Winston logs:
- `logs/app-*.log` - General application logs
- `logs/requests-*.log` - HTTP request logs
- `logs/error-*.log` - Error logs
- `logs/exceptions-*.log` - Exception logs

## 🔧 Services

### Loki (Port 3100)
- **Purpose**: Log aggregation and storage
- **Data**: Stores all your JSON logs with indexing
- **API**: http://localhost:3100

### Promtail
- **Purpose**: Log shipping agent
- **Function**: Reads your log files and sends to Loki
- **Config**: `promtail-config.yml`

### Grafana (Port 3001)
- **Purpose**: Visualization and dashboards
- **Features**: Real-time charts, filtering, alerting
- **Config**: Auto-provisioned with data source and dashboard

## 📈 Key Metrics to Watch

### Performance
- **Request Rate**: Normal traffic patterns
- **Response Times**: 95th percentile should be consistent
- **Error Rate**: Should stay low (< 1% ideally)

### Security
- **Failed Login Attempts**: Monitor authentication endpoints
- **404 Rates**: Potential scanning attempts
- **IP Patterns**: Unusual geographic access

### Business
- **Endpoint Usage**: Most popular features
- **User Patterns**: Peak usage times
- **API Adoption**: New endpoint uptake

## 🛠️ Customization

### Adding New Panels
1. Open Grafana (http://localhost:3001)
2. Navigate to "NestJS Application Logs" dashboard
3. Click "Add Panel"
4. Use LogQL queries like:
   ```
   # All requests to auth endpoints
   {job="nestjs"} |= "auth"
   
   # Failed authentication attempts
   {job="nestjs", level="error"} |= "authentication"
   
   # Slow requests (>1000ms)
   {job="nestjs", type="request"} | json | duration > 1000
   ```

### Alerts
Set up alerts for:
- Error rate spikes
- Response time degradation
- High request volume
- Failed authentication attempts

## 🐛 Troubleshooting

### No Data Showing?
1. Check if logs are being generated: `ls -la logs/`
2. Verify Promtail is reading logs: `docker logs nest_js_example-promtail-1`
3. Check Loki ingestion: `docker logs nest_js_example-loki-1`

### Connection Issues?
- Ensure all services are running: `docker-compose ps`
- Check network connectivity between containers
- Verify port accessibility: `curl http://localhost:3001`

### Performance Issues?
- Loki storage growing large? Implement retention policies
- High memory usage? Adjust Loki configuration
- Slow queries? Add more specific log labels

## 📝 LogQL Query Examples

```sql
-- All error logs from the last hour
{job="nestjs", level="error"} [1h]

-- Requests by HTTP method
sum by (method) (count_over_time({job="nestjs", type="request"} | json [1h]))

-- Failed password reset attempts
{job="nestjs"} |= "password reset" |= "failed"

-- API response times above 1 second
{job="nestjs", type="request"} | json | duration > "1000ms"

-- Requests from specific IP
{job="nestjs"} | json | ip="192.168.1.100"
```

This powerful logging setup transforms your raw JSON logs into actionable insights with beautiful visualizations!