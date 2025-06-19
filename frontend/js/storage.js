// Local storage management for CircadianSync
class StorageManager {
    constructor() {
        this.storageKey = 'circadianSync';
        this.maxDataPoints = 10080; // 7 days of minute-by-minute data
        this.initStorage();
    }
    
    // Initialize storage structure
    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                version: '1.0',
                userData: {
                    profile: {
                        chronotype: null,
                        goals: [],
                        createdAt: Date.now()
                    },
                    preferences: {
                        notifications: true,
                        demoMode: false,
                        units: 'metric'
                    }
                },
                sensorData: [],
                insights: [],
                calibration: null
            };
            
            this.save(initialData);
        }
    }
    
    // Get all data
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage read error:', error);
            return null;
        }
    }
    
    // Save all data
    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage write error:', error);
            
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                // Try again
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error('Storage write failed after cleanup:', retryError);
                    return false;
                }
            }
            return false;
        }
    }
    
    // Add sensor reading
    addSensorReading(reading) {
        const data = this.getAll();
        if (!data) return false;
        
        // Add timestamp if not present
        if (!reading.timestamp) {
            reading.timestamp = Date.now();
        }
        
        // Add calculated metrics
        reading.melanopicLux = lightCalc.calculateMelanopicLux(
            reading.r, reading.g, reading.b, reading.lux
        );
        reading.colorTemp = lightCalc.calculateColorTemperature(
            reading.r, reading.g, reading.b
        );
        
        // Add to array
        data.sensorData.push(reading);
        
        // Maintain size limit
        if (data.sensorData.length > this.maxDataPoints) {
            data.sensorData = data.sensorData.slice(-this.maxDataPoints);
        }
        
        return this.save(data);
    }
    
    // Get recent sensor data
    getRecentReadings(minutes = 60) {
        const data = this.getAll();
        if (!data || !data.sensorData) return [];
        
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return data.sensorData.filter(reading => reading.timestamp > cutoff);
    }
    
    // Get today's data
    getTodayReadings() {
        const data = this.getAll();
        if (!data || !data.sensorData) return [];
        
        const today = new Date().setHours(0, 0, 0, 0);
        return data.sensorData.filter(reading => 
            new Date(reading.timestamp).setHours(0, 0, 0, 0) === today
        );
    }
    
    // Get data for specific date range
    getReadingsInRange(startDate, endDate) {
        const data = this.getAll();
        if (!data || !data.sensorData) return [];
        
        return data.sensorData.filter(reading => 
            reading.timestamp >= startDate && reading.timestamp <= endDate
        );
    }
    
    // Update user profile
    updateUserProfile(profile) {
        const data = this.getAll();
        if (!data) return false;
        
        data.userData.profile = {
            ...data.userData.profile,
            ...profile,
            updatedAt: Date.now()
        };
        
        return this.save(data);
    }
    
    // Update preferences
    updatePreferences(preferences) {
        const data = this.getAll();
        if (!data) return false;
        
        data.userData.preferences = {
            ...data.userData.preferences,
            ...preferences
        };
        
        return this.save(data);
    }
    
    // Add insight
    addInsight(insight) {
        const data = this.getAll();
        if (!data) return false;
        
        insight.id = Date.now().toString();
        insight.createdAt = Date.now();
        insight.dismissed = false;
        
        data.insights.push(insight);
        
        // Keep only last 50 insights
        if (data.insights.length > 50) {
            data.insights = data.insights.slice(-50);
        }
        
        return this.save(data);
    }
    
    // Get undismissed insights
    getActiveInsights() {
        const data = this.getAll();
        if (!data || !data.insights) return [];
        
        return data.insights.filter(insight => !insight.dismissed);
    }
    
    // Dismiss insight
    dismissInsight(insightId) {
        const data = this.getAll();
        if (!data || !data.insights) return false;
        
        const insight = data.insights.find(i => i.id === insightId);
        if (insight) {
            insight.dismissed = true;
            insight.dismissedAt = Date.now();
            return this.save(data);
        }
        
        return false;
    }
    
    // Save calibration data
    saveCalibration(calibration) {
        const data = this.getAll();
        if (!data) return false;
        
        data.calibration = {
            ...calibration,
            timestamp: Date.now()
        };
        
        return this.save(data);
    }
    
    // Get statistics
    getStatistics() {
        const data = this.getAll();
        if (!data || !data.sensorData.length === 0) {
            return {
                totalReadings: 0,
                averageMelanopicLux: 0,
                averageColorTemp: 0,
                daysTracked: 0
            };
        }
        
        const readings = data.sensorData;
        const totalReadings = readings.length;
        
        const avgMelanopic = readings.reduce((sum, r) => sum + (r.melanopicLux || 0), 0) / totalReadings;
        const avgColorTemp = readings.reduce((sum, r) => sum + (r.colorTemp || 0), 0) / totalReadings;
        
        const firstReading = new Date(readings[0].timestamp);
        const lastReading = new Date(readings[readings.length - 1].timestamp);
        const daysTracked = Math.ceil((lastReading - firstReading) / (1000 * 60 * 60 * 24));
        
        return {
            totalReadings,
            averageMelanopicLux: Math.round(avgMelanopic),
            averageColorTemp: Math.round(avgColorTemp),
            daysTracked
        };
    }
    
    // Export data
    exportData() {
        const data = this.getAll();
        if (!data) return null;
        
        const exportData = {
            ...data,
            exportedAt: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `circadian-sync-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        return true;
    }
    
    // Import data
    importData(fileContent) {
        try {
            const importedData = JSON.parse(fileContent);
            
            // Validate data structure
            if (!importedData.version || !importedData.userData || !importedData.sensorData) {
                throw new Error('Invalid data format');
            }
            
            // Merge with existing data
            const currentData = this.getAll();
            const mergedData = {
                ...importedData,
                sensorData: [
                    ...currentData.sensorData,
                    ...importedData.sensorData
                ].sort((a, b) => a.timestamp - b.timestamp)
                .slice(-this.maxDataPoints)
            };
            
            return this.save(mergedData);
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
    
    // Cleanup old data
    cleanup() {
        const data = this.getAll();
        if (!data) return;
        
        // Remove data older than 7 days
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        data.sensorData = data.sensorData.filter(reading => reading.timestamp > cutoff);
        
        // Remove old dismissed insights
        const insightCutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
        data.insights = data.insights.filter(insight => 
            !insight.dismissed || insight.dismissedAt > insightCutoff
        );
        
        this.save(data);
    }
    
    // Clear all data
    clearAll() {
        if (confirm('This will delete all your CircadianSync data. Are you sure?')) {
            localStorage.removeItem(this.storageKey);
            this.initStorage();
            return true;
        }
        return false;
    }
}

// Export storage instance
export const storage = new StorageManager();