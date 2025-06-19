// Scientific calculations for light metrics
class LightCalculations {
    constructor() {
        // CIE S 026/E:2018 melanopic action spectrum peak at 480nm
        this.melanopicFactors = {
            red: 0.001,    // 630-700nm range has minimal melanopic response
            green: 0.754,  // 500-565nm range has high melanopic response
            blue: 0.245    // 450-485nm range has moderate melanopic response
        };
        
        // CIE standard illuminants
        this.illuminants = {
            D65: { x: 0.31271, y: 0.32902 }, // Daylight
            A: { x: 0.44757, y: 0.40745 },   // Incandescent
            F2: { x: 0.37208, y: 0.37529 }   // Fluorescent
        };
        
        // Phase response curve data (simplified from Khalsa et al. 2003)
        this.prcData = {
            advance: { start: 6, peak: 8, end: 12 },
            delay: { start: 22, peak: 2, end: 6 }
        };
    }
    
    // Convert RGB to melanopic equivalent daylight illuminance (M-EDI)
    calculateMelanopicLux(r, g, b, visibleLux) {
        // Validate inputs
        if (!this.isValidNumber(r) || !this.isValidNumber(g) || 
            !this.isValidNumber(b) || !this.isValidNumber(visibleLux)) {
            return 0;
        }
        
        // Normalize RGB values (0-255 to 0-1)
        const rNorm = Math.max(0, Math.min(255, r)) / 255;
        const gNorm = Math.max(0, Math.min(255, g)) / 255;
        const bNorm = Math.max(0, Math.min(255, b)) / 255;
        
        // Calculate melanopic ratio based on spectral sensitivity
        const totalResponse = rNorm + gNorm + bNorm;
        if (totalResponse === 0) return 0;
        
        const melanopicResponse = (
            rNorm * this.melanopicFactors.red +
            gNorm * this.melanopicFactors.green +
            bNorm * this.melanopicFactors.blue
        );
        
        const melanopicRatio = melanopicResponse / totalResponse;
        
        // M-EDI = visible lux × melanopic ratio × 1.3262 (CIE conversion factor)
        const medi = visibleLux * melanopicRatio * 1.3262;
        
        return Math.max(0, Math.round(medi));
    }
    
    // Calculate color temperature from RGB using McCamy's approximation
    calculateColorTemperature(r, g, b) {
        // Validate inputs
        if (!this.isValidNumber(r) || !this.isValidNumber(g) || !this.isValidNumber(b)) {
            return 5500; // Default daylight
        }
        
        // Normalize RGB values
        const rNorm = Math.max(0, Math.min(255, r)) / 255;
        const gNorm = Math.max(0, Math.min(255, g)) / 255;
        const bNorm = Math.max(0, Math.min(255, b)) / 255;
        
        // Convert to XYZ color space
        const X = 0.412453 * rNorm + 0.357580 * gNorm + 0.180423 * bNorm;
        const Y = 0.212671 * rNorm + 0.715160 * gNorm + 0.072169 * bNorm;
        const Z = 0.019334 * rNorm + 0.119193 * gNorm + 0.950227 * bNorm;
        
        const sum = X + Y + Z;
        if (sum === 0) return 5500;
        
        // Calculate chromaticity coordinates
        const x = X / sum;
        const y = Y / sum;
        
        // McCamy's approximation formula
        const n = (x - 0.3320) / (0.1858 - y);
        const cct = 437 * Math.pow(n, 3) + 3601 * Math.pow(n, 2) + 6861 * n + 5517;
        
        // Clamp to reasonable range (1800K to 10000K)
        return Math.max(1800, Math.min(10000, Math.round(cct)));
    }
    
    // Calculate blue light hazard weighted irradiance
    calculateBlueLightHazard(b, totalLight) {
        // Validate inputs
        if (!this.isValidNumber(b) || !this.isValidNumber(totalLight) || totalLight === 0) {
            return 0;
        }
        
        // Blue light hazard function peaks at 435-440nm
        // The blue channel approximately covers 450-485nm
        const blueHazardWeight = 0.85; // Weighting factor for blue channel
        
        // Calculate relative blue light contribution
        const blueRatio = Math.max(0, Math.min(255, b)) / Math.max(1, totalLight);
        
        // Apply hazard weighting and convert to percentage
        const hazardValue = blueRatio * blueHazardWeight * 100;
        
        return Math.max(0, Math.min(100, Math.round(hazardValue)));
    }
    
