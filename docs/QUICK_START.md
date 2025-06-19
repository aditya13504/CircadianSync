# CircadianSync Quick Start Guide
*Build a working circadian light monitoring system in 3 hours*

## Overview
This guide will help you build CircadianSync from scratch in three focused phases. By the end, you'll have a functional web application that measures light exposure and provides circadian rhythm optimization recommendations.

## Prerequisites
- Basic knowledge of HTML, CSS, and JavaScript
- Node.js installed (version 14+)
- A modern web browser
- Optional: OPT4080 light sensor or webcam for real data

## Phase 1: Foundation Setup (Hour 1)

### Step 1: Project Initialization (15 minutes)
```bash
# Create project directory
mkdir CircadianSync
cd CircadianSync

# Initialize npm project
npm init -y

# Install minimal dependencies
npm install d3 express

# Create folder structure
mkdir -p frontend/{css,js,assets/{icons,sounds}}
mkdir -p {ml-models,data,docs,tests}
```

### Step 2: Basic HTML Structure (20 minutes)
Create `frontend/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CircadianSync - Light Exposure Monitor</title>
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <h1>CircadianSync</h1>
            <div class="connection-status" id="connectionStatus">
                Connecting...
            </div>
        </header>
        
        <main class="dashboard">
            <section class="sensor-panel">
                <h2>Current Reading</h2>
                <div class="reading-display" id="currentReading">
                    <span class="lux-value">-- lux</span>
                </div>
            </section>
            
            <section class="circadian-clock">
                <h2>Circadian Clock</h2>
                <div id="clockVisualization"></div>
            </section>
            
            <section class="recommendations">
                <h2>Recommendations</h2>
                <div id="recommendationCards"></div>
            </section>
        </main>
    </div>
    
    <script src="js/app.js" type="module"></script>
</body>
</html>
```

### Step 3: Core CSS Styling (25 minutes)
Create `frontend/css/main.css`:
```css
:root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --accent-blue: #4a9eff;
    --accent-orange: #ff8c42;
    --border-radius: 12px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}

.app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--bg-secondary);
}

.dashboard {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    margin-top: 20px;
}

.sensor-panel, .circadian-clock, .recommendations {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: var(--border-radius);
}

.lux-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--accent-blue);
}
```

## Phase 2: Core Functionality (Hour 2)

### Step 4: Sensor Interface (20 minutes)
Create `frontend/js/sensor.js`:
```javascript
export class SensorManager {
    constructor() {
        this.isConnected = false;
        this.currentReading = null;
        this.mockMode = true; // Start with mock data
    }
    
    async connect() {
        if (this.mockMode) {
            return this.startMockSensor();
        }
        // Real sensor connection logic here
    }
    
    startMockSensor() {
        this.isConnected = true;
        
        // Generate realistic mock data
        setInterval(() => {
            const hour = new Date().getHours();
            let baseLux = this.getDaylightCurve(hour);
            
            this.currentReading = {
                timestamp: new Date(),
                lux: baseLux + (Math.random() - 0.5) * 50,
                cct: 4500 + (Math.random() - 0.5) * 1000,
                rgb: this.calculateRGB(baseLux)
            };
            
            this.onDataReceived(this.currentReading);
        }, 1000);
        
        return Promise.resolve();
    }
    
    getDaylightCurve(hour) {
        // Simulate natural daylight curve
        if (hour < 6 || hour > 22) return 1; // Night
        if (hour >= 12 && hour <= 14) return 50000; // Peak daylight
        
        // Dawn/dusk curves
        let angle = ((hour - 6) / 16) * Math.PI;
        return Math.max(1, 25000 * Math.sin(angle));
    }
    
    calculateRGB(lux) {
        // Simple RGB estimation from lux
        let intensity = Math.min(255, lux / 200);
        return [intensity, intensity * 1.1, intensity * 1.2];
    }
    
    onDataReceived(data) {
        // Override this method to handle new data
        console.log('New sensor data:', data);
    }
}
```

### Step 5: Core Calculations (25 minutes)
Create `frontend/js/calculations.js`:
```javascript
export class CircadianCalculations {
    constructor() {
        this.melanopicFactors = {
            2700: 0.31, 3000: 0.40, 4000: 0.55,
            5000: 0.68, 6500: 0.90, 10000: 1.26
        };
    }
    
    calculateMelanopicLux(lux, cct) {
        let factor = this.interpolateMelanopicFactor(cct);
        return lux * factor;
    }
    
    interpolateMelanopicFactor(cct) {
        let keys = Object.keys(this.melanopicFactors).map(Number).sort((a,b) => a-b);
        
        if (cct <= keys[0]) return this.melanopicFactors[keys[0]];
        if (cct >= keys[keys.length-1]) return this.melanopicFactors[keys[keys.length-1]];
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (cct >= keys[i] && cct <= keys[i+1]) {
                let ratio = (cct - keys[i]) / (keys[i+1] - keys[i]);
                return this.melanopicFactors[keys[i]] + 
                       ratio * (this.melanopicFactors[keys[i+1]] - this.melanopicFactors[keys[i]]);
            }
        }
    }
    
    estimateCircadianPhase() {
        // Simple phase estimation based on time of day
        let hour = new Date().getHours() + new Date().getMinutes() / 60;
        return hour;
    }
    
    calculateAlertness(melanopicLux, circadianPhase) {
        // Simplified alertness model
        let circadianComponent = 0.5 + 0.3 * Math.cos(2 * Math.PI * (circadianPhase - 14) / 24);
        let lightComponent = Math.min(0.3, melanopicLux / 1000);
        
        return Math.max(0, Math.min(1, circadianComponent + lightComponent));
    }
}
```

