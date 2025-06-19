# CircadianSync API Documentation

## Overview
The CircadianSync API provides endpoints for sensor data collection, circadian rhythm analysis, and personalized light therapy recommendations.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, no authentication is required for local development. In production, implement JWT tokens for user authentication.

## Endpoints

### Health Check
```http
GET /health
```
Returns server status and version information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Sensor Data Collection
```http
POST /sensor/reading
```
Submit new sensor reading data.

**Request Body:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "lux": 500.5,
  "cct": 4500,
  "rgb": [180, 200, 255],
  "location": "office"
}
```

**Response:**
```json
{
  "success": true,
  "readingId": "uuid-string",
  "melanopicLux": 425.3,
  "circadianImpact": 0.75
}
```

### Get Circadian Status
```http
GET /circadian/status
```
Get current circadian rhythm status and phase.

**Response:**
```json
{
  "currentPhase": "active",
  "phaseTime": 8.5,
  "alertnessLevel": 0.85,
  "nextTransition": "2024-01-15T22:00:00Z",
  "recommendations": [
    {
      "type": "light_exposure",
      "action": "increase_brightness",
      "target": 1000,
      "duration": 30
    }
  ]
}
```

### Light Therapy Recommendations
```http
GET /recommendations?time=current&context=work
```
Get personalized light therapy recommendations.

**Query Parameters:**
- `time`: Target time (ISO 8601 or "current")
- `context`: Context ("work", "sleep", "exercise", "general")
- `duration`: Session duration in minutes (default: 30)

**Response:**
```json
{
  "recommendations": [
    {
      "type": "blue_light_therapy",
      "intensity": 750,
      "duration": 20,
      "timing": "now",
      "reason": "Phase advance needed for optimal alertness"
    }
  ],
  "alternatives": [
    {
      "type": "bright_light_therapy",
      "intensity": 2500,
      "duration": 15,
      "timing": "+1h"
    }
  ]
}
```

### Historical Data
```http
GET /data/history?period=7d&metric=melanopic_lux
```
Retrieve historical sensor and analysis data.

**Query Parameters:**
- `period`: Time period ("1d", "7d", "30d", "90d")
- `metric`: Specific metric ("lux", "melanopic_lux", "alertness", "all")
- `granularity`: Data granularity ("hour", "day", "week")

**Response:**
```json
{
  "period": "7d",
  "metric": "melanopic_lux",
  "data": [
    {
      "timestamp": "2024-01-08T00:00:00Z",
      "value": 125.5,
      "quality": "good"
    }
  ],
  "statistics": {
    "average": 284.3,
    "peak": 890.1,
    "optimal_hours": 6.5
  }
}
```

### Sleep Optimization
```http
POST /sleep/optimize
```
Get sleep timing recommendations based on current circadian phase.

**Request Body:**
```json
{
  "preferredBedtime": "23:00",
  "wakeTime": "07:00",
  "flexibility": 60
}
```

**Response:**
```json
{
  "optimalBedtime": "22:45",
  "optimalWakeTime": "06:45",
  "lightTherapy": {
    "evening": {
      "dimming_start": "20:00",
      "blue_light_filter": true
    },
    "morning": {
      "bright_light_start": "06:30",
      "intensity": 1500
    }
  }
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (invalid endpoint)
- `500`: Internal Server Error

**Error Response Format:**
```json
{
  "error": {
    "code": "INVALID_SENSOR_DATA",
    "message": "Lux value must be between 0 and 100000",
    "details": {
      "field": "lux",
      "received": -50
    }
  }
}
```

## Rate Limiting
- Sensor readings: 1 request per second
- Analysis endpoints: 10 requests per minute
- Historical data: 5 requests per minute

## WebSocket Events (Future)
Real-time updates will be available via WebSocket connection:

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('sensor_update', (data) => {
  // Handle real-time sensor data
});

ws.on('recommendation_update', (data) => {
  // Handle updated recommendations
});
```

## SDK Examples

### JavaScript/Node.js
```javascript
const CircadianSync = require('circadiansync-sdk');

const client = new CircadianSync({
  baseURL: 'http://localhost:3000/api'
});

// Submit sensor reading
const reading = await client.sensor.submitReading({
  lux: 500,
  cct: 4500,
  timestamp: new Date()
});

// Get recommendations
const recommendations = await client.recommendations.get({
  context: 'work',
  duration: 30
});
```

### Python
```python
import circadiansync

client = circadiansync.Client('http://localhost:3000/api')

# Submit reading
reading = client.sensor.submit_reading(
    lux=500,
    cct=4500,
    timestamp=datetime.now()
)

# Get status
status = client.circadian.get_status()
```

## Data Models

### SensorReading
```typescript
interface SensorReading {
  timestamp: string;
  lux: number;
  cct: number;
  rgb: [number, number, number];
  location?: string;
  deviceId?: string;
}
```

### CircadianStatus
```typescript
interface CircadianStatus {
  currentPhase: 'active' | 'maintenance' | 'sleep';
  phaseTime: number; // Hours since phase start
  alertnessLevel: number; // 0-1 scale
  nextTransition: string; // ISO timestamp
}
```

### Recommendation
```typescript
interface Recommendation {
  type: 'blue_light_therapy' | 'bright_light_therapy' | 'dim_light';
  intensity: number; // Lux
  duration: number; // Minutes
  timing: string; // 'now' or relative time
  reason: string;
  confidence: number; // 0-1 scale
}
```
