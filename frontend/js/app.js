// Import all modules
import { lightCalc } from './calculations.js';
import { viz } from './visualizations.js';
import { recommendations } from './recommendations.js';
import { storage } from './storage.js';

// Main application controller
class CircadianSyncApp {
    constructor() {
        this.isRunning = false;
        this.currentData = null;
        this.updateInterval = null;
        this.timerInterval = null;
        this.timerSeconds = 0;
        this.lastUpdateTime = 0;
        this.updateThrottle = 1000; // Update UI max once per second
        
        this.init();
    }      // Initialize application
    async init() {
        console.log('CircadianSync initializing...');
        console.log('DOM readyState:', document.readyState);
        
        // Check browser compatibility
        this.checkBrowserCompatibility();
        
        // Set up UI event listeners
        this.setupEventListeners();        // Initialize visualizations
        console.log('Initializing visualizations...');
        
        try {
            viz.initCircadianClock();
            console.log('Circadian clock initialized');
        } catch (error) {
            console.warn('Circadian clock initialization failed:', error);
        }
        
        try {
            viz.initExposureChart();
            console.log('Exposure chart initialized');
        } catch (error) {
            console.warn('Exposure chart initialization failed:', error);
        }
        
        try {
            viz.initSpectralChart();
            console.log('Spectral chart initialized');
        } catch (error) {
            console.warn('Spectral chart initialization failed:', error);
        }
        
        // Show default/demo data in visualizations
        setTimeout(() => {
            this.showDefaultVisualizationData();
        }, 1000); // Longer delay to ensure DOM is fully ready
          // Set up sensor event handlers
        this.setupSensorHandlers();
        
        // Load historical data
        this.loadHistoricalData();
        
        // Update UI to show ready state
        this.updateConnectionStatus('connected', 'Ready for Analysis');
        
        // Show welcome message
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 1000);
        
        console.log('CircadianSync initialized successfully');
        
        // Start periodic cleanup
        setInterval(() => storage.cleanup(), 3600000); // Every hour
        