### Step 6: Basic Visualization (15 minutes)
Create `frontend/js/visualizations.js`:
```javascript
import * as d3 from 'd3';

export class CircadianVisualizations {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.setupClock();
    }
    
    setupClock() {
        const size = 200;
        
        this.svg = this.container
            .append('svg')
            .attr('width', size)
            .attr('height', size);
            
        this.clockGroup = this.svg
            .append('g')
            .attr('transform', `translate(${size/2}, ${size/2})`);
            
        // Draw clock face
        this.clockGroup
            .append('circle')
            .attr('r', 90)
            .attr('fill', 'none')
            .attr('stroke', '#4a9eff')
            .attr('stroke-width', 2);
            
        // Add hour markers
        for (let i = 0; i < 24; i++) {
            let angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
            let x1 = Math.cos(angle) * 75;
            let y1 = Math.sin(angle) * 75;
            let x2 = Math.cos(angle) * 85;
            let y2 = Math.sin(angle) * 85;
            
            this.clockGroup
                .append('line')
                .attr('x1', x1).attr('y1', y1)
                .attr('x2', x2).attr('y2', y2)
                .attr('stroke', '#cccccc')
                .attr('stroke-width', i % 6 === 0 ? 2 : 1);
        }
    }
    
    updateClock(phase, alertness) {
        // Remove existing hands
        this.clockGroup.selectAll('.clock-hand').remove();
        
        // Phase hand
        let phaseAngle = (phase / 24) * 2 * Math.PI - Math.PI / 2;
        this.clockGroup
            .append('line')
            .attr('class', 'clock-hand phase-hand')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', Math.cos(phaseAngle) * 60)
            .attr('y2', Math.sin(phaseAngle) * 60)
            .attr('stroke', '#ff8c42')
            .attr('stroke-width', 3);
            
        // Alertness indicator
        this.clockGroup
            .append('circle')
            .attr('class', 'clock-hand alertness-indicator')
            .attr('r', 5 + alertness * 10)
            .attr('fill', `rgba(74, 158, 255, ${alertness})`);
    }
}
```

## Phase 3: Polish & Integration (Hour 3)

### Step 7: Main Application Controller (20 minutes)
Create `frontend/js/app.js`:
```javascript
import { SensorManager } from './sensor.js';
import { CircadianCalculations } from './calculations.js';
import { CircadianVisualizations } from './visualizations.js';

class CircadianSyncApp {
    constructor() {
        this.sensor = new SensorManager();
        this.calculations = new CircadianCalculations();
        this.visualizations = new CircadianVisualizations('clockVisualization');
        
        this.init();
    }
    
    async init() {
        // Set up sensor data handler
        this.sensor.onDataReceived = (data) => this.handleSensorData(data);
        
        // Connect to sensor
        try {
            await this.sensor.connect();
            this.updateConnectionStatus('Connected (Mock Mode)');
        } catch (error) {
            this.updateConnectionStatus('Connection Failed');
            console.error('Sensor connection failed:', error);
        }
        
        // Start update loop
        this.startUpdateLoop();
    }
    
    handleSensorData(data) {
        // Calculate derived values
        let melanopicLux = this.calculations.calculateMelanopicLux(data.lux, data.cct);
        let phase = this.calculations.estimateCircadianPhase();
        let alertness = this.calculations.calculateAlertness(melanopicLux, phase);
        
        // Update UI
        this.updateReadingDisplay(data, melanopicLux);
        this.visualizations.updateClock(phase, alertness);
        this.updateRecommendations(melanopicLux, phase, alertness);
    }
    
    updateReadingDisplay(data, melanopicLux) {
        document.querySelector('.lux-value').textContent = 
            `${Math.round(data.lux)} lux (${Math.round(melanopicLux)} melanopic)`;
    }
    
    updateConnectionStatus(status) {
        document.getElementById('connectionStatus').textContent = status;
    }
    
    updateRecommendations(melanopicLux, phase, alertness) {
        let recommendations = this.generateRecommendations(melanopicLux, phase, alertness);
        let container = document.getElementById('recommendationCards');
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card ${rec.type}">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <div class="recommendation-action">${rec.action}</div>
            </div>
        `).join('');
    }
    
    generateRecommendations(melanopicLux, phase, alertness) {
        let recommendations = [];
        let hour = new Date().getHours();
        
        // Morning recommendations
        if (hour >= 6 && hour <= 10) {
            if (melanopicLux < 300) {
                recommendations.push({
                    type: 'morning-light',
                    title: 'Morning Light Needed',
                    description: 'Increase bright light exposure to advance your circadian rhythm.',
                    action: 'Seek 1000+ lux for 30 minutes'
                });
            }
        }
        
        // Evening recommendations
        if (hour >= 20) {
            if (melanopicLux > 50) {
                recommendations.push({
                    type: 'evening-dim',
                    title: 'Reduce Evening Light',
                    description: 'Dim lights to prepare for sleep.',
                    action: 'Use < 50 lux, consider blue light filter'
                });
            }
        }
        
        // Alertness recommendations
        if (alertness < 0.4 && hour >= 9 && hour <= 17) {
            recommendations.push({
                type: 'alertness-boost',
                title: 'Boost Alertness',
                description: 'Your alertness is low for this time of day.',
                action: 'Take a short walk outside or increase indoor lighting'
            });
        }
        
        return recommendations;
    }
    
    startUpdateLoop() {
        // Update every minute for time-dependent calculations
        setInterval(() => {
            if (this.sensor.currentReading) {
                this.handleSensorData(this.sensor.currentReading);
            }
        }, 60000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CircadianSyncApp();
});
```

### Step 8: Server Setup (10 minutes)
Create `server.js`:
```javascript
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from frontend directory
app.use(express.static('frontend'));

