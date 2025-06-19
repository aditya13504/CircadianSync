# CircadianSync 🌅

![CircadianSync Banner](https://img.shields.io/badge/CircadianSync-Light%20%26%20Wellness%20Monitor-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-lightgrey)](https://expressjs.com/)
[![D3.js](https://img.shields.io/badge/D3.js-7.8.5-orange)](https://d3js.org/)

> **Personal Light & Wellness Monitor** - A comprehensive web application for tracking circadian rhythm optimization through intelligent light exposure monitoring and personalized recommendations.

## 🌟 Features

### 🔬 **Advanced Light Analysis**
- **Real-time Light Monitoring** - OPT4080 sensor integration for precise light measurements
- **Spectral Analysis** - Full spectrum light analysis (UV, visible, near-infrared)
- **Melanopic Light Calculation** - Circadian-relevant light exposure tracking
- **Blue Light Detection** - Specialized monitoring for circadian disruption

### 📊 **Interactive Visualizations**
- **Biological Clock Display** - Beautiful circular visualization of your circadian rhythm
- **Spectral Analysis Chart** - Real-time light spectrum visualization
- **Daily Light Patterns** - Comprehensive exposure tracking throughout the day
- **Historical Trends** - Long-term circadian health analysis

### 🧠 **Intelligent Recommendations**
- **Personalized Light Therapy** - AI-driven recommendations based on your patterns
- **Optimal Sleep Timing** - Science-based sleep schedule optimization
- **Morning Light Exposure** - Strategic recommendations for circadian alignment
- **Evening Light Management** - Blue light reduction strategies

### 🎯 **Smart Features**
- **Phase Response Curves** - Personalized circadian timing predictions
- **Cognitive Performance Tracking** - Light exposure impact on mental performance
- **Adaptive Algorithms** - Machine learning models that improve with usage
- **Export Capabilities** - Data export for health tracking integration

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: OPT4080 light sensor for real measurements

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aditya13504/CircadianSync.git
   cd CircadianSync
   ```

2. **Install dependencies** (Already included in repository)
   ```bash
   npm install  # Optional - dependencies are already included
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

That's it! CircadianSync is now running locally. 🎉

## 📁 Project Structure

```
CircadianSync/
├── 📄 README.md                    # This file
├── 📄 package.json                 # Project dependencies and scripts
├── 📄 server.js                    # Express.js server
├── 📄 .gitignore                   # Git ignore rules
├── 📄 package-lock.json            # Dependency lock file
├── 📁 node_modules/                # All dependencies (included for easy setup)
├── 📁 frontend/                    # Frontend application
│   ├── 📄 index.html              # Main application interface
│   ├── 📄 test.html               # Testing interface
│   ├── 📁 css/                    # Stylesheets
│   │   ├── 📄 main.css            # Primary styles
│   │   ├── 📄 components.css      # Component-specific styles
│   │   └── 📄 animations.css      # Animation definitions
│   ├── 📁 js/                     # JavaScript modules
│   │   ├── 📄 app.js              # Main application logic
│   │   ├── 📄 visualizations.js   # D3.js visualizations
│   │   ├── 📄 calculations.js     # Light calculations
│   │   ├── 📄 recommendations.js  # AI recommendations
│   │   ├── 📄 sensor.js           # Sensor integration
│   │   └── 📄 storage.js          # Data persistence
│   └── 📁 assets/                 # Static assets
│       ├── 📁 icons/              # SVG icons
│       └── 📁 sounds/             # Audio notifications
├── 📁 data/                       # Data files
│   ├── 📄 research-thresholds.json # Scientific light thresholds
│   └── 📄 sample-readings.json     # Sample sensor data
├── 📁 ml-models/                  # Machine learning models
│   ├── 📄 cognitive-model.json    # Cognitive performance model
│   ├── 📄 melanopic-factors.json  # Melanopic calculations
│   └── 📄 phase-response.json     # Circadian timing model
├── 📁 docs/                       # Documentation
│   ├── 📄 API.md                  # API documentation
│   ├── 📄 CALCULATIONS.md         # Scientific calculations
│   └── 📄 QUICK_START.md          # Quick start guide
└── 📁 tests/                      # Testing utilities
    ├── 📄 calculation-tests.js    # Calculation testing
    └── 📄 mock-sensor.js          # Sensor simulation
```

## 🎮 Usage Guide

### Basic Usage
1. **Launch Application** - Start the server and open in browser
2. **Allow Permissions** - Grant camera/sensor access if using real hardware
3. **View Dashboard** - Monitor your real-time light exposure
4. **Check Recommendations** - Follow personalized suggestions

### Advanced Features
- **Sensor Integration** - Connect OPT4080 sensor for precise measurements
- **Data Export** - Export your data for health apps integration
- **Custom Thresholds** - Adjust sensitivity for personal preferences
- **Historical Analysis** - Review long-term patterns and trends

### Testing & Debugging
- **Test Interface** - Use `/test.html` for debugging
- **Mock Data** - Toggle between real and simulated sensor data
- **Debug Functions** - Built-in testing for all visualizations
- **Console Logs** - Detailed logging for troubleshooting

## 🔧 API Documentation

### Core Endpoints
```javascript
GET /                    # Main application interface
GET /api/sensor/current  # Current light measurements
GET /api/recommendations # Personalized recommendations
GET /api/data/export     # Export historical data
```

### Sensor Integration
```javascript
// Initialize sensor
const sensor = new CircadianSensor();
await sensor.initialize();

// Get current reading
const reading = await sensor.getCurrentReading();
console.log(reading.melanopic, reading.photopic);
```

For detailed API documentation, see [docs/API.md](docs/API.md).

## 🧮 Scientific Background

CircadianSync is built on peer-reviewed circadian rhythm research:

### Light Calculations
- **Melanopic Equivalent Daylight Illuminance (mEDI)** - Industry standard for circadian light
- **Photopic/Scotopic Ratios** - Complete visual system response
- **Spectral Power Distribution** - Full spectrum analysis
- **Phase Response Curves** - Personalized circadian timing

### Research Foundation
- CIE (International Commission on Illumination) standards
- Harvard Medical School circadian research
- National Sleep Foundation guidelines
- Current peer-reviewed literature on light therapy

For detailed calculations, see [docs/CALCULATIONS.md](docs/CALCULATIONS.md).

## 🤖 Machine Learning Models

### Cognitive Performance Model
Predicts mental performance based on light exposure patterns using:
- Historical light exposure data
- Circadian phase estimation
- Individual response patterns
- Environmental factors

### Phase Response Curve
Personalizes circadian timing recommendations:
- Individual chronotype assessment
- Light sensitivity calibration
- Optimal timing predictions
- Sleep schedule optimization

### Adaptive Algorithms
- **Learning Rate**: Adjusts to user behavior patterns
- **Feedback Integration**: Improves from user input
- **Pattern Recognition**: Identifies optimal exposure windows

## 🎨 Customization

### Themes & Styling
```css
/* Custom color schemes in frontend/css/main.css */
:root {
  --primary-color: #4a90e2;
  --accent-color: #f39c12;
  --background: #1a1a1a;
}
```

### Sensor Configuration
```javascript
// Adjust sensor sensitivity in frontend/js/sensor.js
const sensorConfig = {
  sensitivity: 'high',
  sampleRate: 1000,
  smoothing: true
};
```

### Recommendation Tuning
```javascript
// Customize recommendations in frontend/js/recommendations.js
const preferences = {
  strictness: 'moderate',
  personalizedFactors: true,
  notificationFrequency: 'normal'
};
```

## 🛠️ Development

### Technology Stack
- **Backend**: Node.js + Express.js
- **Frontend**: Vanilla JavaScript + D3.js
- **Styling**: CSS3 with animations
- **Data**: JSON-based storage
- **Sensors**: OPT4080 integration

### Development Commands
```bash
npm start          # Start production server
npm run dev        # Start with development features
npm test           # Run test suite
npm run build      # Build for production
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 80+     | ✅ Full |
| Firefox | 75+     | ✅ Full |
| Safari  | 13+     | ✅ Full |
| Edge    | 80+     | ✅ Full |

### Required Features
- WebGL for D3.js visualizations
- localStorage for data persistence
- Media devices API for camera access
- ES6+ JavaScript support

## 🔒 Privacy & Security

- **Local Data Processing** - All calculations performed locally
- **No External Tracking** - No analytics or tracking scripts
- **Secure Storage** - Data encrypted in localStorage
- **Permission-Based** - Only requests necessary permissions

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 3 hours
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Scientific Calculations](docs/CALCULATIONS.md)** - Mathematical foundations
- **[Testing Guide](tests/README.md)** - Testing and debugging

## 🆘 Troubleshooting

### Common Issues

**Visualizations not loading?**
```javascript
// Check browser console for errors
// Verify D3.js is loaded
// Try the test page at /test.html
```

**Sensor not detected?**
```javascript
// Ensure browser permissions granted
// Check sensor connection
// Try mock data mode for testing
```

**Performance issues?**
```javascript
// Reduce visualization update frequency
// Clear browser cache
// Check available memory
```

### Debug Tools
- Built-in test functions accessible via browser console
- Debug mode available in development
- Comprehensive error logging
- Mock data generators for testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 CircadianSync

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **D3.js Community** - For exceptional data visualization tools
- **Express.js Team** - For robust web framework
- **Circadian Research Community** - For scientific foundations
- **Open Source Contributors** - For dependencies and inspiration

## 📞 Contact & Support

- **GitHub Repository**: [CircadianSync](https://github.com/aditya13504/CircadianSync)
- **Issues**: [Report bugs or request features](https://github.com/aditya13504/CircadianSync/issues)
- **Discussions**: [Join the community](https://github.com/aditya13504/CircadianSync/discussions)

---

<div align="center">

**Built with ❤️ for better circadian health**

[🌅 Start Optimizing Your Light Exposure Today! 🌅](http://localhost:3000)

</div>