        // Request notification permission
        this.requestNotificationPermission();
    }
    
    // Check browser compatibility
    checkBrowserCompatibility() {
        const issues = [];
        
        if (!('usb' in navigator)) {
            issues.push('WebUSB API not supported. Chrome or Edge 89+ required for hardware connection.');
        }
        
        if (!window.localStorage) {
            issues.push('LocalStorage not supported. Data will not persist.');
        }
        
        if (issues.length > 0) {
            console.warn('Compatibility issues:', issues);
            if (!('usb' in navigator)) {
                // Auto-enable demo mode if WebUSB not available
                setTimeout(() => this.startDemoMode(), 1000);
            }
        }
    }    // Set up UI event listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Enter Details button
        const enterDetailsBtn = document.getElementById('enter-details-btn');
        console.log('Enter Details button:', enterDetailsBtn);
        
        if (enterDetailsBtn) {
            console.log('Adding click listener to Enter Details button');
            enterDetailsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Enter Details button clicked!');
                this.showDataEntryPanel();
            });
            console.log('Click listener added successfully');
        } else {
            console.error('Enter Details button not found!');
        }

        // Close panel button
        const closePanelBtn = document.getElementById('close-panel-btn');
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => {
                this.hideDataEntryPanel();
            });
        }

        // Start Analysis button
        const startAnalysisBtn = document.getElementById('start-analysis-btn');
        if (startAnalysisBtn) {
            startAnalysisBtn.addEventListener('click', () => {
                this.startManualAnalysis();
            });
        }

        // Overlay click to close
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.hideDataEntryPanel();
                this.hideAnalysisProgress();
            });
        }        // Form validation on input
        this.setupFormValidation();
    }    // Show the data entry panel
    showDataEntryPanel() {
        console.log('showDataEntryPanel called');
        const panel = document.getElementById('data-entry-panel');
        const overlay = document.getElementById('overlay');
        
        console.log('Panel element:', panel);
        console.log('Overlay element:', overlay);
        
        if (panel && overlay) {
            console.log('Showing panel and overlay');
            // Show overlay first
            overlay.classList.add('active');
            
            // Show panel with slide-down animation
            panel.classList.add('active');
            
            // Focus on the first input
            const firstInput = panel.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 600);
            }
        } else {
            console.error('Panel or overlay not found!');
        }
    }

    // Hide the data entry panel
    hideDataEntryPanel() {
        const panel = document.getElementById('data-entry-panel');
        const overlay = document.getElementById('overlay');
        
        if (panel && overlay) {
            // Hide panel with slide-up animation
            panel.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    // Set up form validation
    setupFormValidation() {
        const inputs = document.querySelectorAll('#data-entry-panel input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    // Validate individual input
    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        
        input.classList.remove('valid', 'invalid');
        
        if (input.value === '') {
            return; // Empty is neutral
        }
        
        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
        } else {
            input.classList.add('valid');
        }
    }

    // Start manual analysis from form data
    async startManualAnalysis() {
        // Get form data
        const formData = this.getFormData();
        
        // Validate form data
        if (!this.validateFormData(formData)) {
            this.showError('Please fill in all required fields with valid values.');
            return;
        }
        
        // Hide the data entry panel
        this.hideDataEntryPanel();
        
        // Show analysis progress
        this.showAnalysisProgress();
          // Process the analysis
        try {
            await this.processManualAnalysisEnhanced(formData);
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError('Analysis failed. Please try again.');
            this.hideAnalysisProgress();
        }
    }    // Get form data
    getFormData() {
        // Helper function to extract numbers from text input
        const extractNumber = (value) => {
            if (!value) return 0;
            const match = value.match(/[\d.]+/);
            return match ? parseFloat(match[0]) : 0;
        };

        const luxValue = extractNumber(document.getElementById('input-lux')?.value);
        const redValue = extractNumber(document.getElementById('input-red')?.value);
        const greenValue = extractNumber(document.getElementById('input-green')?.value);
        const blueValue = extractNumber(document.getElementById('input-blue')?.value);
        const colorTempValue = extractNumber(document.getElementById('input-colorTemp')?.value);
        const clearValue = extractNumber(document.getElementById('input-clear')?.value);
        const timeValue = document.getElementById('input-time')?.value || new Date().toLocaleTimeString();
        const locationValue = document.getElementById('input-location')?.value || 'Unknown Location';

        return {
            lux: luxValue,
            r: redValue,
            g: greenValue,
            b: blueValue,
            clear: clearValue || luxValue, // Use lux as fallback for clear
            colorTemp: colorTempValue || 4000, // Default color temp
            photopic: luxValue, // Use lux as photopic for now
            melanopic: Math.round(luxValue * 0.8), // Estimate melanopic from lux
            time: timeValue,
            location: locationValue,
            timestamp: Date.now()
        };
    }

    // Validate form data
    validateFormData(data) {
        const hasRequiredFields = data.lux > 0 && data.r >= 0 && data.g >= 0 && data.b >= 0;
        const validRanges = data.r <= 255 && data.g <= 255 && data.b <= 255;
        const validColorTemp = !data.colorTemp || (data.colorTemp >= 1000 && data.colorTemp <= 10000);
        
        return hasRequiredFields && validRanges && validColorTemp;
    }

    // Process manual analysis
    async processManualAnalysis(formData) {
        const steps = [
            'Analyzing spectral composition...',
            'Calculating melanopic effects...',
            'Computing circadian impact...',
            'Generating recommendations...',
            'Updating visualizations...'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            this.updateAnalysisProgress(i + 1, steps.length, steps[i]);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Process the sensor data through the normal pipeline
        this.processSensorData(formData);
        
        // Hide progress and show success
        this.hideAnalysisProgress();
        this.showNotification('Analysis complete! Results updated below.', 'success');
    }

    // Show analysis progress
    showAnalysisProgress() {
        const overlay = document.getElementById('overlay');
        const progressContainer = document.getElementById('analysis-progress');
        
        if (overlay && progressContainer) {
            overlay.style.display = 'block';
            progressContainer.style.display = 'flex';
            
            setTimeout(() => {
                overlay.classList.add('active');
                progressContainer.classList.add('active');
            }, 10);
        }
    }

    // Hide analysis progress
    hideAnalysisProgress() {
        const overlay = document.getElementById('overlay');
        const progressContainer = document.getElementById('analysis-progress');
        
        if (overlay && progressContainer) {
            progressContainer.classList.remove('active');
            overlay.classList.remove('active');
            
            setTimeout(() => {
                progressContainer.style.display = 'none';
                overlay.style.display = 'none';
            }, 300);
        }
    }

    // Update analysis progress
    updateAnalysisProgress(current, total, message) {
        const progressBar = document.querySelector('.progress-fill');
        const stepIndicators = document.querySelectorAll('.step-indicator');
        const statusText = document.querySelector('.progress-status');
        
        if (progressBar) {
            const percentage = (current / total) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        
        if (stepIndicators[current - 1]) {
            stepIndicators[current - 1].classList.add('active');
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }
    
    // Process manual analysis with enhanced progress
    async processManualAnalysisEnhanced(formData) {
        const steps = [
            { message: 'Processing light sensor data...', duration: 1000 },
            { message: 'Analyzing spectral composition...', duration: 1200 },
            { message: 'Calculating melanopic effects...', duration: 800 },
            { message: 'Computing circadian phase impact...', duration: 1000 },
            { message: 'Generating personalized recommendations...', duration: 900 },
            { message: 'Creating visualizations...', duration: 700 }
        ];
        
        let totalProgress = 0;
        const progressIncrement = 100 / steps.length;
        
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            this.updateAnalysisProgressRealtime(totalProgress, step.message, i + 1);
            
            // Simulate real-time progress within each step
            const stepStartProgress = totalProgress;
            const stepEndProgress = Math.min(100, totalProgress + progressIncrement);
            
            const startTime = Date.now();
            while (Date.now() - startTime < step.duration) {
                const elapsed = Date.now() - startTime;
                const stepProgress = (elapsed / step.duration) * progressIncrement;
                const currentProgress = Math.min(stepEndProgress, stepStartProgress + stepProgress);
                
                this.updateAnalysisProgressRealtime(currentProgress, step.message, i + 1);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            totalProgress = stepEndProgress;
        }
        
        // Final progress update
        this.updateAnalysisProgressRealtime(100, 'Analysis complete!', steps.length);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Process the sensor data through the normal pipeline
        this.processSensorData(formData);
        
        // Hide progress and show success
        setTimeout(() => {
            this.hideAnalysisProgress();
            this.showNotification('✅ Analysis complete! Your circadian light analysis is ready.', 'success');
        }, 1000);
    }

    // Enhanced real-time progress update
    updateAnalysisProgressRealtime(percentage, message, currentStep) {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const stepIndicators = document.querySelectorAll('.step-indicator');
        const statusText = document.querySelector('.progress-status');
        
        if (progressBar) {
            progressBar.style.width = `${Math.round(percentage)}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
        
        if (currentStep && stepIndicators[currentStep - 1]) {
            stepIndicators[currentStep - 1].classList.add('active');
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }

    // Process sensor data and update UI
    processSensorData(data) {
        try {
            console.log('Processing sensor data:', data);
            
            // Validate and normalize the data
            const normalizedData = {
                r: data.r || 0,
                g: data.g || 0,
                b: data.b || 0,
                lux: data.lux || 0,
                clear: data.clear || data.lux || 0,
                colorTemp: data.colorTemp || 4000,
                timestamp: data.timestamp || Date.now(),
                location: data.location || 'Unknown'
            };            // Calculate metrics using the light calculation module and basic calculations
            const melanopicLux = lightCalc.calculateMelanopicLux(normalizedData.r, normalizedData.g, normalizedData.b, normalizedData.lux);
            const phaseShift = lightCalc.calculatePhaseShift(melanopicLux, new Date().getHours());
            
            const metrics = {
                melanopicLux: melanopicLux,
                circadianPhase: phaseShift.magnitude || 0,
                blueExposure: Math.round((normalizedData.b / (normalizedData.r + normalizedData.g + normalizedData.b + 1)) * 100),
                cognitiveImpact: Math.min(100, Math.round((normalizedData.lux / 500) * 85 + 15)), // 15-100% range
                melatoninSuppression: Math.min(100, Math.round((melanopicLux / 100) * 80)), // Based on melanopic lux
                retinalStress: Math.min(100, Math.round((normalizedData.b * normalizedData.lux) / 5000)) // More realistic calculation
            };            // Update the UI with the calculated metrics
            this.currentData = normalizedData; // Store the current data
            this.updateMetricsDisplay(metrics);
            this.updateVisualizationsDisplay(normalizedData, metrics);
            this.updateRecommendations(normalizedData, metrics);
              // Store the data
            try {
                if (typeof storage !== 'undefined' && storage.saveReading) {
                    storage.saveReading(normalizedData, metrics);
                }
            } catch (storageError) {
                console.warn('Storage failed, but analysis completed:', storageError);
            }
            
            console.log('Data processing completed successfully');
            
        } catch (error) {
            console.error('Error processing sensor data:', error);
            throw error; // Re-throw to be caught by the calling function
        }
    }    // Update metrics display on the dashboard
    updateMetricsDisplay(metrics) {
        try {
            // Update melanopic lux
            const melanopicElement = document.getElementById('melanopic-value');
            if (melanopicElement) {
                melanopicElement.textContent = Math.round(metrics.melanopicLux);
            }
            
            // Update circadian phase
            const phaseElement = document.getElementById('phase-shift');
            if (phaseElement) {
                phaseElement.textContent = `${metrics.circadianPhase.toFixed(1)}`;
            }
            
            // Update blue light exposure
            const blueElement = document.getElementById('blue-light');
            if (blueElement) {
                blueElement.textContent = `${Math.round(metrics.blueExposure)}`;
            }
            
            // Update blue light progress bar
            const blueBar = document.getElementById('blue-light-bar');
            if (blueBar) {
                blueBar.style.width = `${Math.round(metrics.blueExposure)}%`;
            }
            
            // Update cognitive performance
            const cognitiveElement = document.getElementById('cognitive-performance');
            if (cognitiveElement) {
                cognitiveElement.textContent = Math.round(metrics.cognitiveImpact);
            }
            const cognitiveBar = document.getElementById('cognitive-bar');
            if (cognitiveBar) {
                cognitiveBar.style.width = `${Math.round(metrics.cognitiveImpact)}%`;
            }
            
            // Update melatonin suppression
            const melatoninElement = document.getElementById('melatonin-suppression');
            if (melatoninElement) {
                melatoninElement.textContent = Math.round(metrics.melatoninSuppression);
            }
            const melatoninBar = document.getElementById('melatonin-bar');
            if (melatoninBar) {
                melatoninBar.style.width = `${Math.round(metrics.melatoninSuppression)}%`;
            }
            
            // Update retinal stress score
            const retinalElement = document.getElementById('retinal-stress');
            if (retinalElement) {
                retinalElement.textContent = Math.round(metrics.retinalStress);
            }
            const stressBar = document.getElementById('stress-bar');
            if (stressBar) {
                stressBar.style.width = `${Math.round(metrics.retinalStress)}%`;
            }
            
            // Update pupil diameter (estimate based on light levels)
            const pupilElement = document.getElementById('pupil-diameter');
            if (pupilElement) {
                const estimatedPupilDiameter = this.estimatePupilDiameter(this.currentData?.lux || 0);
                pupilElement.textContent = estimatedPupilDiameter.toFixed(1);
            }
            
            // Update color temperature (using the processed data)
            const colorTempElement = document.getElementById('color-temp');
            if (colorTempElement) {
                const colorTemp = this.currentData?.colorTemp || 4000;
                colorTempElement.textContent = Math.round(colorTemp);
            }
            
            console.log('All metrics display updated successfully');
            
        } catch (error) {
            console.error('Error updating metrics display:', error);
        }
    }

    // Estimate pupil diameter based on light levels
    estimatePupilDiameter(lux) {
        // Based on research: pupil diameter inversely related to light intensity
        // Dark: 6-8mm, Bright daylight: 2-3mm
        if (lux <= 1) return 7.5;
        if (lux <= 10) return 6.5;
        if (lux <= 100) return 5.0;
        if (lux <= 500) return 4.0;
        if (lux <= 1000) return 3.5;
        return 2.5;    }    // Update visualizations with new data
    updateVisualizationsDisplay(data, metrics) {
        try {
            console.log('Updating visualizations with data:', { data, metrics });
            
            // Update spectral analysis chart with robust fallback
            this.updateSpectralChartRobust(data.r || 0, data.g || 0, data.b || 0);
            
            // Update circadian clock with robust fallback
            this.updateCircadianClockRobust(metrics.melanopicLux || 0, metrics.circadianPhase || 0);
            
            // Update exposure chart
            if (typeof viz !== 'undefined' && viz.updateExposureChart) {
                const exposureData = {
                    timestamp: data.timestamp || new Date(),
                    melanopicLux: metrics.melanopicLux || 0,
                    lux: data.lux || 0
                };
                viz.updateExposureChart(exposureData);
            }
            
            console.log('Visualizations updated successfully');
            
        } catch (error) {
            console.warn('Visualization update failed, but analysis completed:', error);
        }
    }// Fallback spectral chart update
    updateSpectralChartFallback(r, g, b) {
        try {
            // Find spectral analysis elements
            const spectralContainer = document.getElementById('spectral-display');
            if (!spectralContainer) {
                console.warn('Spectral display container not found');
                return;
            }
            
            // Create fallback bars if they don't exist
            if (!spectralContainer.querySelector('.fallback-spectral')) {
                const total = r + g + b;
                const redPercent = total > 0 ? (r / total) * 100 : 33.33;
                const greenPercent = total > 0 ? (g / total) * 100 : 33.33;
                const bluePercent = total > 0 ? (b / total) * 100 : 33.33;
                
                spectralContainer.innerHTML = `
                    <div class="fallback-spectral">
                        <div class="spectral-bar-container">
                            <div class="spectral-bar red" style="height: ${redPercent}%; background-color: #ef4444;"></div>
                            <span class="bar-label">Red ${Math.round(redPercent)}%</span>
                        </div>
                        <div class="spectral-bar-container">
                            <div class="spectral-bar green" style="height: ${greenPercent}%; background-color: #22c55e;"></div>
                            <span class="bar-label">Green ${Math.round(greenPercent)}%</span>
                        </div>
                        <div class="spectral-bar-container">
                            <div class="spectral-bar blue" style="height: ${bluePercent}%; background-color: #3b82f6;"></div>
                            <span class="bar-label">Blue ${Math.round(bluePercent)}%</span>
                        </div>
                    </div>
                `;
            } else {
                // Update existing bars
                const total = r + g + b;
                if (total > 0) {
                    const redPercent = (r / total) * 100;
                    const greenPercent = (g / total) * 100;
                    const bluePercent = (b / total) * 100;
                    
                    const redBar = spectralContainer.querySelector('.spectral-bar.red');
                    const greenBar = spectralContainer.querySelector('.spectral-bar.green');
                    const blueBar = spectralContainer.querySelector('.spectral-bar.blue');
                    
                    if (redBar) redBar.style.height = `${redPercent}%`;
                    if (greenBar) greenBar.style.height = `${greenPercent}%`;
                    if (blueBar) blueBar.style.height = `${bluePercent}%`;
                    
                    // Update labels
                    const labels = spectralContainer.querySelectorAll('.bar-label');
                    if (labels[0]) labels[0].textContent = `Red ${Math.round(redPercent)}%`;
                    if (labels[1]) labels[1].textContent = `Green ${Math.round(greenPercent)}%`;
                    if (labels[2]) labels[2].textContent = `Blue ${Math.round(bluePercent)}%`;
                }
            }
            
            console.log('Spectral chart fallback updated:', { r, g, b });
            
        } catch (error) {
            console.warn('Spectral chart fallback failed:', error);
        }
    }    // Update spectral chart with enhanced fallback
    updateSpectralChartRobust(r, g, b) {
        console.log('Updating spectral chart with RGB:', r, g, b);
        
        // Always ensure fallback is available first
        this.updateSpectralChartFallback(r, g, b);
        
        // Try D3 version as enhancement
        try {
            const spectralData = {
                redPower: r || 0,
                greenPower: g || 0,
                bluePower: b || 0
            };
            
            if (typeof viz !== 'undefined' && viz.updateSpectralChart) {
                viz.updateSpectralChart(spectralData);
                console.log('✓ D3 spectral chart updated');
            }
        } catch (error) {
            console.warn('D3 spectral chart update failed, fallback is active:', error);
        }
    }
      // Update circadian clock with enhanced fallback
    updateCircadianClockRobust(melanopicLux, phaseShift) {
        console.log('Updating circadian clock with melanopic:', melanopicLux, 'phase:', phaseShift);
        
        // Always try fallback first since it's more reliable
        this.updateCircadianClockFallback(melanopicLux, phaseShift);
        
        // Try D3 version as enhancement
        try {
            const currentTime = new Date();
            const biologicalTime = new Date();
            
            if (typeof viz !== 'undefined' && viz.updateCircadianClock) {
                viz.updateCircadianClock(currentTime, biologicalTime, melanopicLux, phaseShift);
                console.log('✓ D3 circadian clock updated');
            }
        } catch (error) {
            console.warn('D3 circadian clock update failed, fallback is active:', error);
        }
    }
    
    // Fallback circadian clock update
    updateCircadianClockFallback(melanopicLux = 0, phaseShift = 0) {
        try {
            // Update the fallback clock if it exists
            const clockContainer = document.getElementById('circadian-clock');
            if (clockContainer) {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const currentTimeDecimal = hours + minutes / 60;
                
                // Calculate biological time
                const bioTimeDecimal = (currentTimeDecimal + phaseShift + 24) % 24;
                const bioHours = Math.floor(bioTimeDecimal);
                const bioMinutes = Math.floor((bioTimeDecimal % 1) * 60);
                
                // Create or update fallback display
                if (!clockContainer.querySelector('.fallback-clock')) {
                    // Create fallback clock if doesn't exist
                    if (typeof viz !== 'undefined' && viz.createFallbackClock) {
                        viz.createFallbackClock();
                    }
                }
                
                // Update fallback time displays
                const currentTimeEl = document.getElementById('fallback-current-time');
                if (currentTimeEl) {
                    currentTimeEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                }
                
                const bioTimeEl = document.getElementById('fallback-bio-time');
                if (bioTimeEl) {
                    bioTimeEl.textContent = `${bioHours.toString().padStart(2, '0')}:${bioMinutes.toString().padStart(2, '0')}`;
                }
                
                const phaseEl = document.getElementById('fallback-phase-shift');
                if (phaseEl) {
                    phaseEl.textContent = `${phaseShift >= 0 ? '+' : ''}${phaseShift.toFixed(1)}h`;
                    phaseEl.style.color = Math.abs(phaseShift) < 0.5 ? '#4ade80' : phaseShift > 0 ? '#fbbf24' : '#f97316';
                }
                
                const melanopicEl = document.getElementById('fallback-melanopic');
                if (melanopicEl) {
                    melanopicEl.textContent = `${Math.round(melanopicLux)} mel-lux`;
                    const color = this.getMelanopicColorFallback(melanopicLux, currentTimeDecimal);
                    melanopicEl.style.color = color;
                }
            }
        } catch (error) {
            console.warn('Circadian clock fallback update failed:', error);
        }
    }
    
    // Get melanopic color for fallback
    getMelanopicColorFallback(melanopicLux, timeOfDay) {
        if (timeOfDay >= 6 && timeOfDay < 22) {
            // Daytime - higher is better
            if (melanopicLux >= 200) return '#4ade80'; // Green - optimal
            if (melanopicLux >= 100) return '#fbbf24'; // Yellow - adequate
            return '#f97316'; // Orange - low
        } else {
            // Nighttime - lower is better
            if (melanopicLux <= 10) return '#4ade80'; // Green - optimal
            if (melanopicLux <= 50) return '#fbbf24'; // Yellow - caution
            return '#ef4444'; // Red - too bright
        }
    }

    // Show notification message
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    // Load historical data
    loadHistoricalData() {
        const todayData = storage.getTodayReadings();
        
        if (todayData.length > 0) {
            // Update visualizations with historical data
            todayData.forEach(reading => {
                viz.updateExposureChart(reading);
            });
            
            // Show daily statistics
            const stats = this.calculateDailyStats(todayData);
            this.showDailyStats(stats);
        }
    }
    
    // Calculate daily statistics
    calculateDailyStats(data) {
        if (data.length === 0) return null;
        
        const melanopicValues = data.map(d => d.melanopicLux || 0);
        const lightScore = lightCalc.calculateDailyLightScore(data);
        
        return {
            avgMelanopic: Math.round(melanopicValues.reduce((a, b) => a + b) / melanopicValues.length),
            maxMelanopic: Math.max(...melanopicValues),
            minMelanopic: Math.min(...melanopicValues),
            lightScore: lightScore,
            readingCount: data.length
        };
    }
    
    // Show daily statistics
    showDailyStats(stats) {
        if (!stats) return;
        
        // Could add a stats card to the UI
        console.log('Daily stats:', stats);
    }
    
    // Request notification permission
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                }
            });
        }
    }
    
    // Update recommendations based on analysis
    updateRecommendations(data, metrics) {
        try {
            if (typeof recommendations !== 'undefined' && recommendations.generateRecommendations) {
                const recs = recommendations.generateRecommendations(data, metrics);
                this.displayRecommendations(recs);
            } else {
                // Fallback: Generate basic recommendations
                this.generateBasicRecommendations(data, metrics);
            }
        } catch (error) {
            console.warn('Recommendations update failed:', error);
        }
    }

    // Generate basic recommendations as fallback
    generateBasicRecommendations(data, metrics) {
        const hour = new Date().getHours();
        const recommendations = [];

        // Morning recommendations (6-10 AM)
        if (hour >= 6 && hour < 10) {
            if (data.lux < 250) {
                recommendations.push({
                    title: "Increase Morning Light",
                    message: "Your morning light exposure is low. Consider getting bright light (>250 lux) to help align your circadian rhythm.",
                    priority: "high"
                });
            }
        }
        // Evening recommendations (7-10 PM)
        else if (hour >= 19 && hour < 22) {
            if (metrics.melatoninSuppression > 50) {
                recommendations.push({
                    title: "Reduce Evening Light",
                    message: "High light levels may suppress melatonin production. Consider dimming lights or using warm lighting.",
                    priority: "medium"
                });
            }
        }

        // Blue light warnings
        if (metrics.blueExposure > 60) {
            recommendations.push({
                title: "Blue Light Alert",
                message: "High blue light exposure detected. Consider blue light filters or reducing screen time.",
                priority: "medium"
            });
        }

        // Retinal stress warnings
        if (metrics.retinalStress > 70) {
            recommendations.push({
                title: "Retinal Stress Warning",
                message: "High retinal stress levels. Take breaks from bright lights and consider protective eyewear.",
                priority: "high"
            });
        }

        this.displayBasicRecommendations(recommendations);
    }

    // Display basic recommendations
    displayBasicRecommendations(recs) {
        const container = document.querySelector('.recommendations-container') || 
                         document.querySelector('#recommendations') ||
                         document.querySelector('.personalized-recommendations');
        
        if (container && recs.length > 0) {
            container.innerHTML = recs.map(rec => `
                <div class="recommendation-card ${rec.priority}">
                    <h4>${rec.title}</h4>
                    <p>${rec.message}</p>
                </div>
            `).join('');
        }
    }

    // Display full recommendations
    displayRecommendations(recs) {
        // Implementation for full recommendations display
        console.log('Recommendations generated:', recs);
    }    // Show default/demo data in visualizations
    showDefaultVisualizationData() {
        try {
            console.log('Displaying default visualization data...');
            
            // Force create fallback displays first
            this.createFallbackDisplays();
            
            // Show default circadian clock with current time
            const defaultPhaseShift = 0; // Neutral phase
            const defaultMelanopicLux = 100; // Moderate indoor lighting
            
            this.updateCircadianClockRobust(defaultMelanopicLux, defaultPhaseShift);
            
            // Show balanced spectral data as default
            this.updateSpectralChartRobust(33, 33, 34);
            
            console.log('Default visualization data displayed');
            
        } catch (error) {
            console.warn('Failed to show default visualization data:', error);
        }
    }

    // Create fallback displays for all visualizations
    createFallbackDisplays() {
        try {
            // Create fallback circadian clock
            const circadianClock = document.getElementById('circadian-clock');
            if (circadianClock && (!circadianClock.innerHTML || circadianClock.innerHTML.trim() === '')) {
                const now = new Date();
                const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                circadianClock.innerHTML = `
                    <div class="fallback-clock">
                        <div class="clock-face">
                            <div class="time-display">
                                <div class="current-time">
                                    <span class="time-label">Current Time</span>
                                    <span class="time-value" id="fallback-current-time">${timeString}</span>
                                </div>
                                <div class="bio-time">
                                    <span class="time-label">Biological Time</span>
                                    <span class="time-value" id="fallback-bio-time">${timeString}</span>
                                </div>
                                <div class="phase-info">
                                    <span class="phase-label">Phase Shift</span>
                                    <span class="phase-value" id="fallback-phase-shift">0.0h</span>
                                </div>
                                <div class="melanopic-info">
                                    <span class="melanopic-value" id="fallback-melanopic">100 mel-lux</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                console.log('✓ Fallback circadian clock created');
            }
            
            // Create fallback spectral chart
            const spectralDisplay = document.getElementById('spectral-display');
            if (spectralDisplay && (!spectralDisplay.innerHTML || spectralDisplay.innerHTML.trim() === '')) {
                spectralDisplay.innerHTML = `
                    <div class="fallback-spectral">
                        <div class="spectral-bar-container">
                            <div class="spectral-bar red" style="height: 33%;"></div>
                            <span class="bar-label">Red 33%</span>
                        </div>
                        <div class="spectral-bar-container">
                            <div class="spectral-bar green" style="height: 33%;"></div>
                            <span class="bar-label">Green 33%</span>
                        </div>
                        <div class="spectral-bar-container">
                            <div class="spectral-bar blue" style="height: 34%;"></div>
                            <span class="bar-label">Blue 34%</span>
                        </div>
                    </div>
                `;
                console.log('✓ Fallback spectral chart created');
            }
            
        } catch (error) {
            console.warn('Failed to create fallback displays:', error);
        }
    }
}

// Test button functionality immediately when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, testing button...');
    const btn = document.getElementById('enter-details-btn');
    console.log('Button found:', btn);
    
    if (btn) {
        btn.addEventListener('click', () => {
            console.log('DIRECT CLICK HANDLER: Button was clicked!');
            alert('Button click detected!');
        });
    }
});

// Initialize app when DOM is ready
// Initialize the application
const app = new CircadianSyncApp();

// Make app globally available for testing
window.app = app;

// Export the app for testing or external control
export { app };

// Global test functions for visualization debugging
window.testVisualizations = function() {
    console.log('Testing visualizations...');
    
    // Test spectral chart
    console.log('Testing spectral chart...');
    if (window.app && window.app.updateSpectralChartRobust) {
        window.app.updateSpectralChartRobust(80, 60, 40); // Warm light
        console.log('Spectral chart updated with warm light');
    }
    
    // Test circadian clock
    console.log('Testing circadian clock...');
    if (window.app && window.app.updateCircadianClockRobust) {
        window.app.updateCircadianClockRobust(150, -0.5); // Moderate light, slight phase delay
        console.log('Circadian clock updated');
    }
    
    console.log('Visualization test completed');
};

window.testSpectralOnly = function() {
    console.log('Testing spectral chart only...');
    if (window.app && window.app.updateSpectralChartRobust) {
        window.app.updateSpectralChartRobust(60, 80, 40); // Green-dominant
        console.log('Spectral chart updated with green-dominant light');
    }
};

window.testCircadianOnly = function() {
    console.log('Testing circadian clock only...');
    if (window.app && window.app.updateCircadianClockRobust) {
        window.app.updateCircadianClockRobust(250, 1.2); // Bright light, phase advance
        console.log('Circadian clock updated with bright light');
    }
};

window.debugVisualizationElements = function() {
    console.log('=== Visualization Elements Debug ===');
    
    const circadianClock = document.getElementById('circadian-clock');
    console.log('Circadian Clock Element:', circadianClock);
    if (circadianClock) {
        console.log('Circadian Clock HTML:', circadianClock.innerHTML);
    }
    
    const spectralDisplay = document.getElementById('spectral-display');
    console.log('Spectral Display Element:', spectralDisplay);
    if (spectralDisplay) {
        console.log('Spectral Display HTML:', spectralDisplay.innerHTML);
    }
    
    const exposureChart = document.getElementById('exposure-chart');
    console.log('Exposure Chart Element:', exposureChart);
    if (exposureChart) {
        console.log('Exposure Chart HTML:', exposureChart.innerHTML);
    }
    
    console.log('D3 Available:', typeof d3 !== 'undefined');
    console.log('Viz Object:', typeof viz);
    
    console.log('=== End Debug ===');
};

window.simpleVisualizationTest = function() {
    console.log('=== Simple Visualization Test ===');
    
    // Test 1: Force spectral display with proper alignment
    const spectralDisplay = document.getElementById('spectral-display');
    if (spectralDisplay) {
        spectralDisplay.innerHTML = `
            <div class="fallback-spectral">
                <div class="spectral-bar-container">
                    <div class="spectral-bar red" style="height: 60px;"></div>
                    <span class="bar-label">Red 45%</span>
                </div>
                <div class="spectral-bar-container">
                    <div class="spectral-bar green" style="height: 40px;"></div>
                    <span class="bar-label">Green 33%</span>
                </div>
                <div class="spectral-bar-container">
                    <div class="spectral-bar blue" style="height: 30px;"></div>
                    <span class="bar-label">Blue 22%</span>
                </div>
            </div>
        `;
        console.log('✓ Spectral display updated with aligned bars');
    } else {
        console.log('✗ Spectral display element not found');
    }
    
    // Test 2: Force circadian clock display
    const circadianClock = document.getElementById('circadian-clock');
    if (circadianClock) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        circadianClock.innerHTML = `
            <div class="fallback-clock">
                <div class="clock-face">
                    <div class="time-display">
                        <div class="current-time">
                            <span class="time-label">Current Time</span>
                            <span class="time-value">${timeString}</span>
                        </div>
                        <div class="bio-time">
                            <span class="time-label">Biological Time</span>
                            <span class="time-value">${timeString}</span>
                        </div>
                        <div class="phase-info">
                            <span class="phase-label">Phase Shift</span>
                            <span class="phase-value">0.0h</span>
                        </div>
                        <div class="melanopic-info">
                            <span class="melanopic-value">100 mel-lux</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        console.log('✓ Circadian clock updated with fallback display');
    } else {
        console.log('✗ Circadian clock element not found');
    }
    
    console.log('=== Simple Test Completed ===');
};
