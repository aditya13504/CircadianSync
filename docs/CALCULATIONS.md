# CircadianSync Calculations & Formulas

## Overview
This document details the scientific calculations and formulas used in CircadianSync for circadian rhythm analysis and light therapy recommendations.

## Core Concepts

### Circadian Phase Response Curve (PRC)
The PRC describes how light exposure at different times affects circadian phase shifts.

**Phase Shift Calculation:**
```
Δφ = A × sin(2π × (t - φ) / 24) × f(I)
```

Where:
- `Δφ`: Phase shift (hours)
- `A`: Maximum phase shift amplitude (typically 2-3 hours)
- `t`: Time of light exposure (decimal hours)
- `φ`: Current circadian phase
- `f(I)`: Intensity response function

### Melanopic Lux Conversion
Conversion from photopic lux to melanopic lux using spectral data:

**Basic Conversion:**
```javascript
melanopicLux = photopicLux × melanopicRatio
```

**Spectral Calculation:**
```javascript
melanopicLux = ∑(λ=380 to 780) [
  S(λ) × V_mel(λ) × Δλ
]
```

Where:
- `S(λ)`: Spectral power distribution
- `V_mel(λ)`: Melanopic action spectrum
- `Δλ`: Wavelength interval (typically 1nm)

### Alertness Model
Based on the three-process model of alertness:

**Process C (Circadian):**
```
C(t) = A_c × cos(2π × (t - φ) / 24 + π)
```

**Process S (Sleep Homeostatic):**
```
S(t) = S_max × (1 - e^(-t/τ))  // During wake
S(t) = S(0) × e^(-t/τ_s)       // During sleep
```

**Combined Alertness:**
```
Alertness(t) = C(t) + S(t) + L(t)
```

Where `L(t)` is the light-dependent component.

## Specific Calculations

### 1. CCT to RGB Conversion
Convert Correlated Color Temperature to RGB values:

```javascript
function cctToRgb(cct) {
  // Planckian locus approximation
  let temp = cct / 100;
  
  // Red calculation
  let red = temp <= 66 ? 255 : 
    329.698727446 * Math.pow(temp - 60, -0.1332047592);
  
  // Green calculation
  let green = temp <= 66 ? 
    99.4708025861 * Math.log(temp) - 161.1195681661 :
    288.1221695283 * Math.pow(temp - 60, -0.0755148492);
  
  // Blue calculation
  let blue = temp >= 66 ? 255 :
    temp <= 19 ? 0 :
    138.5177312231 * Math.log(temp - 10) - 305.0447927307;
  
  return [
    Math.max(0, Math.min(255, red)),
    Math.max(0, Math.min(255, green)),
    Math.max(0, Math.min(255, blue))
  ];
}
```

### 2. Circadian Phase Estimation
Estimate current circadian phase from light exposure history:

```javascript
function estimateCircadianPhase(lightHistory, currentTime) {
  let phase = 0; // Start at midnight
  
  for (let exposure of lightHistory) {
    let timeFromMidnight = (exposure.timestamp % 24);
    let phaseShift = calculatePhaseShift(
      exposure.melanopicLux,
      timeFromMidnight,
      phase
    );
    phase = (phase + phaseShift) % 24;
  }
  
  return phase;
}

function calculatePhaseShift(intensity, time, currentPhase) {
  // PRC parameters
  const maxShift = 2.5; // hours
  const sensitivity = 0.1; // lux^-1
  
  // Intensity response (saturating function)
  let intensityFactor = intensity / (intensity + 100);
  
  // Phase response curve
  let phaseAngle = 2 * Math.PI * (time - currentPhase) / 24;
  let prcValue = Math.sin(phaseAngle);
  
  return maxShift * intensityFactor * prcValue * sensitivity;
}
```

### 3. Melanopic Equivalent Daylight Illuminance (EDI)
Calculate the circadian effectiveness of light:

```javascript
function calculateMelanopicEDI(lux, cct, spectrum = null) {
  if (spectrum) {
    // Use full spectral data if available
    return calculateSpectralMelanopic(spectrum);
  }
  
  // CCT-based approximation
  let melanopicRatio = getMelanopicRatio(cct);
  return lux * melanopicRatio;
}

function getMelanopicRatio(cct) {
  // Polynomial approximation for daylight spectra
  if (cct < 2700) return 0.3;
  if (cct > 10000) return 1.8;
  
  // Quadratic fit to CIE illuminants
  let x = (cct - 2700) / 7300;
  return 0.3 + 1.5 * x + 0.8 * x * x;
}
```

### 4. Sleep Timing Optimization
Calculate optimal sleep and wake times:

```javascript
function optimizeSleepTiming(currentPhase, preferences) {
  const optimalSleepPhase = 22; // 10 PM circadian time
  const optimalWakePhase = 6;   // 6 AM circadian time
  
  // Calculate phase difference
  let phaseDiff = (currentPhase - optimalSleepPhase + 24) % 24;
  if (phaseDiff > 12) phaseDiff -= 24;
  
  // Adjust bedtime based on phase difference
  let adjustedBedtime = preferences.bedtime - phaseDiff;
  let adjustedWakeTime = preferences.wakeTime - phaseDiff;
  
  return {
    optimalBedtime: normalizeTime(adjustedBedtime),
    optimalWakeTime: normalizeTime(adjustedWakeTime),
    phaseShiftNeeded: phaseDiff
  };
}
```