// API endpoint for health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(port, () => {
    console.log(`CircadianSync server running at http://localhost:${port}`);
    console.log('Open your browser to see the application');
});
```

### Step 9: Final Polish (10 minutes)
Add CSS for recommendations in `frontend/css/main.css`:
```css
.recommendations {
    grid-column: 1 / -1; /* Full width */
}

.recommendation-card {
    background: var(--bg-primary);
    border-left: 4px solid var(--accent-blue);
    padding: 15px;
    margin: 10px 0;
    border-radius: var(--border-radius);
}

.recommendation-card.morning-light {
    border-left-color: var(--accent-orange);
}

.recommendation-card.evening-dim {
    border-left-color: #8e44ad;
}

.recommendation-card.alertness-boost {
    border-left-color: #e74c3c;
}

.recommendation-action {
    font-weight: bold;
    color: var(--accent-blue);
    margin-top: 10px;
}
```

## Testing & Validation

### Run the Application
```bash
# Start the server
node server.js

# Open browser to http://localhost:3000
```

### Test Checklist
- [ ] Page loads without errors
- [ ] Mock sensor data appears and updates
- [ ] Circadian clock displays and rotates
- [ ] Recommendations appear based on time of day
- [ ] All styling renders correctly

### Demo Mode Features
- Realistic daylight simulation curve
- Time-based recommendations
- Animated circadian clock
- Responsive layout

## Next Steps (Post-3 Hours)

### Immediate Enhancements
1. **Real Sensor Integration**: Connect actual OPT4080 via WebUSB
2. **Data Persistence**: Save readings to localStorage
3. **Historical Charts**: Add daily/weekly light exposure graphs
4. **Sound Notifications**: Add audio alerts for recommendations

### Advanced Features
1. **Machine Learning**: Implement personalized recommendation engine
2. **Sleep Tracking**: Integrate with sleep data
3. **Multi-user Support**: User profiles and comparison
4. **Mobile App**: React Native or PWA version

### Production Deployment
1. **Build Process**: Add Webpack/Vite for optimization
2. **Testing Suite**: Comprehensive unit and integration tests
3. **Cloud Backend**: Move from localStorage to database
4. **Analytics**: User behavior and effectiveness tracking

## Troubleshooting

### Common Issues
- **Port 3000 in use**: Change port in server.js
- **D3.js not loading**: Check internet connection for CDN
- **Styling broken**: Verify CSS file paths
- **Clock not rotating**: Check browser console for JavaScript errors

### Debug Mode
Add to app.js for verbose logging:
```javascript
const DEBUG = true;
if (DEBUG) {
    console.log('Sensor data:', data);
    console.log('Calculated values:', { melanopicLux, phase, alertness });
}
```

## Resources
- [OPT4080 Datasheet](https://www.ti.com/product/OPT4080)
- [WebUSB API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)
- [D3.js Gallery](https://observablehq.com/@d3/gallery)
- [Circadian Research Papers](docs/CALCULATIONS.md#research-references)

---

**Congratulations!** You now have a working CircadianSync prototype that demonstrates real-time light monitoring, circadian rhythm visualization, and intelligent recommendations. The modular architecture makes it easy to add features and integrate real sensors.
