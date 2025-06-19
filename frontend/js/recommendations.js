// Import light calculations
import { lightCalc } from './calculations.js';

// AI-powered recommendation engine
class RecommendationEngine {
    constructor() {
        this.recommendations = [];
        this.userProfile = this.loadUserProfile();
        this.thresholds = {
            morning: { start: 6, end: 10, minLux: 250 },
            day: { start: 10, end: 17, minLux: 200 },
            evening: { start: 17, end: 20, maxLux: 100 },
            night: { start: 20, end: 6, maxLux: 50 }
        };
    }
    
    // Load user profile from storage
    loadUserProfile() {
        const stored = localStorage.getItem('userProfile');
        return stored ? JSON.parse(stored) : {
            chronotype: 'intermediate', // morning, intermediate, evening
            sensitivity: 'normal', // low, normal, high
            goals: ['better_sleep', 'more_energy'],
            conditions: [] // SAD, insomnia, shift_work, etc.
        };
    }
      // Generate recommendations based on current data
    generateRecommendations(sensorData, calculatedMetrics) {
        this.recommendations = [];
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        
        // Get comprehensive therapy recommendations from calculations
        const therapyRec = lightCalc.generateLightTherapyRecommendation(calculatedMetrics, this.userProfile);
        
        // Convert therapy recommendations to UI format
        if (therapyRec.main && therapyRec.main.type !== 'normal') {
            this.recommendations.push({
                id: 'therapy-main',
                type: therapyRec.main.type,
                priority: therapyRec.main.urgency,
                title: this.getRecommendationTitle(therapyRec.main.type),
                message: therapyRec.main.message,
                actions: therapyRec.main.actions,
                benefits: therapyRec.main.benefits,
                duration: therapyRec.main.duration,
                timing: therapyRec.main.timing,
                safety: therapyRec.main.safety,
                icon: this.getRecommendationIcon(therapyRec.main.type)
            });
        }
        
        // Add research-specific recommendations from detailed analysis
        if (therapyRec.recommendations && therapyRec.recommendations.length > 0) {
            therapyRec.recommendations.forEach(rec => {
                this.recommendations.push({
                    id: `research-${rec.type}`,
                    type: rec.type,
                    priority: 'medium',
                    title: this.getResearchTitle(rec.type),
                    message: `${rec.evidence}`,
                    actions: [`${rec.duration}min session`, `Target: ${rec.targetLux} lux`, `Timing: ${rec.timing}`],
                    benefits: ['Evidence-based intervention'],
                    icon: '🔬'
                });
            });
        }
        
        // Traditional time-based recommendations
        this.checkTimeBasedRecommendations(hour, minute, calculatedMetrics);
        
        // Light level recommendations
        this.checkLightLevelRecommendations(calculatedMetrics, hour);
        
        // Color temperature recommendations
        this.checkColorTempRecommendations(calculatedMetrics.colorTemp, hour);
        
        // Circadian phase recommendations
        this.checkPhaseRecommendations(calculatedMetrics.phaseShift);
        
        // Blue light recommendations
        this.checkBlueLightRecommendations(calculatedMetrics.blueLight, hour);
        
        // Novel research-based recommendations
        this.checkCognitivePerformanceRecommendations(calculatedMetrics);
        this.checkMelatoninSuppressionRecommendations(calculatedMetrics);
        this.checkRetinalStressRecommendations(calculatedMetrics);
        
        // Sort by priority
        this.recommendations.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        
        return this.recommendations.slice(0, 3); // Top 3 recommendations
    }
    
    // Check time-specific recommendations
    checkTimeBasedRecommendations(hour, minute, metrics) {
        // Morning light check (6-10 AM)
        if (hour >= 6 && hour < 10) {
            if (metrics.melanopicLux < this.thresholds.morning.minLux) {
                this.addRecommendation({
                    id: 'morning_light',
                    title: 'Boost Morning Light',
                    description: 'Get bright light exposure to kickstart your day. Aim for 15-30 minutes near a window or outside.',
                    icon: '☀️',
                    priority: 'high',
                    action: {
                        type: 'timer',
                        duration: 900, // 15 minutes
                        target: 250
                    }
                });
            }
        }
        
        // Post-lunch dip (2-3 PM)
        if (hour >= 14 && hour < 16) {
            if (metrics.melanopicLux < 150) {
                this.addRecommendation({
                    id: 'afternoon_boost',
                    title: 'Combat Afternoon Slump',
                    description: 'Increase light exposure to maintain alertness. A short walk outside can help.',
                    icon: '🚶',
                    priority: 'medium',
                    action: {
                        type: 'timer',
                        duration: 600, // 10 minutes
                        target: 200
                    }
                });
            }
        }
        
        // Evening wind-down (8-10 PM)
        if (hour >= 20 && hour < 22) {
            if (metrics.melanopicLux > this.thresholds.night.maxLux) {
                this.addRecommendation({
                    id: 'evening_dimming',
                    title: 'Prepare for Sleep',
                    description: 'Reduce bright light exposure. Use dim, warm lighting to support melatonin production.',
                    icon: '🌙',
                    priority: 'high',
                    action: {
                        type: 'reduce',
                        target: 30
                    }
                });
            }
        }
    }
    
