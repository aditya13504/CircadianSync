/**
 * Calculation Tests for CircadianSync
 * Tests for melanopic conversions, circadian calculations, and scientific accuracy
 */

// Import or require the calculations module
// This would work in Node.js environment or with proper module loading

class CalculationTests {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
    
    console.log('🧪 CalculationTests initialized');
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🚀 Starting calculation tests...');
    
    this.testMelanopicConversions();
    this.testColorTemperatureCalculations();
    this.testCircadianStimulus();
    this.testPhaseResponseCurve();
    this.testBlueLightCalculations();
    this.testDataValidation();
    this.testEdgeCases();
    
    this.generateReport();
  }

  /**
   * Test melanopic lux conversions
   */
  testMelanopicConversions() {
    console.log('📊 Testing melanopic conversions...');
    
    const testCases = [
      {
        name: 'Pure white light',
        input: { red: 255, green: 255, blue: 255 },
        expectedRatio: 0.89, // High melanopic content
        tolerance: 0.1
      },
      {
        name: 'Blue-rich daylight',
        input: { red: 100, green: 150, blue: 255 },
        expectedRatio: 0.95, // Very high melanopic content
        tolerance: 0.1
      },
      {
        name: 'Warm incandescent',
        input: { red: 255, green: 200, blue: 100 },
        expectedRatio: 0.35, // Low melanopic content
        tolerance: 0.1
      },
      {
        name: 'Red light therapy',
        input: { red: 255, green: 50, blue: 10 },
        expectedRatio: 0.05, // Very low melanopic content
        tolerance: 0.05
      }
    ];

    testCases.forEach(testCase => {
      const photopic = this.calculatePhotopic(testCase.input);
      const melanopic = this.calculateMelanopic(testCase.input);
      const ratio = photopic > 0 ? melanopic / photopic : 0;
      
      const passed = Math.abs(ratio - testCase.expectedRatio) <= testCase.tolerance;
      
      this.recordTest(
        `Melanopic conversion: ${testCase.name}`,
        passed,
        `Expected ratio: ${testCase.expectedRatio}, Got: ${ratio.toFixed(3)}`
      );
    });
  }

  /**
   * Test color temperature calculations
   */
  testColorTemperatureCalculations() {
    console.log('🌡️ Testing color temperature calculations...');
    
    const testCases = [
      {
        name: 'Candle light',
        input: { red: 255, green: 180, blue: 80 },
        expectedCCT: 1900,
        tolerance: 300
      },
      {
        name: 'Incandescent bulb',
        input: { red: 255, green: 200, blue: 140 },
        expectedCCT: 2700,
        tolerance: 300
      },
      {
        name: 'Daylight',
        input: { red: 200, green: 220, blue: 255 },
        expectedCCT: 6500,
        tolerance: 500
      },
      {
        name: 'Cool white LED',
        input: { red: 180, green: 200, blue: 255 },
        expectedCCT: 6000,
        tolerance: 500
      }
    ];

    testCases.forEach(testCase => {
      const cct = this.calculateColorTemperature(testCase.input);
      const passed = Math.abs(cct - testCase.expectedCCT) <= testCase.tolerance;
      
      this.recordTest(
        `Color temperature: ${testCase.name}`,
        passed,
        `Expected: ${testCase.expectedCCT}K, Got: ${cct}K`
      );
    });
  }

  /**
   * Test circadian stimulus calculations
   */
  testCircadianStimulus() {
    console.log('🕐 Testing circadian stimulus calculations...');
    
    const testCases = [
      {
        name: 'Below threshold',
        melanopic: 10,
        expectedCS: 0.0,
        tolerance: 0.05
      },
      {
        name: 'At threshold',
        melanopic: 30,
        expectedCS: 0.0,
        tolerance: 0.05
      },
      {
        name: 'Moderate activation',
        melanopic: 100,
        expectedCS: 0.15,
        tolerance: 0.1
      },
      {
        name: 'Strong activation',
        melanopic: 300,
        expectedCS: 0.45,
        tolerance: 0.15
      },
      {
        name: 'Near saturation',
        melanopic: 1000,
        expectedCS: 0.7,
        tolerance: 0.1
      }
    ];

    testCases.forEach(testCase => {
      const cs = this.calculateCircadianStimulus(testCase.melanopic);
      const passed = Math.abs(cs - testCase.expectedCS) <= testCase.tolerance;
      
      this.recordTest(
        `Circadian stimulus: ${testCase.name}`,
        passed,
        `Expected: ${testCase.expectedCS}, Got: ${cs.toFixed(3)}`
      );
    });
  }

  /**
   * Test phase response curve calculations
   */
  testPhaseResponseCurve() {
    console.log('📈 Testing phase response curve...');
    
    const testCases = [
      {
        name: 'Morning light advance',
        time: 8,
        melanopic: 300,
        expectedShift: 0.3,
        tolerance: 0.2
      },
      {
        name: 'Evening light delay',
        time: 20,
        melanopic: 200,
        expectedShift: -0.5,
        tolerance: 0.3
      },
      {
        name: 'Midday dead zone',
        time: 13,
        melanopic: 500,
        expectedShift: 0.0,
        tolerance: 0.1
      },
      {
        name: 'Night exposure delay',
        time: 2,
        melanopic: 100,
        expectedShift: -1.2,
        tolerance: 0.4
      }
    ];

    testCases.forEach(testCase => {
      const shift = this.calculatePhaseShift(testCase.melanopic, testCase.time);
      const passed = Math.abs(shift - testCase.expectedShift) <= testCase.tolerance;
      
      this.recordTest(
        `Phase response: ${testCase.name}`,
        passed,
        `Expected: ${testCase.expectedShift}h, Got: ${shift.toFixed(2)}h`
      );
    });
  }

  /**
   * Test blue light calculations
   */
  testBlueLightCalculations() {
    console.log('💙 Testing blue light calculations...');
    
    const testCases = [
      {
        name: 'Balanced white light',
        input: { red: 85, green: 85, blue: 85 },
        expectedPercentage: 33,
        tolerance: 5
      },
      {
        name: 'Blue-rich display',
        input: { red: 50, green: 100, blue: 200 },
        expectedPercentage: 57,
        tolerance: 5
      },
      {
        name: 'Warm light',
        input: { red: 200, green: 150, blue: 50 },
        expectedPercentage: 12,
        tolerance: 3
      },
      {
        name: 'Pure blue',
        input: { red: 0, green: 0, blue: 255 },
        expectedPercentage: 100,
        tolerance: 1
      }
    ];

    testCases.forEach(testCase => {
      const percentage = this.calculateBluePercentage(testCase.input);
      const passed = Math.abs(percentage - testCase.expectedPercentage) <= testCase.tolerance;
      
      this.recordTest(
        `Blue light: ${testCase.name}`,
        passed,
        `Expected: ${testCase.expectedPercentage}%, Got: ${percentage}%`
      );
    });
  }

  /**
   * Test data validation
   */
  testDataValidation() {
    console.log('✅ Testing data validation...');
    
    const testCases = [
      {
        name: 'Valid normal data',
        data: { red: 100, green: 150, blue: 200, photopic: 300, melanopic: 250, colorTemp: 5000 },
        shouldPass: true
      },
      {
        name: 'Negative values',
        data: { red: -10, green: 150, blue: 200, photopic: 300, melanopic: 250, colorTemp: 5000 },
        shouldPass: false
      },
      {
        name: 'RGB out of range',
        data: { red: 300, green: 150, blue: 200, photopic: 300, melanopic: 250, colorTemp: 5000 },
        shouldPass: false
      },
      {
        name: 'Impossible color temperature',
        data: { red: 100, green: 150, blue: 200, photopic: 300, melanopic: 250, colorTemp: 50000 },
        shouldPass: false
      },
      {
        name: 'Zero values',
        data: { red: 0, green: 0, blue: 0, photopic: 0, melanopic: 0, colorTemp: 2000 },
        shouldPass: true
      }
    ];

    testCases.forEach(testCase => {
      const isValid = this.validateSensorData(testCase.data);
      const passed = isValid === testCase.shouldPass;
      
      this.recordTest(
        `Data validation: ${testCase.name}`,
        passed,
        `Expected valid: ${testCase.shouldPass}, Got valid: ${isValid}`
      );
    });
  }

  /**
   * Test edge cases and error handling
   */
  testEdgeCases() {
    console.log('🔍 Testing edge cases...');
    
    // Test division by zero
    const result1 = this.calculateMelanopic({ red: 0, green: 0, blue: 0 });
    this.recordTest(
      'Edge case: Zero RGB values',
      result1 >= 0,
      `Should handle zero values gracefully, got: ${result1}`
    );

    // Test very large values
    const result2 = this.calculatePhotopic({ red: 1000, green: 1000, blue: 1000 });
    this.recordTest(
      'Edge case: Large RGB values',
      result2 > 0 && result2 < 1000000,
      `Should handle large values reasonably, got: ${result2}`
    );

    // Test NaN inputs
    const result3 = this.calculateColorTemperature({ red: NaN, green: 100, blue: 100 });
    this.recordTest(
      'Edge case: NaN input',
      !isNaN(result3),
      `Should handle NaN inputs, got: ${result3}`
    );

    // Test melanopic ratio bounds
    const result4 = this.calculateMelanopic({ red: 255, green: 0, blue: 0 });
    const photopic4 = this.calculatePhotopic({ red: 255, green: 0, blue: 0 });
    const ratio = photopic4 > 0 ? result4 / photopic4 : 0;
    this.recordTest(
      'Edge case: Melanopic ratio bounds',
      ratio >= 0 && ratio <= 2,
      `Melanopic ratio should be reasonable, got: ${ratio.toFixed(3)}`
    );
  }

  /**
   * Record test result
   */
  recordTest(testName, passed, details) {
    this.testResults.push({
      name: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.passedTests++;
      console.log(`✅ ${testName}: ${details}`);
    } else {
      this.failedTests++;
      console.log(`❌ ${testName}: ${details}`);
    }
  }

  /**
   * Generate test report
   */
  generateReport() {
    const totalTests = this.passedTests + this.failedTests;
    const passRate = totalTests > 0 ? (this.passedTests / totalTests * 100).toFixed(1) : 0;
    
    console.log('\n📋 Test Report:');
    console.log('================');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.failedTests}`);
    console.log(`Pass rate: ${passRate}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ Failed tests:');
      this.testResults.filter(test => !test.passed).forEach(test => {
        console.log(`  - ${test.name}: ${test.details}`);
      });
    }

    return {
      totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      passRate: parseFloat(passRate),
      results: this.testResults
    };
  }

  // Simplified calculation methods for testing
  // These would normally import from the actual calculations module

  calculatePhotopic(rgb) {
    const weights = { red: 0.2126, green: 0.7152, blue: 0.0722 };
    return (rgb.red * weights.red + rgb.green * weights.green + rgb.blue * weights.blue) * 1.2;
  }

  calculateMelanopic(rgb) {
    const weights = { red: 0.01, green: 0.10, blue: 0.89 };
    return (rgb.red * weights.red + rgb.green * weights.green + rgb.blue * weights.blue) * 0.92;
  }

  calculateColorTemperature(rgb) {
    if (rgb.red === 0 || rgb.green === 0 || rgb.blue === 0) {
      return 5000; // Default
    }
    
    const ratio = rgb.blue / rgb.red;
    
    if (ratio < 0.5) return 2700;
    else if (ratio < 1.0) return 4000;
    else if (ratio < 1.5) return 5500;
    else return 6500;
  }

  calculateCircadianStimulus(melanopic) {
    const threshold = 30;
    const saturation = 1000;
    
    if (melanopic <= threshold) return 0;
    
    return 0.7 * (1 - Math.exp(-(melanopic - threshold) / (saturation - threshold)));
  }

  calculatePhaseShift(melanopic, timeOfDay) {
    // Simplified phase response curve
    const curve = {
      0: -0.8, 1: -1.2, 2: -1.5, 3: -1.3, 4: -0.9, 5: -0.4,
      6: 0.0, 7: 0.3, 8: 0.5, 9: 0.4, 10: 0.2, 11: 0.0,
      12: 0.0, 13: 0.0, 14: 0.1, 15: 0.2, 16: 0.4, 17: 0.6,
      18: 0.8, 19: 1.0, 20: 0.6, 21: 0.2, 22: -0.2, 23: -0.5
    };
    
    const hour = Math.floor(timeOfDay);
    const sensitivity = curve[hour] || 0;
    const threshold = 100;
    
    if (melanopic > threshold) {
      return sensitivity * Math.log(melanopic / threshold);
    }
    
    return 0;
  }

  calculateBluePercentage(rgb) {
    const total = rgb.red + rgb.green + rgb.blue;
    return total > 0 ? Math.round((rgb.blue / total) * 100) : 0;
  }

  validateSensorData(data) {
    if (data.red < 0 || data.red > 255) return false;
    if (data.green < 0 || data.green > 255) return false;
    if (data.blue < 0 || data.blue > 255) return false;
    if (data.photopic < 0 || data.photopic > 100000) return false;
    if (data.melanopic < 0 || data.melanopic > 100000) return false;
    if (data.colorTemp < 1500 || data.colorTemp > 15000) return false;
    
    return true;
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.CalculationTests = CalculationTests;
  
  // Auto-run tests for demonstration
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 Auto-running calculation tests...');
    const tests = new CalculationTests();
    tests.runAllTests();
  });
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = CalculationTests;
  
  // Auto-run if called directly
  if (require.main === module) {
    const tests = new CalculationTests();
    tests.runAllTests();
  }
}