    // Calculate circadian phase shift potential based on PRC
    calculatePhaseShift(melanopicLux, hour) {
        const currentHour = hour ?? new Date().getHours();
        let shiftMagnitude = 0;
        let shiftDirection = 'none';
        
        // Validate melanopic lux
        if (!this.isValidNumber(melanopicLux) || melanopicLux < 0) {
            return {
                direction: shiftDirection,
                magnitude: 0,
                recommendation: 'Invalid light measurement'
            };
        }
        
        // Phase advance window (morning)
        if (currentHour >= this.prcData.advance.start && 
            currentHour <= this.prcData.advance.end) {
            if (melanopicLux > 10) {
                // Logarithmic response to light intensity
                shiftMagnitude = Math.log10(melanopicLux / 10) * 0.5;
                shiftMagnitude = Math.min(2, Math.max(0, shiftMagnitude));
                if (shiftMagnitude > 0.1) {
                    shiftDirection = 'advance';
                }
            }
        }
        // Phase delay window (evening/night)
        else if (currentHour >= this.prcData.delay.start || 
                 currentHour <= this.prcData.delay.end) {
            if (melanopicLux > 10) {
                // Stronger response to evening light
                shiftMagnitude = Math.log10(melanopicLux / 10) * 0.8;
                shiftMagnitude = Math.min(3, Math.max(0, shiftMagnitude));
                if (shiftMagnitude > 0.1) {
                    shiftDirection = 'delay';
                }
            }
        }
        
        return {
            direction: shiftDirection,
            magnitude: Math.round(shiftMagnitude * 10) / 10,
            recommendation: this.getPhaseShiftRecommendation(shiftDirection, currentHour, melanopicLux)
        };
    }
    
    // Get recommendation based on phase shift
    getPhaseShiftRecommendation(direction, hour, melanopicLux) {
        if (direction === 'advance' && hour < 10) {
            return 'Good morning light exposure - helping align your circadian rhythm';
        } else if (direction === 'delay' && hour > 20) {
            if (melanopicLux > 50) {
                return 'High evening light - may delay sleep time. Reduce light exposure';
            }
            return 'Moderate evening light - consider dimming further';
        } else if (direction === 'none') {
            if (hour >= 6 && hour < 10 && melanopicLux < 100) {
                return 'Morning light too low - seek brighter light';
            }
            return 'Light levels appropriate for this time';
        }
        return 'Monitor light exposure for optimal circadian alignment';
    }
    