### 5. Light Therapy Dosage
Calculate required light therapy parameters:

```javascript
function calculateLightTherapy(currentPhase, targetPhase, timeAvailable) {
  let phaseShiftNeeded = (targetPhase - currentPhase + 24) % 24;
  if (phaseShiftNeeded > 12) phaseShiftNeeded -= 24;
  
  // Determine optimal timing
  let currentTime = new Date().getHours() + new Date().getMinutes() / 60;
  let optimalTime = findOptimalTherapyTime(currentPhase, phaseShiftNeeded);
  
  // Calculate required intensity and duration
  let maxShiftPerSession = 1.5; // hours
  let sessions = Math.ceil(Math.abs(phaseShiftNeeded) / maxShiftPerSession);
  
  let intensity = calculateRequiredIntensity(
    phaseShiftNeeded / sessions,
    optimalTime,
    currentPhase
  );
  
  let duration = Math.min(60, Math.max(15, 30 * Math.abs(phaseShiftNeeded)));
  
  return {
    intensity: Math.round(intensity),
    duration: Math.round(duration),
    timing: optimalTime,
    sessions: sessions,
    type: phaseShiftNeeded > 0 ? 'advance' : 'delay'
  };
}

function calculateRequiredIntensity(targetShift, time, phase) {
  // Inverse PRC calculation
  let phaseAngle = 2 * Math.PI * (time - phase) / 24;
  let prcValue = Math.sin(phaseAngle);
  
  if (Math.abs(prcValue) < 0.1) return 10000; // Maximum intensity if poor timing
  
  // Solve for required intensity
  let maxShift = 2.5;
  let sensitivity = 0.1;
  let requiredIntensityFactor = Math.abs(targetShift) / (maxShift * Math.abs(prcValue) * sensitivity);
  
  // Convert to lux (assumes melanopic)
  let intensity = requiredIntensityFactor * 100 / (1 - requiredIntensityFactor);
  
  return Math.max(100, Math.min(10000, intensity));
}
```

### 6. Circadian Stimulus Calculation
Based on Rea & Figueiro model:

```javascript
function calculateCircadianStimulus(melanopicLux) {
  // CS = 0.7 - (0.7 / (1 + (CLA / 355.7)^1.1026))
  // Where CLA is Circadian Light (approximated by melanopic lux)
  
  const a1 = 355.7;
  const a2 = 1.1026;
  const a3 = 0.7;
  
  let cla = melanopicLux;
  let cs = a3 - (a3 / (1 + Math.pow(cla / a1, a2)));
  
  return Math.max(0, Math.min(0.7, cs));
}
```

## Validation & Quality Metrics

### Data Quality Assessment
```javascript
function assessDataQuality(readings) {
  let quality = {
    completeness: 0,
    consistency: 0,
    accuracy: 0,
    overall: 0
  };
  
  // Completeness: percentage of expected readings
  let expectedReadings = 24 * 60 / 5; // Every 5 minutes
  quality.completeness = Math.min(1, readings.length / expectedReadings);
  
  // Consistency: variation in similar conditions
  quality.consistency = calculateConsistency(readings);
  
  // Accuracy: sensor calibration quality
  quality.accuracy = assessAccuracy(readings);
  
  quality.overall = (quality.completeness + quality.consistency + quality.accuracy) / 3;
  
  return quality;
}
```

### Confidence Intervals
Calculate confidence in phase estimates:

```javascript
function calculatePhaseConfidence(readings, phase) {
  let variance = calculatePhaseVariance(readings);
  let n = readings.length;
  
  // Standard error
  let se = Math.sqrt(variance / n);
  
  // 95% confidence interval
  let margin = 1.96 * se;
  
  return {
    phase: phase,
    confidence: Math.max(0, 1 - se),
    lowerBound: phase - margin,
    upperBound: phase + margin
  };
}
```

## Research References

1. **Phase Response Curves**: Khalsa et al. (2003) Journal of Physiology
2. **Melanopic Lux**: Lucas et al. (2014) Trends in Neurosciences  
3. **Circadian Stimulus**: Rea & Figueiro (2018) Light & Engineering
4. **Three-Process Model**: Borbély & Achermann (1999) Journal of Biological Rhythms
5. **Light Therapy**: Zeitzer et al. (2000) American Journal of Physiology

## Constants & Parameters

```javascript
const CIRCADIAN_CONSTANTS = {
  // Phase Response Curve
  PRC_AMPLITUDE: 2.5,        // Maximum phase shift (hours)
  PRC_SENSITIVITY: 0.1,      // Light sensitivity
  
  // Melanopic Ratios by CCT
  MELANOPIC_RATIOS: {
    2700: 0.31,
    3000: 0.40,
    4000: 0.55,
    5000: 0.68,
    6500: 0.90,
    10000: 1.26
  },
  
  // Alertness Model
  CIRCADIAN_AMPLITUDE: 0.3,
  SLEEP_TAU: 18.0,           // Sleep pressure time constant
  WAKE_TAU: 16.0,            // Recovery time constant
  
  // Thresholds
  MIN_MELANOPIC_LUX: 10,     // Threshold for circadian effect
  MAX_SAFE_LUX: 10000,       // Safety limit
  OPTIMAL_MORNING_LUX: 1000, // Morning light therapy
  OPTIMAL_EVENING_LUX: 10    // Evening dim light
};
```
