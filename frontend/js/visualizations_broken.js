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
        this.drawOptimalZones(g, hourScale);
        
        // Current time indicator
        this.updateClockHand(g, hourScale);
        
        // Update every minute
        setInterval(() => this.updateClockHand(g, hourScale), 60000);
    }
    
    // Draw optimal light exposure zones
    drawOptimalZones(g, hourScale) {
        const zones = [
            { start: 6, end: 10, color: '#4a9eff', opacity: 0.3, label: 'Morning Light' },
            { start: 10, end: 17, color: '#4ade80', opacity: 0.2, label: 'Daylight' },
            { start: 17, end: 20, color: '#fbbf24', opacity: 0.2, label: 'Evening' },
            { start: 20, end: 24, color: '#ef4444', opacity: 0.1, label: 'Avoid Light' },
            { start: 0, end: 6, color: '#ef4444', opacity: 0.1, label: 'Sleep' }
        ];
        
        const arc = d3.arc()
            .innerRadius(40)
            .outerRadius(this.clockRadius);
        
        zones.forEach(zone => {
            const startAngle = hourScale(zone.start) - Math.PI / 2;
            const endAngle = hourScale(zone.end) - Math.PI / 2;
            
            g.append('path')
                .datum({
                    startAngle: startAngle,
                    endAngle: endAngle
                })
                .attr('d', arc)
                .attr('fill', zone.color)
                .attr('opacity', zone.opacity)
                .attr('class', 'optimal-zone')
                .on('mouseover', function(event) {
                    d3.select(this).attr('opacity', zone.opacity + 0.2);
                    // Show tooltip
                    const tooltip = d3.select('body').append('div')
                        .attr('class', 'tooltip')
                        .style('left', event.pageX + 10 + 'px')
                        .style('top', event.pageY - 20 + 'px')
                        .text(zone.label);
                    
                    setTimeout(() => tooltip.classed('show', true), 10);
                })
                .on('mouseout', function() {
                    d3.select(this).attr('opacity', zone.opacity);
                    d3.selectAll('.tooltip').remove();
                });
        });
    }
    
    // Update clock hand for current time
    updateClockHand(g, hourScale) {
        const now = new Date();
        const hours = now.getHours() + now.getMinutes() / 60;
        const angle = hourScale(hours) - Math.PI / 2;
        
        // Remove existing hand
        g.selectAll('.clock-hand').remove();
        
        // Add new hand
        const handGroup = g.append('g')
            .attr('class', 'clock-hand')
            .attr('transform', `rotate(${angle * 180 / Math.PI})`);
        
        // Hand design
        handGroup.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', this.clockRadius - 20)
            .attr('y2', 0)
            .attr('stroke', '#ff8c42')
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round');
        
        handGroup.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 6)
            .attr('fill', '#ff8c42');
        
        // Glow effect
        handGroup.append('circle')
            .attr('cx', this.clockRadius - 20)
            .attr('cy', 0)
            .attr('r', 8)            .attr('fill', '#ff8c42')
            .attr('opacity', 0.5)
            .attr('class', 'pulse');
    }
    
    // Fallback clock without D3.js
    createFallbackClock() {
        const container = document.getElementById('circadian-clock');
        if (!container) return;
        
        container.innerHTML = `
            <div class="fallback-clock">
                <div class="clock-face">
                    <div class="clock-hand hour-hand" id="fallback-hour"></div>
                    <div class="clock-hand minute-hand" id="fallback-minute"></div>
                    <div class="clock-center"></div>
                </div>
                <div class="clock-time" id="fallback-time">--:--</div>
            </div>
        `;
        
        // Add basic CSS if not already present
        if (!document.querySelector('#fallback-clock-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-clock-styles';
            style.textContent = `
                .fallback-clock {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                }
                .clock-face {
                    position: relative;
                    width: 200px;
                    height: 200px;
                    border: 2px solid #4a9eff;
                    border-radius: 50%;
                    background: radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%);
                }
                .clock-hand {
                    position: absolute;
                    background: #4a9eff;
                    transform-origin: bottom center;
                    left: 50%;
                    bottom: 50%;
                }
                .hour-hand {
                    width: 4px;
                    height: 50px;
                    margin-left: -2px;
                }
                .minute-hand {
                    width: 2px;
                    height: 70px;
                    margin-left: -1px;
                }
                .clock-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 10px;
                    height: 10px;
                    background: #ff8c42;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                }
                .clock-time {
                    margin-top: 15px;
                    font-size: 1.2em;
                    color: #4a9eff;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Update fallback clock
        this.updateFallbackClock();
        setInterval(() => this.updateFallbackClock(), 1000);
    }
    
    // Update fallback clock hands
    updateFallbackClock() {
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        
        const hourAngle = (hours * 30) + (minutes * 0.5); // 30 degrees per hour
        const minuteAngle = minutes * 6; // 6 degrees per minute
        
        const hourHand = document.getElementById('fallback-hour');
        const minuteHand = document.getElementById('fallback-minute');
        const timeDisplay = document.getElementById('fallback-time');
        
        if (hourHand) {
            hourHand.style.transform = `rotate(${hourAngle}deg)`;
        }
        if (minuteHand) {
            minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        }
        if (timeDisplay) {
            timeDisplay.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }
      // Initialize exposure history chart
    initExposureChart() {
        if (!this.isVisualizationReady('exposure-chart')) {
            // Fallback: create simple chart without D3
            this.createFallbackChart();
            return;
        }
        
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const chartElement = document.getElementById('exposure-chart');
        const width = chartElement.clientWidth - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;
        
        // Clear existing
        d3.select('#exposure-chart').selectAll('*').remove();
        
        const svg = d3.select('#exposure-chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Scales
        const xScale = d3.scaleTime()
            .domain([new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)])
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, 500])
            .range([height, 0]);
        
        // Axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d3.timeFormat('%H:%M'))
                .ticks(d3.timeHour.every(3)));
        
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));
        
        // Axis labels
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('fill', '#999')
            .text('Melanopic Lux');
        
        // Optimal zones background
        this.drawChartZones(g, xScale, yScale, width, height);
        
        // Line generator
        const line = d3.line()
            .x(d => xScale(new Date(d.timestamp)))
            .y(d => yScale(d.melanopicLux))
            .curve(d3.curveMonotoneX);
        
        // Store references for updates
        this.chart = { g, xScale, yScale, line, width, height };
    }
    
    // Draw background zones on chart
    drawChartZones(g, xScale, yScale, width, height) {
        const zones = [
            { start: 6, end: 10, level: 250, color: '#4a9eff', label: 'Target: 250+' },
            { start: 10, end: 17, level: 200, color: '#4ade80', label: 'Target: 200+' },
            { start: 17, end: 20, level: 100, color: '#fbbf24', label: 'Target: <100' },
            { start: 20, end: 24, level: 50, color: '#ef4444', label: 'Target: <50' }
        ];
        
        zones.forEach(zone => {
            const x1 = xScale(new Date().setHours(zone.start, 0, 0, 0));
            const x2 = xScale(new Date().setHours(zone.end, 0, 0, 0));
            
            g.append('rect')
                .attr('x', x1)
                .attr('y', 0)
                .attr('width', x2 - x1)
                .attr('height', height)
                .attr('fill', zone.color)
                .attr('opacity', 0.1);
            
            // Target line
            g.append('line')
                .attr('x1', x1)
                .attr('x2', x2)
                .attr('y1', yScale(zone.level))
                .attr('y2', yScale(zone.level))
                .attr('stroke', zone.color)
                .attr('stroke-width', 2)                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0.5);
        });
    }
    
    // Fallback chart without D3.js
    createFallbackChart() {
        const container = document.getElementById('exposure-chart');
        if (!container) return;
        
        container.innerHTML = `
            <div class="fallback-chart">
                <h4>Light Exposure History</h4>
                <div class="chart-placeholder">
                    <div class="chart-bar-container" id="fallback-bars"></div>
                    <div class="chart-legend">
                        <span class="legend-item">📊 Simplified view - Install Chrome/Edge for full charts</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add basic CSS for fallback chart
        if (!document.querySelector('#fallback-chart-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-chart-styles';
            style.textContent = `
                .fallback-chart {
                    padding: 20px;
                    background: var(--bg-card);
                    border-radius: var(--border-radius);
                }
                .chart-placeholder {
                    height: 200px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border: 1px solid #333;
                    border-radius: 8px;
                    margin-top: 15px;
                }
                .chart-bar-container {
                    display: flex;
                    align-items: end;
                    height: 100px;
                    gap: 2px;
                    margin-bottom: 10px;
                }
                .chart-bar {
                    width: 8px;
                    background: linear-gradient(to top, #4a9eff, #ff8c42);
                    border-radius: 2px 2px 0 0;
                    opacity: 0.7;
                }
                .chart-legend {
                    font-size: 0.9em;
                    color: var(--text-secondary);
                }
            `;
            document.head.appendChild(style);
        }
        
        this.fallbackHistory = [];
    }
    
    // Update fallback chart
    updateFallbackChart(data) {
        const container = document.getElementById('fallback-bars');
        if (!container) return;
        
        this.fallbackHistory.push(data.melanopicLux || 0);
        if (this.fallbackHistory.length > 24) {
            this.fallbackHistory.shift();
        }
        
        const maxValue = Math.max(...this.fallbackHistory, 100);
        
        container.innerHTML = this.fallbackHistory.map(value => {
            const height = (value / maxValue) * 80 + 5; // Min height 5px
            return `<div class="chart-bar" style="height: ${height}px"></div>`;
        }).join('');
    }
      // Update exposure chart with new data
    updateExposureChart(data) {
        // If D3 not available, use fallback
        if (!this.d3Available) {
            this.updateFallbackChart(data);
            return;
        }
        
        if (!this.chart) return;
        
        // Add to history
        this.historyData.push(data);
        if (this.historyData.length > this.maxHistoryPoints) {
            this.historyData.shift();
        }
        
        // Filter data for today only
        const today = new Date().setHours(0, 0, 0, 0);
        const todayData = this.historyData.filter(d => 
            new Date(d.timestamp).setHours(0, 0, 0, 0) === today
        );
        
        // Update line
        const path = this.chart.g.selectAll('.exposure-line')
            .data([todayData]);
        
        path.enter()
            .append('path')
            .attr('class', 'exposure-line')
            .merge(path)
            .attr('d', this.chart.line)
            .attr('fill', 'none')
            .attr('stroke', '#4a9eff')
            .attr('stroke-width', 2);
        
        // Add data points
        const circles = this.chart.g.selectAll('.data-point')
            .data(todayData);
        
        circles.enter()
            .append('circle')
            .attr('class', 'data-point')
            .merge(circles)
            .attr('cx', d => this.chart.xScale(new Date(d.timestamp)))
            .attr('cy', d => this.chart.yScale(d.melanopicLux))
            .attr('r', 3)
            .attr('fill', '#4a9eff')
            .on('mouseover', function(event, d) {
                // Show tooltip
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('left', event.pageX + 10 + 'px')
                    .style('top', event.pageY - 20 + 'px')
                    .html(`
                        <strong>${new Date(d.timestamp).toLocaleTimeString()}</strong><br>
                        Melanopic: ${Math.round(d.melanopicLux)} lux<br>
                        Color Temp: ${Math.round(d.colorTemp)}K
                    `);
                
                setTimeout(() => tooltip.classed('show', true), 10);
            })
            .on('mouseout', function() {
                d3.selectAll('.tooltip').remove();
            });
        
        circles.exit().remove();
    }
    
    // Update color temperature visualization
    updateColorTempBar(colorTemp) {
        const minTemp = 2000;
        const maxTemp = 6500;
        const percentage = ((colorTemp - minTemp) / (maxTemp - minTemp)) * 100;
        
        // Update or create indicator
        let indicator = document.querySelector('.temp-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'temp-indicator';
            document.getElementById('temp-visualization').appendChild(indicator);
        }
        
        indicator.style.left = `${percentage}%`;
    }
    
    // Animate metric updates
    animateValue(elementId, newValue, suffix = '') {
        const element = document.getElementById(elementId);
        const current = parseFloat(element.textContent) || 0;
        const increment = (newValue - current) / 20;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            const value = current + (increment * step);
            element.textContent = Math.round(value) + suffix;
            
            if (step >= 20) {
                clearInterval(timer);
                element.textContent = Math.round(newValue) + suffix;
            }
        }, 25);
    }
    
    // Create mini sparkline for metric cards
    createSparkline(elementId, data, color = '#4a9eff') {
        const width = 100;
        const height = 30;
        const margin = 2;
        
        const svg = d3.select(`#${elementId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('position', 'absolute')
            .style('bottom', '10px')
            .style('right', '10px')
            .style('opacity', '0.5');
        
        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([margin, width - margin]);
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(data))
            .range([height - margin, margin]);
        
        const line = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScale(d))
            .curve(d3.curveMonotoneX);
        
        svg.append('path')
            .datum(data)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
    }
}

// Export visualization instance
export const viz = new Visualizations();