    // Check light level appropriateness
    checkLightLevelRecommendations(metrics, hour) {
        const optimal = lightCalc.getOptimalLightLevels();
        const difference = metrics.melanopicLux - optimal.melanopicLux;
        
        if (Math.abs(difference) > 100) {
            if (difference < 0) {
                // Too little light
                this.addRecommendation({
                    id: 'increase_light',
                    title: 'Insufficient Light',
                    description: `Your light levels are ${Math.abs(difference)} mel-lux below optimal. ${optimal.description}`,
                    icon: '💡',
                    priority: hour >= 9 && hour <= 17 ? 'high' : 'medium',
                    action: {
                        type: 'increase',
                        target: optimal.melanopicLux
                    }
                });
            } else if (hour >= 20 || hour < 6) {
                // Too much light at night
                this.addRecommendation({
                    id: 'decrease_light',
                    title: 'Excessive Evening Light',
                    description: 'High light levels may interfere with sleep. Consider dimming lights or using blue light filters.',
                    icon: '🔅',
                    priority: 'high',
                    action: {
                        type: 'reduce',
                        target: optimal.melanopicLux
                    }
                });
            }
        }
    }
    
    // Check color temperature
    checkColorTempRecommendations(colorTemp, hour) {
        if (hour >= 6 && hour < 12 && colorTemp < 4000) {
            this.addRecommendation({
                id: 'cool_morning',
                title: 'Add Cool Light',
                description: 'Cooler, bluer light in the morning helps with alertness. Try daylight bulbs or natural sunlight.',
                icon: '❄️',
                priority: 'medium'
            });
        } else if (hour >= 20 && colorTemp > 3000) {
            this.addRecommendation({
                id: 'warm_evening',
                title: 'Switch to Warm Light',
                description: 'Use warmer, redder light in the evening. Consider "sunset" bulbs or candlelight.',
                icon: '🕯️',
                priority: 'high'
            });
        }
    }
    
    // Check circadian phase alignment
    checkPhaseRecommendations(phaseShift) {
        if (phaseShift.direction === 'delay' && phaseShift.magnitude > 1) {
            this.addRecommendation({
                id: 'phase_delay_warning',
                title: 'Circadian Delay Risk',
                description: 'Current light exposure may delay your sleep time. Reduce light exposure now.',
                icon: '⏰',
                priority: 'high',
                action: {
                    type: 'alert',
                    message: phaseShift.recommendation
                }
            });
        }
    }
    
    // Check blue light exposure
    checkBlueLightRecommendations(blueLight, hour) {
        if (hour >= 21 && blueLight > 30) {
            this.addRecommendation({
                id: 'blue_light_alert',
                title: 'High Blue Light',
                description: 'Excessive blue light can suppress melatonin. Use night mode on devices or blue light glasses.',
                icon: '🔵',
                priority: 'high'
            });
        } else if (hour >= 9 && hour <= 15 && blueLight < 20) {
            this.addRecommendation({
                id: 'blue_light_boost',
                title: 'Increase Blue Light',
                description: 'Blue light during the day supports alertness. Consider brighter, cooler lighting.',
                icon: '💙',
                priority: 'low'
            });
        }
    }
    
    // Add recommendation (avoid duplicates)
    addRecommendation(rec) {
        if (!this.recommendations.find(r => r.id === rec.id)) {
            this.recommendations.push(rec);
        }
    }
    
    // Get intervention suggestions
    getInterventionSuggestions(currentMetrics) {
        const suggestions = [];
        const hour = new Date().getHours();
        
        if (currentMetrics.melanopicLux < 50 && hour >= 9 && hour <= 17) {
            suggestions.push({
                action: 'Go outside for a walk',
                duration: '10-15 minutes',
                benefit: 'Natural sunlight provides 10,000+ mel-lux'
            });
            suggestions.push({
                action: 'Sit by a window',
                duration: '20-30 minutes',
                benefit: 'Window light provides 500-2000 mel-lux'
            });
        }
        
        if (currentMetrics.melanopicLux > 100 && hour >= 21) {
            suggestions.push({
                action: 'Dim all lights',
                duration: 'Until bedtime',
                benefit: 'Supports melatonin production'
            });
            suggestions.push({
                action: 'Use candlelight or salt lamp',
                duration: 'Evening hours',
                benefit: 'Provides <10 mel-lux'
            });
        }
        
        return suggestions;
    }
    