    // Calculate cumulative light exposure score
    calculateDailyLightScore(exposureHistory) {
        if (!Array.isArray(exposureHistory) || exposureHistory.length === 0) {
            return 0;
        }
        
        let score = 0;
        let morningLightMinutes = 0;
        let eveningDarkMinutes = 0;
        
        exposureHistory.forEach(reading => {
            if (!reading.timestamp || !this.isValidNumber(reading.melanopicLux)) return;
            
            const hour = new Date(reading.timestamp).getHours();
            const melanopicLux = reading.melanopicLux;
            
            // Morning light (6-10 AM) - most important
            if (hour >= 6 && hour < 10) {
                if (melanopicLux >= 250) {
                    morningLightMinutes++;
                    score += 1.5;
                } else if (melanopicLux >= 100) {
                    score += 0.5;
                }
            }
            // Daytime light (10 AM - 6 PM)
            else if (hour >= 10 && hour < 18) {
                if (melanopicLux >= 200) {
                    score += 0.5;
                } else if (melanopicLux >= 100) {
                    score += 0.3;
                }
            }
            // Evening light (6-10 PM) - should be lower
            else if (hour >= 18 && hour < 22) {
                if (melanopicLux <= 50) {
                    score += 0.5;
                    eveningDarkMinutes++;
                } else if (melanopicLux <= 100) {
                    score += 0.2;
                } else {
                    score -= 0.5; // Penalty for bright evening light
                }
            }
            // Night light (10 PM - 6 AM) - should be minimal
            else {
                if (melanopicLux <= 10) {
                    score += 0.3;
                } else if (melanopicLux <= 30) {
                    score += 0.1;
                } else {
                    score -= 1; // Strong penalty for night light
                }
            }
        });
        
        // Bonus for consistent patterns
        if (morningLightMinutes >= 30) score += 10;
        if (eveningDarkMinutes >= 120) score += 10;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    // Estimate cognitive performance based on light exposure
    estimateCognitivePerformance(melanopicLux, timeOfDay) {
        const hour = timeOfDay ?? new Date().getHours();
        
        // Validate input
        if (!this.isValidNumber(melanopicLux)) {
            return 50;
        }
        
        // Natural cognitive rhythm (based on circadian alertness patterns)
        let baselinePerformance;
        if (hour >= 9 && hour <= 11) {
            baselinePerformance = 90; // Morning peak
        } else if (hour >= 14 && hour <= 16) {
            baselinePerformance = 60; // Post-lunch dip
        } else if (hour >= 17 && hour <= 19) {
            baselinePerformance = 80; // Evening recovery
        } else if (hour >= 22 || hour <= 6) {
            baselinePerformance = 40; // Night-time low
        } else {
            baselinePerformance = 70; // Default
        }
        
        // Light influence on performance
        let lightModifier = 0;
        
        // During waking hours (6 AM - 10 PM)
        if (hour >= 6 && hour <= 22) {
            if (melanopicLux >= 250) {
                // Optimal light boosts performance
                lightModifier = Math.min(15, Math.log10(melanopicLux / 100) * 10);
            } else if (melanopicLux >= 100) {
                // Moderate light maintains performance
                lightModifier = 5;
            } else if (melanopicLux < 50) {
                // Insufficient light reduces performance
                lightModifier = -10 - (50 - melanopicLux) / 5;
            }
        }
        
        const totalPerformance = baselinePerformance + lightModifier;
        return Math.max(0, Math.min(100, Math.round(totalPerformance)));
    }
    
    // Calculate melatonin suppression percentage
    calculateMelatoninSuppression(melanopicLux, duration = 60) {
        // Validate inputs
        if (!this.isValidNumber(melanopicLux) || melanopicLux < 0) {
            return 0;
        }
        
        // Based on Zeitzer et al. (2000) dose-response curve
        // No suppression below 10 melanopic lux
        if (melanopicLux < 10) return 0;
        
        // Parameters for Hill equation
        const maxSuppression = 70; // Maximum ~70% suppression
        const halfMax = 100; // ~50% suppression at 100 melanopic lux
        const hillCoeff = 1.5; // Steepness of response
        
        // Hill equation for dose-response
        const suppression = maxSuppression * Math.pow(melanopicLux, hillCoeff) / 
            (Math.pow(halfMax, hillCoeff) + Math.pow(melanopicLux, hillCoeff));
        
        // Adjust for exposure duration (minutes)
        // Full effect after 2 hours
        const durationFactor = Math.min(1, Math.sqrt(duration / 120));
        
        return Math.round(suppression * durationFactor);
    }
    
    // Get optimal light levels for current time
    getOptimalLightLevels() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const timeDecimal = hour + minute / 60;
        
        const levels = {
            melanopicLux: 0,
            colorTemp: 2700,
            description: '',
            nextTransition: ''
        };
        
        // Define transitions with smooth curves
        if (timeDecimal >= 6 && timeDecimal < 9) {
            // Morning activation
            const progress = (timeDecimal - 6) / 3;
            levels.melanopicLux = Math.round(100 + progress * 150);
            levels.colorTemp = Math.round(3000 + progress * 2000);
            levels.description = 'Bright, cool light for morning activation';
            levels.nextTransition = 'Maintain bright light until 5 PM';
        } else if (timeDecimal >= 9 && timeDecimal < 17) {
            // Daytime maintenance
            levels.melanopicLux = 200;
            levels.colorTemp = 4500;
            levels.description = 'Moderate bright light for sustained alertness';
            levels.nextTransition = 'Begin dimming after 5 PM';
        } else if (timeDecimal >= 17 && timeDecimal < 20) {
            // Evening transition
            const progress = (timeDecimal - 17) / 3;
            levels.melanopicLux = Math.round(200 - progress * 150);
            levels.colorTemp = Math.round(4500 - progress * 1800);
            levels.description = 'Dimming warm light for evening transition';
            levels.nextTransition = 'Minimize light after 8 PM';
        } else if (timeDecimal >= 20 && timeDecimal < 22) {
            // Pre-sleep
            levels.melanopicLux = 30;
            levels.colorTemp = 2700;
            levels.description = 'Low warm light for melatonin production';
            levels.nextTransition = 'Sleep preparation';
        } else {
            // Night time
            levels.melanopicLux = 5;
            levels.colorTemp = 2200;
            levels.description = 'Minimal light for sleep';
            levels.nextTransition = 'Morning light after 6 AM';
        }
        
        return levels;
    }
    
