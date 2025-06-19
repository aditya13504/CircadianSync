/**
 * Mock OPT4080 Sensor for Testing
 * Simulates the OPT4080 sensor behavior for development and testing
 */

class MockSensor {
  constructor() {
    this.isConnected = false;
    this.isRunning = false;
    this.dataInterval = null;
    this.currentScenario = 'office_day';
    this.timeOffset = 0;
    
    console.log('🎭 MockSensor initialized');
  }

  /**
   * Simulate sensor connection
   */
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.log('✅ Mock sensor connected');
        resolve(true);
      }, 500);
    });
  }

  /**
   * Start generating mock data
   */
  startReading(callback, interval = 1000) {
    if (!this.isConnected) {
      throw new Error('Sensor not connected');
    }

    this.isRunning = true;
    this.dataCallback = callback;

    this.dataInterval = setInterval(() => {
      if (this.isRunning) {
        const mockData = this.generateMockData();
        if (this.dataCallback) {
          this.dataCallback(mockData);
        }
      }
    }, interval);

    console.log('📊 Mock sensor started reading');
  }

  /**
   * Stop reading data
   */
  stopReading() {
    this.isRunning = false;
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
    console.log('⏹️ Mock sensor stopped reading');
  }

  /**
   * Disconnect sensor
   */
  disconnect() {
    this.stopReading();
    this.isConnected = false;
    console.log('🔌 Mock sensor disconnected');
  }

  /**
   * Generate realistic mock data based on current time and scenario
   */
  generateMockData() {
    const now = new Date();
    const hour = now.getHours() + this.timeOffset;
    const adjustedHour = ((hour % 24) + 24) % 24; // Ensure positive hour

    let baseData = this.getBaseDataForHour(adjustedHour);
    
    // Add realistic noise and variations
    baseData = this.addNoise(baseData);
    
    // Apply scenario modifications
    baseData = this.applyScenario(baseData, adjustedHour);

    return {
      timestamp: now.toISOString(),
      red: Math.round(baseData.red),
      green: Math.round(baseData.green),
      blue: Math.round(baseData.blue),
      clear: Math.round(baseData.clear),
      photopic: Math.round(baseData.photopic),
      melanopic: Math.round(baseData.melanopic),
      colorTemp: Math.round(baseData.colorTemp)
    };
  }

  /**
   * Get base data for specific hour of day
   */
  getBaseDataForHour(hour) {
    // Natural light patterns throughout the day
    if (hour >= 0 && hour < 6) {
      // Night - very low light
      return {
        red: 10, green: 8, blue: 5, clear: 23,
        photopic: 15, melanopic: 8, colorTemp: 2200
      };
    } else if (hour >= 6 && hour < 8) {
      // Early morning - warm sunrise
      return {
        red: 120, green: 100, blue: 60, clear: 280,
        photopic: 180, melanopic: 95, colorTemp: 3200
      };
    } else if (hour >= 8 && hour < 10) {
      // Morning - increasing daylight
      return {
        red: 180, green: 220, blue: 280, clear: 680,
        photopic: 450, melanopic: 380, colorTemp: 5500
      };
    } else if (hour >= 10 && hour < 14) {
      // Midday - bright daylight
      return {
        red: 250, green: 320, blue: 420, clear: 990,
        photopic: 650, melanopic: 580, colorTemp: 6200
      };
    } else if (hour >= 14 && hour < 17) {
      // Afternoon - still bright
      return {
        red: 220, green: 280, blue: 360, clear: 860,
        photopic: 550, melanopic: 490, colorTemp: 5800
      };
    } else if (hour >= 17 && hour < 19) {
      // Late afternoon - golden hour
      return {
        red: 180, green: 150, blue: 100, clear: 430,
        photopic: 320, melanopic: 180, colorTemp: 3800
      };
    } else if (hour >= 19 && hour < 21) {
      // Evening - indoor lighting
      return {
        red: 80, green: 70, blue: 50, clear: 200,
        photopic: 140, melanopic: 65, colorTemp: 2900
      };
    } else {
      // Late evening - dim lighting
      return {
        red: 30, green: 25, blue: 15, clear: 70,
        photopic: 50, melanopic: 25, colorTemp: 2400
      };
    }
  }

  /**
   * Add realistic noise and variations to data
   */
  addNoise(data) {
    const noise = () => (Math.random() - 0.5) * 0.1; // ±5% noise
    
    return {
      red: Math.max(0, data.red * (1 + noise())),
      green: Math.max(0, data.green * (1 + noise())),
      blue: Math.max(0, data.blue * (1 + noise())),
      clear: Math.max(0, data.clear * (1 + noise())),
      photopic: Math.max(0, data.photopic * (1 + noise())),
      melanopic: Math.max(0, data.melanopic * (1 + noise())),
      colorTemp: Math.max(1500, data.colorTemp * (1 + noise() * 0.05))
    };
  }

  /**
   * Apply scenario-specific modifications
   */
  applyScenario(data, hour) {
    switch (this.currentScenario) {
      case 'office_day':
        return this.applyOfficeScenario(data, hour);
      case 'night_shift':
        return this.applyNightShiftScenario(data, hour);
      case 'winter_day':
        return this.applyWinterScenario(data, hour);
      case 'summer_day':
        return this.applySummerScenario(data, hour);
      case 'indoor_only':
        return this.applyIndoorScenario(data, hour);
      default:
        return data;
    }
  }

  /**
   * Apply office day scenario
   */
  applyOfficeScenario(data, hour) {
    if (hour >= 8 && hour <= 17) {
      // Reduce outdoor light, simulate office fluorescent
      return {
        ...data,
        red: data.red * 0.6,
        green: data.green * 0.8,
        blue: data.blue * 0.9,
        photopic: data.photopic * 0.7,
        melanopic: data.melanopic * 0.6,
        colorTemp: Math.min(data.colorTemp, 4500)
      };
    }
    return data;
  }

  /**
   * Apply night shift scenario
   */
  applyNightShiftScenario(data, hour) {
    if (hour >= 20 || hour <= 6) {
      // Bright artificial lighting during night shift
      return {
        ...data,
        red: Math.max(data.red, 120),
        green: Math.max(data.green, 150),
        blue: Math.max(data.blue, 180),
        photopic: Math.max(data.photopic, 350),
        melanopic: Math.max(data.melanopic, 280),
        colorTemp: Math.max(data.colorTemp, 4200)
      };
    }
    return data;
  }

  /**
   * Apply winter scenario
   */
  applyWinterScenario(data, hour) {
    if (hour >= 6 && hour <= 18) {
      // Reduced daylight in winter
      return {
        ...data,
        red: data.red * 0.7,
        green: data.green * 0.8,
        blue: data.blue * 0.9,
        photopic: data.photopic * 0.6,
        melanopic: data.melanopic * 0.7,
        colorTemp: data.colorTemp + 300 // Cooler light
      };
    }
    return data;
  }

  /**
   * Apply summer scenario
   */
  applySummerScenario(data, hour) {
    if (hour >= 5 && hour <= 20) {
      // Extended and brighter daylight in summer
      return {
        ...data,
        red: data.red * 1.2,
        green: data.green * 1.1,
        blue: data.blue * 1.1,
        photopic: data.photopic * 1.3,
        melanopic: data.melanopic * 1.2,
        colorTemp: data.colorTemp - 200 // Warmer light
      };
    }
    return data;
  }

  /**
   * Apply indoor-only scenario
   */
  applyIndoorScenario(data, hour) {
    // Cap all values to indoor lighting levels
    return {
      ...data,
      red: Math.min(data.red, 150),
      green: Math.min(data.green, 180),
      blue: Math.min(data.blue, 200),
      photopic: Math.min(data.photopic, 400),
      melanopic: Math.min(data.melanopic, 300),
      colorTemp: Math.min(Math.max(data.colorTemp, 2700), 5000)
    };
  }

  /**
   * Set current scenario
   */
  setScenario(scenario) {
    this.currentScenario = scenario;
    console.log(`🎬 Mock sensor scenario changed to: ${scenario}`);
  }

  /**
   * Set time offset for testing different times of day
   */
  setTimeOffset(hours) {
    this.timeOffset = hours;
    console.log(`⏰ Mock sensor time offset: ${hours} hours`);
  }

  /**
   * Get available scenarios
   */
  getAvailableScenarios() {
    return [
      'office_day',
      'night_shift',
      'winter_day',
      'summer_day',
      'indoor_only'
    ];
  }

  /**
   * Generate specific test data
   */
  generateTestData(scenario, hour) {
    const oldScenario = this.currentScenario;
    const oldOffset = this.timeOffset;
    
    this.setScenario(scenario);
    this.setTimeOffset(hour - new Date().getHours());
    
    const testData = this.generateMockData();
    
    // Restore original settings
    this.setScenario(oldScenario);
    this.setTimeOffset(oldOffset);
    
    return testData;
  }

  /**
   * Run automated test sequence
   */
  async runTestSequence(callback) {
    const scenarios = this.getAvailableScenarios();
    const hours = [6, 9, 12, 15, 18, 21];
    
    console.log('🧪 Running automated test sequence...');
    
    for (const scenario of scenarios) {
      for (const hour of hours) {
        const testData = this.generateTestData(scenario, hour);
        console.log(`📊 Test: ${scenario} at ${hour}:00 -`, testData);
        
        if (callback) {
          callback({
            scenario,
            hour,
            data: testData
          });
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('✅ Test sequence completed');
  }

  /**
   * Validate data ranges
   */
  validateData(data) {
    const errors = [];
    
    if (data.red < 0 || data.red > 255) {
      errors.push(`Red value out of range: ${data.red}`);
    }
    if (data.green < 0 || data.green > 255) {
      errors.push(`Green value out of range: ${data.green}`);
    }
    if (data.blue < 0 || data.blue > 255) {
      errors.push(`Blue value out of range: ${data.blue}`);
    }
    if (data.photopic < 0 || data.photopic > 100000) {
      errors.push(`Photopic lux out of range: ${data.photopic}`);
    }
    if (data.melanopic < 0 || data.melanopic > 100000) {
      errors.push(`Melanopic lux out of range: ${data.melanopic}`);
    }
    if (data.colorTemp < 1500 || data.colorTemp > 15000) {
      errors.push(`Color temperature out of range: ${data.colorTemp}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isRunning: this.isRunning,
      currentScenario: this.currentScenario,
      timeOffset: this.timeOffset,
      hasCallback: !!this.dataCallback
    };
  }
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockSensor;
}

// Make available globally for browser testing
if (typeof window !== 'undefined') {
  window.MockSensor = MockSensor;
}
