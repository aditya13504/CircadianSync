// D3.js visualizations for CircadianSync
class Visualizations {
    constructor() {
        this.clockRadius = 150;
        this.historyData = [];
        this.maxHistoryPoints = 288; // 24 hours at 5-min intervals
        this.d3Available = typeof d3 !== 'undefined';
        
        if (!this.d3Available) {
            console.warn('D3.js not available, visualizations will be simplified');
        }
    }
    
    // Check if D3 is available and element exists
    isVisualizationReady(elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element ${elementId} not found`);
            return false;
        }
        if (!this.d3Available) {
            console.warn('D3.js not available for visualization');
            return false;
        }
        return true;
    }
    
    // Initialize circadian clock
    initCircadianClock() {
        if (!this.isVisualizationReady('circadian-clock')) {
            // Fallback: create simple clock without D3
            this.createFallbackClock();
            return;
        }
        
        const width = this.clockRadius * 2 + 40;
        const height = this.clockRadius * 2 + 40;
        
        // Clear existing
        d3.select('#circadian-clock').selectAll('*').remove();
        
        const svg = d3.select('#circadian-clock')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);
        
        // Create scales
        const hourScale = d3.scaleLinear()
            .domain([0, 24])
            .range([0, 2 * Math.PI]);
        
        // Background circles
        const radii = [40, 80, 120, this.clockRadius];
        radii.forEach(r => {
            g.append('circle')
                .attr('r', r)
                .attr('fill', 'none')
                .attr('stroke', '#333')
                .attr('stroke-width', 1)
                .attr('opacity', 0.3);
        });
        
        // Hour markers
        const hours = d3.range(0, 24);
        g.selectAll('.hour-marker')
            .data(hours)
            .enter()
            .append('g')
            .attr('class', 'hour-marker')
            .attr('transform', d => {
                const angle = hourScale(d) - Math.PI / 2;
                return `rotate(${angle * 180 / Math.PI})`;
            })
            .each(function(d) {
                const group = d3.select(this);
                
                // Hour line
                group.append('line')
                    .attr('x1', d % 6 === 0 ? 140 : 145)
                    .attr('x2', 150)
                    .attr('stroke', '#666')
                    .attr('stroke-width', d % 6 === 0 ? 2 : 1);
                
                // Hour text
                if (d % 6 === 0) {
                    group.append('text')
                        .attr('x', 165)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('transform', `rotate(${-angle * 180 / Math.PI})`)
                        .style('font-size', '14px')
                        .style('fill', '#999')
                        .text(d === 0 ? '12' : d > 12 ? d - 12 : d);
                }
            });
        
        // Optimal light zones
        const zones = [
            { name: 'morning', start: 6, end: 10, color: '#4ade80', opacity: 0.3 },
            { name: 'day', start: 10, end: 17, color: '#fbbf24', opacity: 0.2 },
            { name: 'evening', start: 17, end: 22, color: '#f97316', opacity: 0.3 },
            { name: 'night', start: 22, end: 30, color: '#1e40af', opacity: 0.4 },
            { name: 'night2', start: -6, end: 6, color: '#1e40af', opacity: 0.4 }
        ];
        
        zones.forEach(zone => {
            const startAngle = hourScale(zone.start) - Math.PI / 2;
            const endAngle = hourScale(zone.end) - Math.PI / 2;
            
            const arc = d3.arc()
                .innerRadius(40)
                .outerRadius(120)
                .startAngle(startAngle)
                .endAngle(endAngle);
            
            g.append('path')
                .attr('d', arc)
                .attr('fill', zone.color)
                .attr('opacity', zone.opacity)
                .attr('class', `zone-${zone.name}`);
        });
        
        // Zone labels
        g.append('text')
            .attr('x', 0).attr('y', -100)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#4ade80')
            .text('MORNING BOOST');
            
        g.append('text')
            .attr('x', 100).attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#fbbf24')
            .text('MAINTAIN');
            
        g.append('text')
            .attr('x', 0).attr('y', 100)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#f97316')
            .text('WIND DOWN');
            
        g.append('text')
            .attr('x', -100).attr('y', 0)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#1e40af')
            .text('SLEEP');
        
        // Current time hand
        g.append('line')
            .attr('class', 'current-time-hand')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', -130)
            .attr('stroke', '#4a9eff')
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round');
        
        // Biological time hand
        g.append('line')
            .attr('class', 'bio-time-hand')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', -110)
            .attr('stroke', '#ff8c42')
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', '5,5');
        
        // Center circle
        g.append('circle')
            .attr('r', 8)
            .attr('fill', '#333')
            .attr('stroke', '#666')
            .attr('stroke-width', 2);
        
        // Time display in center
        g.append('text')
            .attr('class', 'current-time-text')
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('fill', '#4a9eff')
            .text('--:--');
            
        g.append('text')
            .attr('class', 'bio-time-text')
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', '#ff8c42')
            .text('Bio: --:--');
        
        g.append('text')
            .attr('class', 'phase-diff-text')
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#a0a0a0')
            .text('Phase: --');
        
        // Current melanopic lux indicator
        g.append('text')
            .attr('class', 'melanopic-indicator')
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#50fa7b')
            .text('-- mel-lux');
    }
    
    // Update circadian clock with current time and biological time
    updateCircadianClock(currentTime, biologicalTime, melanopicLux = 0, phaseShift = 0) {
        if (!this.isVisualizationReady('circadian-clock')) {
            this.updateFallbackClock(currentTime, biologicalTime, melanopicLux, phaseShift);
            return;
        }
        
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTimeDecimal = hours + minutes / 60;
        
        // Calculate biological time
        const bioTimeDecimal = (currentTimeDecimal + phaseShift + 24) % 24;
        const bioHours = Math.floor(bioTimeDecimal);
        const bioMinutes = Math.floor((bioTimeDecimal % 1) * 60);
        
        // Update hand positions
        const hourScale = d3.scaleLinear()
            .domain([0, 24])
            .range([0, 2 * Math.PI]);
        
        const currentAngle = hourScale(currentTimeDecimal) - Math.PI / 2;
        const bioAngle = hourScale(bioTimeDecimal) - Math.PI / 2;
        
        const svg = d3.select('#circadian-clock svg g');
        
        // Update current time hand
        svg.select('.current-time-hand')
            .attr('transform', `rotate(${currentAngle * 180 / Math.PI})`);
        
        // Update biological time hand
        svg.select('.bio-time-hand')
            .attr('transform', `rotate(${bioAngle * 180 / Math.PI})`);
        
        // Update time displays
        svg.select('.current-time-text')
            .text(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        
        svg.select('.bio-time-text')
            .text(`Bio: ${bioHours.toString().padStart(2, '0')}:${bioMinutes.toString().padStart(2, '0')}`);
        
        svg.select('.phase-diff-text')
            .text(`Phase: ${phaseShift >= 0 ? '+' : ''}${phaseShift.toFixed(1)}h`)
            .style('fill', Math.abs(phaseShift) < 0.5 ? '#4ade80' : phaseShift > 0 ? '#fbbf24' : '#f97316');
        
        svg.select('.melanopic-indicator')
            .text(`${Math.round(melanopicLux)} mel-lux`)
            .style('fill', this.getMelanopicColor(melanopicLux, currentTimeDecimal));
    }
    
    // Get color based on melanopic lux and time of day
    getMelanopicColor(melanopicLux, timeOfDay) {
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
    
    // Fallback clock for when D3 is not available
    createFallbackClock() {
        const container = document.getElementById('circadian-clock');
        if (!container) return;
        
        container.innerHTML = `
            <div class="fallback-clock">
                <div class="clock-face">
                    <div class="time-display">
                        <div class="current-time">
                            <span class="time-label">Current</span>
                            <span class="time-value" id="fallback-current-time">--:--</span>
                        </div>
                        <div class="bio-time">
                            <span class="time-label">Biological</span>
                            <span class="time-value" id="fallback-bio-time">--:--</span>
                        </div>
                        <div class="phase-info">
                            <span class="phase-label">Phase Shift</span>
                            <span class="phase-value" id="fallback-phase-shift">--</span>
                        </div>
                        <div class="melanopic-info">
                            <span class="melanopic-value" id="fallback-melanopic">-- mel-lux</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update fallback clock
    updateFallbackClock(currentTime, biologicalTime, melanopicLux = 0, phaseShift = 0) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTimeDecimal = hours + minutes / 60;
        
        // Calculate biological time
        const bioTimeDecimal = (currentTimeDecimal + phaseShift + 24) % 24;
        const bioHours = Math.floor(bioTimeDecimal);
        const bioMinutes = Math.floor((bioTimeDecimal % 1) * 60);
        
        // Update displays
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
            melanopicEl.style.color = this.getMelanopicColor(melanopicLux, currentTimeDecimal);
        }
    }
    
    // Initialize exposure chart
    initExposureChart() {
        if (!this.isVisualizationReady('exposure-chart')) {
            this.createFallbackChart();
            return;
        }
        
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.bottom - margin.top;
        
        // Clear existing
        d3.select('#exposure-chart').selectAll('*').remove();
        
        const svg = d3.select('#exposure-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Create scales
        const xScale = d3.scaleTime()
            .domain([new Date() - 24 * 60 * 60 * 1000, new Date()])
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([height, 0]);
        
        // Add axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M')));
        
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));
        
        // Add axis labels
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#999')
            .text('Melanopic Lux');
        
        // Add optimal zones
        this.drawChartZones(g, xScale, yScale, width, height);
    }
    
    // Draw optimal light zones on chart
    drawChartZones(g, xScale, yScale, width, height) {
        const zones = [
            { start: 6, end: 10, level: 250, color: '#4ade80', label: 'Morning Boost' },
            { start: 10, end: 17, level: 200, color: '#fbbf24', label: 'Maintain' },
            { start: 17, end: 22, level: 50, color: '#f97316', label: 'Wind Down' },
            { start: 22, end: 6, level: 10, color: '#1e40af', label: 'Sleep' }
        ];
        
        const now = new Date();
        zones.forEach(zone => {
            const startTime = new Date(now);
            startTime.setHours(zone.start, 0, 0, 0);
            const endTime = new Date(now);
            endTime.setHours(zone.end, 0, 0, 0);
            
            if (zone.end < zone.start) {
                endTime.setDate(endTime.getDate() + 1);
            }
            
            g.append('rect')
                .attr('x', xScale(startTime))
                .attr('y', yScale(zone.level))
                .attr('width', xScale(endTime) - xScale(startTime))
                .attr('height', height - yScale(zone.level))
                .attr('fill', zone.color)
                .attr('opacity', 0.2);
        });
    }
    
    // Fallback chart
    createFallbackChart() {
        const container = document.getElementById('exposure-chart');
        if (!container) return;
        
        container.innerHTML = `
            <div class="fallback-chart">
                <div class="chart-title">Today's Light Exposure</div>
                <div class="chart-placeholder">
                    <div class="chart-bar morning">
                        <span class="bar-label">Morning</span>
                        <div class="bar-fill" style="height: 60%"></div>
                        <span class="bar-value">150 lux</span>
                    </div>
                    <div class="chart-bar day">
                        <span class="bar-label">Day</span>
                        <div class="bar-fill" style="height: 80%"></div>
                        <span class="bar-value">200 lux</span>
                    </div>
                    <div class="chart-bar evening">
                        <span class="bar-label">Evening</span>
                        <div class="bar-fill" style="height: 20%"></div>
                        <span class="bar-value">40 lux</span>
                    </div>
                    <div class="chart-bar night">
                        <span class="bar-label">Night</span>
                        <div class="bar-fill" style="height: 5%"></div>
                        <span class="bar-value">5 lux</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update fallback chart
    updateFallbackChart(data) {
        // Simple update for fallback chart
        console.log('Updating fallback chart with data:', data);
    }
    
    // Update exposure chart
    updateExposureChart(data) {
        if (!this.isVisualizationReady('exposure-chart')) {
            this.updateFallbackChart(data);
            return;
        }
        
        // Add data point
        this.historyData.push({
            timestamp: new Date(data.timestamp),
            melanopicLux: data.melanopicLux || 0,
            photopicLux: data.lux || 0
        });
        
        // Keep only recent data
        if (this.historyData.length > this.maxHistoryPoints) {
            this.historyData = this.historyData.slice(-this.maxHistoryPoints);
        }
        
        const svg = d3.select('#exposure-chart svg g');
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.bottom - margin.top;
        
        // Update scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(this.historyData, d => d.timestamp))
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.historyData, d => d.melanopicLux) || 1000])
            .range([height, 0]);
        
        // Update axes
        svg.select('.x-axis')
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M')));
        
        svg.select('.y-axis')
            .call(d3.axisLeft(yScale));
        
        // Create line generator
        const line = d3.line()
            .x(d => xScale(d.timestamp))
            .y(d => yScale(d.melanopicLux))
            .curve(d3.curveMonotoneX);
        
        // Remove existing line
        svg.selectAll('.exposure-line').remove();
        
        // Add line
        svg.append('path')
            .datum(this.historyData)
            .attr('class', 'exposure-line')
            .attr('fill', 'none')
            .attr('stroke', '#4a9eff')
            .attr('stroke-width', 2)
            .attr('d', line);
        
        // Add dots for recent points
        svg.selectAll('.data-point').remove();
        
        svg.selectAll('.data-point')
            .data(this.historyData.slice(-10))
            .enter().append('circle')
            .attr('class', 'data-point')
            .attr('cx', d => xScale(d.timestamp))
            .attr('cy', d => yScale(d.melanopicLux))
            .attr('r', 3)
            .attr('fill', '#4a9eff');
    }
      // Initialize spectral chart
    initSpectralChart() {
        if (!this.isVisualizationReady('spectral-display')) {
            this.createFallbackSpectralChart();
            return;
        }
        
        const width = 300;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        
        // Clear existing
        d3.select('#spectral-display').selectAll('svg').remove();
        
        const svg = d3.select('#spectral-display')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Create scales
        const xScale = d3.scaleBand()
            .domain(['Red', 'Green', 'Blue'])
            .range([0, width - margin.left - margin.right])
            .padding(0.2);
        
        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height - margin.top - margin.bottom, 0]);
        
        // Add axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(xScale));
        
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));
        
        // Add bars
        g.selectAll('.spectral-bar')
            .data(['Red', 'Green', 'Blue'])
            .enter()
            .append('rect')
            .attr('class', 'spectral-bar')
            .attr('x', d => xScale(d))
            .attr('width', xScale.bandwidth())
            .attr('y', height - margin.top - margin.bottom)
            .attr('height', 0)
            .attr('fill', d => d === 'Red' ? '#ef4444' : d === 'Green' ? '#22c55e' : '#3b82f6');
    }
      // Update spectral chart
    updateSpectralChart(spectralData) {
        const svg = d3.select('#spectral-display svg');
        if (svg.empty()) {
            this.initSpectralChart();
            // Try again after initialization
            setTimeout(() => this.updateSpectralChart(spectralData), 100);
            return;
        }
        
        // Normalize RGB values to percentages
        const redPower = spectralData.redPower || 0;
        const greenPower = spectralData.greenPower || 0;
        const bluePower = spectralData.bluePower || 0;
        const total = redPower + greenPower + bluePower;
        
        const data = [
            { 
                channel: 'Red', 
                value: total > 0 ? (redPower / total) * 100 : 0,
                rawValue: redPower
            },
            { 
                channel: 'Green', 
                value: total > 0 ? (greenPower / total) * 100 : 0,
                rawValue: greenPower
            },
            { 
                channel: 'Blue', 
                value: total > 0 ? (bluePower / total) * 100 : 0,
                rawValue: bluePower
            }
        ];
        
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const chartHeight = height - margin.top - margin.bottom;
        
        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);
        
        const g = svg.select('g');
        
        // Update bars with animation
        g.selectAll('.spectral-bar')
            .data(data)
            .transition()
            .duration(500)
            .attr('y', d => yScale(d.value))
            .attr('height', d => chartHeight - yScale(d.value));
          // Update or add value labels
        const width = 300;
        g.selectAll('.bar-label').remove();
        g.selectAll('.bar-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', (d, i) => (i * (width - margin.left - margin.right) / 3) + ((width - margin.left - margin.right) / 6))
            .attr('y', d => yScale(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('fill', '#333')
            .text(d => `${Math.round(d.value)}%`);
        
        console.log('Spectral chart updated:', data);
    }
    
    // Animate metric values
    animateValue(elementId, newValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startValue = parseFloat(element.textContent) || 0;
        const endValue = parseFloat(newValue) || 0;
        const duration = 1000; // 1 second
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = startValue + (endValue - startValue) * progress;
            element.textContent = Math.round(currentValue) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Create sparkline for any metric
    createSparkline(elementId, data, color = '#4a9eff') {
        const element = document.getElementById(elementId);
        if (!element || !this.d3Available) return;
        
        const width = 60;
        const height = 20;
        
        element.innerHTML = '';
        
        const svg = d3.select(element)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([height - 2, 2]);
        
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d))
            .curve(d3.curveMonotoneX);
        
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('d', line);
    }
    
    // Update sparkline
    updateSparkline(elementId, data, color = '#4a9eff') {
        this.createSparkline(elementId, data, color);
    }
}

// Export for use in other modules
export const viz = new Visualizations();