    // Helper function to validate numbers
    isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }

    // NOVEL RESEARCH FEATURES

    // Estimate pupil diameter based on ambient light (Winn et al. 1994)
    estimatePupilDiameter(melanopicLux, age = 25) {
        // Validate inputs
        if (!this.isValidNumber(melanopicLux) || melanopicLux < 0) {
            return 4.0; // Average pupil size
        }

        // Winn et al. pupil diameter model
        // D = 7.75 - 5.75 * [log10(L) / log10(40)]^0.41
        // Where L is luminance in cd/m²
        // Convert melanopic lux to approximate luminance
        const luminance = Math.max(0.1, melanopicLux / 3.14); // Approximate conversion
        
        let diameter;
        if (luminance < 0.1) {
            diameter = 7.5; // Maximum dilation in darkness
        } else {
            const logRatio = Math.log10(luminance) / Math.log10(40);
            diameter = 7.75 - 5.75 * Math.pow(Math.abs(logRatio), 0.41);
        }

        // Age correction (pupils get smaller with age)
        const ageCorrection = 1 - (age - 20) * 0.006;
        diameter *= Math.max(0.7, ageCorrection);

        return Math.max(2.0, Math.min(8.0, Math.round(diameter * 10) / 10));
    }

    // Calculate retinal illuminance considering pupil size
    calculateRetinalIlluminance(melanopicLux, pupilDiameter) {
        if (!this.isValidNumber(melanopicLux) || !this.isValidNumber(pupilDiameter)) {
            return 0;
        }

        // Retinal illuminance = luminance × pupil area
        const pupilArea = Math.PI * Math.pow(pupilDiameter / 2, 2);
        const retinalIlluminance = melanopicLux * pupilArea / 100; // Simplified conversion

        return Math.round(retinalIlluminance);
    }

    // Calculate retinal stress score based on IEC 62471 (blue light hazard)
    calculateRetinalStressScore(r, g, b, exposureDurationMinutes = 60) {
        if (!this.isValidNumber(r) || !this.isValidNumber(g) || !this.isValidNumber(b)) {
            return 0;
        }

        // Blue light hazard function (simplified)
        const blueWeight = 0.85; // Peak around 435-440nm
        const greenWeight = 0.15; // Some contribution from green
        
        const normalizedB = Math.max(0, Math.min(255, b)) / 255;
        const normalizedG = Math.max(0, Math.min(255, g)) / 255;
        
        // Calculate blue light hazard weighted irradiance
        const hazardIrradiance = normalizedB * blueWeight + normalizedG * greenWeight;
        
        // Apply duration weighting (longer exposure = higher risk)
        const durationFactor = Math.sqrt(exposureDurationMinutes / 60);
        
        // Calculate stress score (0-100)
        const stressScore = hazardIrradiance * durationFactor * 100;
        
        return Math.max(0, Math.min(100, Math.round(stressScore)));
    }

    // Enhanced cognitive performance predictor with more factors
    predictCognitivePerformance(melanopicLux, timeOfDay, pupilDiameter, age = 25) {
        const hour = timeOfDay ?? new Date().getHours();
        
        // Base circadian rhythm (Monk et al. 1997)
        let basePerformance;
        const hourFloat = hour + (new Date().getMinutes() / 60);
        
        // Circadian performance curve (simplified)
        if (hourFloat >= 8 && hourFloat <= 10) {
            basePerformance = 95; // Morning peak
        } else if (hourFloat >= 10 && hourFloat <= 12) {
            basePerformance = 90; // Late morning
        } else if (hourFloat >= 12 && hourFloat <= 14) {
            basePerformance = 75; // Post-lunch dip start
        } else if (hourFloat >= 14 && hourFloat <= 16) {
            basePerformance = 65; // Post-lunch dip
        } else if (hourFloat >= 16 && hourFloat <= 19) {
            basePerformance = 85; // Evening recovery
        } else if (hourFloat >= 19 && hourFloat <= 22) {
            basePerformance = 70; // Evening decline
        } else {
            basePerformance = 40; // Night-time low
        }

        // Light influence (Cajochen et al. 2000)
        let lightBonus = 0;
        if (melanopicLux >= 250) {
            lightBonus = Math.min(20, Math.log10(melanopicLux / 100) * 15);
        } else if (melanopicLux >= 100) {
            lightBonus = 10;
        } else if (melanopicLux < 50 && hour >= 9 && hour <= 17) {
            lightBonus = -15; // Penalty for insufficient daylight
        }

        // Pupil size influence (smaller pupils = better focus)
        const pupilBonus = pupilDiameter ? (8 - pupilDiameter) * 2 : 0;

        // Age factor (peak performance around 25-30)
        const ageFactor = 1 - Math.abs(age - 27.5) * 0.005;

        const totalPerformance = (basePerformance + lightBonus + pupilBonus) * ageFactor;
        return Math.max(0, Math.min(100, Math.round(totalPerformance)));
    }

    // Calculate biological time vs clock time
    calculateBiologicalTime(melanopicExposureHistory, chronotype = 'intermediate') {
        if (!Array.isArray(melanopicExposureHistory) || melanopicExposureHistory.length === 0) {
            return {
                biologicalTime: new Date().getHours(),
                clockTime: new Date().getHours(),
                phaseShift: 0,
                alignment: 'unknown'
            };
        }

        const now = new Date();
        const clockTime = now.getHours() + now.getMinutes() / 60;

        // Calculate cumulative phase shifts from recent light exposure
        let cumulativeShift = 0;
        const last24Hours = melanopicExposureHistory.slice(-24);

        last24Hours.forEach((reading, index) => {
            if (!reading.melanopicLux || !reading.timestamp) return;

            const readingTime = new Date(reading.timestamp);
            const readingHour = readingTime.getHours();
            
            // Apply phase response curve
            const prcEffect = this.calculatePhaseShift(reading.melanopicLux, readingHour);
            if (prcEffect.direction === 'advance') {
                cumulativeShift += prcEffect.magnitude * 0.1;
            } else if (prcEffect.direction === 'delay') {
                cumulativeShift -= prcEffect.magnitude * 0.1;
            }
        });

        // Adjust for chronotype
        const chronotypeShift = {
            'morning': 1,     // Naturally earlier
            'intermediate': 0,
            'evening': -1     // Naturally later
        }[chronotype] || 0;

        const biologicalTime = clockTime + cumulativeShift + chronotypeShift;
        const phaseShift = cumulativeShift;

        let alignment;
        if (Math.abs(phaseShift) < 0.5) {
            alignment = 'well-aligned';
        } else if (phaseShift > 0.5) {
            alignment = 'phase-advanced';
        } else {
            alignment = 'phase-delayed';
        }

        return {
            biologicalTime: (biologicalTime + 24) % 24,
            clockTime: clockTime,
            phaseShift: Math.round(phaseShift * 10) / 10,
            alignment: alignment
        };
    }

    // Calculate spectral power distribution analysis
    analyzeSpectralPowerDistribution(r, g, b) {
        if (!this.isValidNumber(r) || !this.isValidNumber(g) || !this.isValidNumber(b)) {
            return {
                redPower: 0,
                greenPower: 0,
                bluePower: 0,
                spectralBalance: 'unknown',
                dominantWavelength: 500
            };
        }

        const total = r + g + b;
        if (total === 0) {
            return {
                redPower: 33.3,
                greenPower: 33.3,
                bluePower: 33.3,
                spectralBalance: 'neutral',
                dominantWavelength: 500
            };
        }

        const redPower = (r / total) * 100;
        const greenPower = (g / total) * 100;
        const bluePower = (b / total) * 100;

        // Determine spectral balance
        let spectralBalance;
        if (redPower > 50) {
            spectralBalance = 'warm-red-dominant';
        } else if (bluePower > 40) {
            spectralBalance = 'cool-blue-dominant';
        } else if (greenPower > 45) {
            spectralBalance = 'green-dominant';
        } else if (Math.abs(redPower - bluePower) < 10) {
            spectralBalance = 'balanced-spectrum';
        } else {
            spectralBalance = 'mixed-spectrum';
        }

        // Estimate dominant wavelength (simplified)
        const dominantWavelength = 470 + (redPower - bluePower) * 2;

        return {
            redPower: Math.round(redPower * 10) / 10,
            greenPower: Math.round(greenPower * 10) / 10,
            bluePower: Math.round(bluePower * 10) / 10,
            spectralBalance: spectralBalance,
            dominantWavelength: Math.max(380, Math.min(700, Math.round(dominantWavelength)))
        };
    }    // Calculate comprehensive light therapy recommendations
    generateLightTherapyRecommendation(currentMetrics, userProfile = {}) {
        if (!currentMetrics || !this.isValidNumber(currentMetrics.melanopicLux)) {
            return {
                type: 'invalid',
                message: 'Unable to generate recommendations - invalid data',
                actions: [],
                recommendations: []
            };
        }

        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        const timeDecimal = hour + minute / 60;
        const { melanopicLux, colorTemp, cognitivePerformance, retinalStress } = currentMetrics;
        const optimal = this.getOptimalLightLevels();

        const chronotype = userProfile.chronotype || 'intermediate';
        const goals = userProfile.goals || ['general_wellness'];
        const conditions = userProfile.conditions || [];
        const age = userProfile.age || 25;

        let mainRecommendation = {
            type: 'normal',
            urgency: 'low',
            message: '',
            actions: [],
            target: optimal,
            duration: 0,
            benefits: [],
            timing: this.getOptimalTimingRecommendation(hour, minute),
            safety: this.assessLightSafety(currentMetrics)
        };

        let recommendations = [];

        // Determine urgency and recommendation type
        const luxDeficit = optimal.melanopicLux - melanopicLux;
        const luxExcess = melanopicLux - optimal.melanopicLux;
        
        // Morning recommendations (6 AM - 10 AM)
        if (timeDecimal >= 6 && timeDecimal < 10) {
            if (melanopicLux < 100) {
                mainRecommendation.type = 'morning_boost';
                mainRecommendation.urgency = 'high';
                mainRecommendation.message = `Critical morning light deficit: ${melanopicLux} vs ${optimal.melanopicLux} needed. Your circadian phase may be delayed.`;
                mainRecommendation.actions = [
                    `Get ${Math.round(optimal.melanopicLux)} melanopic lux for 20-30 minutes`,
                    'Go outside within 30 minutes of waking',
                    'Use 10,000 lux therapy lamp at 18 inches',
                    'Face east-facing window during breakfast',
                    'Avoid sunglasses for first 30 minutes outdoors'
                ];
                mainRecommendation.duration = 25;
                mainRecommendation.benefits = [
                    'Advance circadian phase by 0.3-0.8 hours',
                    'Boost cognitive performance by 15-25%',
                    'Reduce morning grogginess',
                    'Improve evening sleep onset'
                ];
                
                recommendations.push({
                    type: 'bright_light_therapy',
                    duration: 30,
                    targetLux: 500,
                    timing: 'immediate',
                    evidence: 'Bright morning light helps advance circadian phase (Khalsa et al. 2003)'
                });
            } else if (melanopicLux < optimal.melanopicLux) {
                mainRecommendation.type = 'morning_optimization';
                mainRecommendation.urgency = 'medium';
                mainRecommendation.message = `Morning light is adequate but suboptimal. Additional ${Math.round(luxDeficit)} melanopic lux could enhance performance.`;
                mainRecommendation.actions = [
                    'Extend outdoor time by 5-10 minutes',
                    'Position closer to windows during morning routine',
                    'Consider circadian lighting at workstation'
                ];
                mainRecommendation.duration = 10;
                mainRecommendation.benefits = ['Enhanced alertness', 'Improved mood stability'];
            }
        } 
        // Daytime maintenance (10 AM - 5 PM)
        else if (timeDecimal >= 10 && timeDecimal < 17) {
            if (melanopicLux < 150) {
                mainRecommendation.type = 'daytime_boost';
                mainRecommendation.urgency = 'medium';
                mainRecommendation.message = `Midday light insufficient for sustained alertness. Current: ${melanopicLux}, target: 200+ melanopic lux.`;
                mainRecommendation.actions = [
                    'Take light break: 5-10 minutes outdoors',
                    'Work near window if possible',
                    'Use desk lamp with 5000K+ temperature',
                    'Consider circadian lighting system'
                ];
                mainRecommendation.duration = 5;
                mainRecommendation.benefits = ['Combat afternoon energy dip', 'Maintain cognitive performance'];
            }
        } 
        // Evening transition (5 PM - 10 PM)
        else if (timeDecimal >= 17 && timeDecimal < 22) {
            if (melanopicLux > 100) {
                mainRecommendation.type = 'evening_transition';
                mainRecommendation.urgency = luxExcess > 200 ? 'high' : 'medium';
                mainRecommendation.message = `Evening light too bright: ${melanopicLux} vs <50 recommended. Risk of delayed sleep by ${Math.round(luxExcess/100 * 0.5)} hours.`;
                mainRecommendation.actions = [
                    'Dim all lights to <50 melanopic lux',
                    'Switch to 2700K warm lighting',
                    'Use amber blue-blocking glasses',
                    'Enable night mode on all screens',
                    'Consider red spectrum lighting only'
                ];
                mainRecommendation.benefits = [
                    'Preserve natural melatonin rise',
                    'Prevent circadian phase delay',
                    'Improve sleep efficiency'
                ];
                
                recommendations.push({
                    type: 'light_reduction',
                    duration: 120,
                    targetLux: 30,
                    timing: 'gradual',
                    evidence: 'Dim evening light supports melatonin production (Zeitzer et al. 2000)'
                });
            }
        } 
        // Night protection (10 PM - 6 AM)
        else if (timeDecimal >= 22 || timeDecimal < 6) {
            if (melanopicLux > 10) {
                mainRecommendation.type = 'night_protection';
                mainRecommendation.urgency = 'critical';
                mainRecommendation.message = `Night light exposure detected: ${melanopicLux} melanopic lux. This can suppress melatonin by ${this.calculateMelatoninSuppression(melanopicLux)}%.`;
                mainRecommendation.actions = [
                    'Eliminate all unnecessary lighting',
                    'Use <1 lux red night lights only',
                    'Implement complete screen curfew',
                    'Use blackout curtains/eye mask',
                    'Check for light leaks around room'
                ];
                mainRecommendation.benefits = [
                    'Maintain melatonin production',
                    'Prevent circadian disruption',
                    'Preserve deep sleep quality'
                ];
            }
        }

        // Safety considerations
        if (retinalStress && retinalStress > 70) {
            mainRecommendation.urgency = 'critical';
            mainRecommendation.message += ` WARNING: High retinal stress detected (${retinalStress}/100). Risk of phototoxic damage.`;
            mainRecommendation.actions.unshift('Reduce light intensity immediately', 'Take breaks from bright screens');
        }

        // Cognitive performance enhancement
        if (cognitivePerformance && cognitivePerformance < 60 && timeDecimal >= 9 && timeDecimal <= 17) {
            const performanceBoost = this.predictPerformanceImprovement(melanopicLux, optimal.melanopicLux);
            mainRecommendation.message += ` Cognitive performance: ${cognitivePerformance}%. Light optimization could improve by ${performanceBoost}%.`;
            mainRecommendation.benefits.push(`Potential ${performanceBoost}% cognitive improvement`);
        }

        // Condition-specific recommendations
        if (conditions.includes('SAD')) {
            recommendations.push({
                type: 'blue_light_therapy',
                duration: 30,
                targetLux: 10000,
                timing: 'morning',
                evidence: 'Blue light therapy effective for Seasonal Affective Disorder'
            });
        }

        if (conditions.includes('insomnia')) {
            recommendations.push({
                type: 'circadian_alignment',
                duration: 60,
                targetLux: timeDecimal < 12 ? 1000 : 10,
                timing: timeDecimal < 12 ? 'morning' : 'evening',
                evidence: 'Light therapy helps regulate sleep-wake cycles'
            });
        }

        // Age adjustments
        if (age > 50) {
            // Older adults need more light and longer exposure
            if (mainRecommendation.target) {
                mainRecommendation.target.melanopicLux *= 1.5;
                mainRecommendation.duration *= 1.3;
            }
            mainRecommendation.message += ` (Age-adjusted: +50% intensity for optimal effect)`;
        }

        // Chronotype adjustments
        if (chronotype === 'morning') {
            // Earlier recommendations for morning types
            if (mainRecommendation.timing) {
                mainRecommendation.timing.optimalStart -= 0.5;
            }
        } else if (chronotype === 'evening') {
            // Later recommendations for evening types
            if (mainRecommendation.timing) {
                mainRecommendation.timing.optimalStart += 0.5;
            }
        }

        return {
            main: mainRecommendation,
            recommendations: recommendations,
            userProfile: userProfile
        };
    }

    // Get optimal timing recommendations
    getOptimalTimingRecommendation(hour, minute) {
        const timeDecimal = hour + minute / 60;
        
        if (timeDecimal >= 6 && timeDecimal < 10) {
            return {
                phase: 'morning_activation',
                optimalStart: 6.5,
                optimalEnd: 9,
                optimalDuration: 20,
                nextWindow: 'Maintain bright light until 5 PM'
            };
        } else if (timeDecimal >= 10 && timeDecimal < 17) {
            return {
                phase: 'daytime_maintenance', 
                optimalStart: 10,
                optimalEnd: 17,
                optimalDuration: 5,
                nextWindow: 'Begin dimming after 6 PM'
            };
        } else if (timeDecimal >= 17 && timeDecimal < 22) {
            return {
                phase: 'evening_transition',
                optimalStart: 17,
                optimalEnd: 22,
                optimalDuration: 60,
                nextWindow: 'Minimize light after 10 PM'
            };
        } else {
            return {
                phase: 'night_protection',
                optimalStart: 22,
                optimalEnd: 6,
                optimalDuration: 480,
                nextWindow: 'Morning light after 6 AM'
            };
        }
    }

    // Assess light safety
    assessLightSafety(metrics) {
        const { melanopicLux, retinalStress, colorTemp } = metrics;
        
        let safetyLevel = 'safe';
        let warnings = [];
        
        if (retinalStress > 80) {
            safetyLevel = 'dangerous';
            warnings.push('Critical retinal stress - reduce exposure immediately');
        } else if (retinalStress > 60) {
            safetyLevel = 'caution';
            warnings.push('High blue light exposure - consider breaks');
        }
        
        if (melanopicLux > 5000) {
            safetyLevel = 'caution';
            warnings.push('Very high light intensity - limit exposure duration');
        }
        
        if (colorTemp > 8000) {
            warnings.push('Very blue light - may cause eye strain');
        }
        
        return {
            level: safetyLevel,
            warnings: warnings,
            maxSafeExposure: retinalStress > 60 ? 30 : 120 // minutes
        };
    }

    // Predict performance improvement
    predictPerformanceImprovement(currentLux, optimalLux) {
        if (currentLux >= optimalLux) return 0;
        
        const deficit = optimalLux - currentLux;
        const maxImprovement = 25; // Maximum possible improvement
        
        // Logarithmic improvement curve
        const improvement = maxImprovement * (1 - Math.exp(-deficit / 200));
        
        return Math.round(improvement);
    }
}

// Export for use in other modules
export const lightCalc = new LightCalculations();