    // Generate personalized insights
    generateInsights(dailyData) {
        const insights = [];
        
        // Calculate average morning light
        const morningData = dailyData.filter(d => {
            const hour = new Date(d.timestamp).getHours();
            return hour >= 6 && hour < 10;
        });
        
        if (morningData.length > 0) {
            const avgMorning = morningData.reduce((sum, d) => sum + d.melanopicLux, 0) / morningData.length;
            
            if (avgMorning < 200) {
                insights.push({
                    type: 'pattern',
                    title: 'Low Morning Light Pattern',
                    description: 'Your morning light exposure is consistently low. This may affect your energy levels and mood throughout the day.',
                    suggestion: 'Try to get bright light within 30 minutes of waking.'
                });
            }
        }
        
        // Check evening compliance
        const eveningData = dailyData.filter(d => {
            const hour = new Date(d.timestamp).getHours();
            return hour >= 20 && hour <= 23;
        });
        
        if (eveningData.length > 0) {
            const avgEvening = eveningData.reduce((sum, d) => sum + d.melanopicLux, 0) / eveningData.length;
            
            if (avgEvening > 100) {
                insights.push({
                    type: 'warning',
                    title: 'High Evening Light Exposure',
                    description: 'Your evening light levels may be interfering with sleep quality.',
                    suggestion: 'Implement a "sunset routine" starting 2 hours before bed.'
                });
            }
        }
        
        return insights;
    }
    
    // Helper functions for therapy recommendations
    getRecommendationTitle(type) {
        const titles = {
            'morning_boost': '🌅 Critical Morning Light Needed',
            'morning_optimization': '☀️ Optimize Morning Light',
            'daytime_boost': '💡 Boost Daytime Alertness',
            'evening_transition': '🌇 Evening Light Too Bright',
            'night_protection': '🌙 Night Light Protection',
            'invalid': '⚠️ Data Issue'
        };
        return titles[type] || '💡 Light Optimization';
    }
    
    getRecommendationIcon(type) {
        const icons = {
            'morning_boost': '🌅',
            'morning_optimization': '☀️',
            'daytime_boost': '💡',
            'evening_transition': '🌇',
            'night_protection': '🌙',
            'invalid': '⚠️'
        };
        return icons[type] || '💡';
    }
    
    getResearchTitle(type) {
        const titles = {
            'bright_light_therapy': '💡 Bright Light Therapy',
            'blue_light_therapy': '🔵 Blue Light Therapy',
            'light_reduction': '🔅 Light Reduction Protocol',
            'circadian_alignment': '🕐 Circadian Alignment'
        };
        return titles[type] || '🔬 Research-Based Protocol';
    }
    
    // Novel research-based recommendation checks
    checkCognitivePerformanceRecommendations(metrics) {
        if (metrics.cognitivePerformance && metrics.cognitivePerformance < 60) {
            const hour = new Date().getHours();
            
            if (hour >= 9 && hour <= 17) {
                this.addRecommendation({
                    id: 'cognitive-boost',
                    type: 'cognitive_enhancement',
                    priority: 'medium',
                    title: '🧠 Boost Cognitive Performance',
                    message: `Current performance: ${metrics.cognitivePerformance}%. Light optimization could improve focus by up to 25%.`,
                    actions: [
                        'Take a 5-10 minute break outdoors',
                        'Position near window or bright light source',
                        'Use task lighting with 5000K+ temperature'
                    ],
                    benefits: ['Enhanced focus', 'Improved alertness', 'Better problem-solving'],
                    icon: '🧠',
                    duration: 10
                });
            }
        }
    }
    
    checkMelatoninSuppressionRecommendations(metrics) {
        if (metrics.melatoninSuppression && metrics.melatoninSuppression > 30) {
            const hour = new Date().getHours();
            
            if (hour >= 20 || hour <= 6) {
                this.addRecommendation({
                    id: 'melatonin-protection',
                    type: 'melatonin_protection',
                    priority: 'high',
                    title: '😴 Protect Melatonin Production',
                    message: `Current light is suppressing melatonin by ${metrics.melatoninSuppression}%. This can significantly impact sleep quality.`,
                    actions: [
                        'Dim all lights to <10 melanopic lux',
                        'Use red spectrum lighting only',
                        'Implement complete screen curfew',
                        'Consider blackout curtains'
                    ],
                    benefits: ['Natural sleep onset', 'Improved sleep quality', 'Better recovery'],
                    icon: '😴',
                    urgency: 'immediate'
                });
            }
        }
    }
    
    checkRetinalStressRecommendations(metrics) {
        if (metrics.retinalStress && metrics.retinalStress > 60) {
            let priority = 'medium';
            let urgency = 'monitor';
            
            if (metrics.retinalStress > 80) {
                priority = 'critical';
                urgency = 'immediate';
            }
            
            this.addRecommendation({
                id: 'retinal-protection',
                type: 'retinal_protection',
                priority: priority,
                title: '👁️ Retinal Stress Warning',
                message: `High retinal stress detected (${metrics.retinalStress}/100). Prolonged exposure may cause eye strain or damage.`,
                actions: [
                    'Reduce screen brightness immediately',
                    'Take frequent breaks (20-20-20 rule)',
                    'Use blue light filtering glasses',
                    'Increase distance from bright sources',
                    'Consider professional eye examination'
                ],
                benefits: ['Prevent eye strain', 'Reduce headaches', 'Protect long-term vision'],
                icon: '👁️',                urgency: urgency
            });
        }
    }
}

// Export recommendation engine
export const recommendations = new RecommendationEngine();