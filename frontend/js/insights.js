// Configuration
const API_BASE_URL = 'http://localhost:8000';
let currentDatasetId = null;
let apiKey = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
}

// API Key Management
async function setApiKey() {
    const apiKeyInput = document.getElementById('apiKey');
    const apiKeyValue = apiKeyInput.value.trim();
    
    if (!apiKeyValue) {
        showStatus('apiStatus', 'Please enter a valid API key', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('api_key', apiKeyValue);
        
        const response = await fetch(`${API_BASE_URL}/set-api-key`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            apiKey = apiKeyValue;
            showStatus('apiStatus', '✓ API key set successfully!', 'success');
            apiKeyInput.value = '';
        } else {
            showStatus('apiStatus', 'Failed to set API key', 'error');
        }
    } catch (error) {
        showStatus('apiStatus', `Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// File Upload Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

async function uploadFile(file) {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
        showStatus('uploadStatus', 'Please upload a CSV or JSON file', 'error');
        return;
    }
    
    try {
        showLoading(true);
        showStatus('uploadStatus', 'Uploading file...', 'success');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const data = await response.json();
        currentDatasetId = data.dataset_id;
        
        showStatus('uploadStatus', `✓ File uploaded successfully! Dataset ID: ${data.dataset_id}`, 'success');
        displayDataPreview(data);
        
        // Show controls
        document.getElementById('controlsSection').style.display = 'block';
        
    } catch (error) {
        showStatus('uploadStatus', `Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayDataPreview(data) {
    const previewDiv = document.getElementById('dataPreview');
    const tableDiv = document.getElementById('previewTable');
    const infoDiv = document.getElementById('dataInfo');
    
    // Create table
    let tableHTML = '<table><thead><tr>';
    data.column_names.forEach(col => {
        tableHTML += `<th>${col}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    data.preview.slice(0, 5).forEach(row => {
        tableHTML += '<tr>';
        data.column_names.forEach(col => {
            tableHTML += `<td>${row[col] !== null ? row[col] : 'null'}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    
    tableDiv.innerHTML = tableHTML;
    infoDiv.innerHTML = `
        <strong>${data.rows.toLocaleString()}</strong> rows × 
        <strong>${data.columns}</strong> columns
    `;
    
    previewDiv.style.display = 'block';
}

// Statistical Analysis
async function runStatisticalAnalysis() {
    if (!currentDatasetId) {
        alert('Please upload a dataset first');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/analyze/${currentDatasetId}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        
        const data = await response.json();
        displayAnalysisResults(data);
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function displayAnalysisResults(data) {
    const section = document.getElementById('analysisSection');
    section.style.display = 'block';
    
    // Correlations
    displayCorrelations(data.correlations);
    
    // Trends
    displayTrends(data.trends);
    
    // Outliers
    displayOutliers(data.outliers);
    
    // Anomalies
    displayAnomalies(data.anomalies);
    
    // Distributions
    displayDistributions(data.distributions);
    
    // Scroll to results
    section.scrollIntoView({ behavior: 'smooth' });
}

function displayCorrelations(correlations) {
    const div = document.getElementById('correlations');
    
    if (!correlations || correlations.length === 0) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No significant correlations found</p></div>';
        return;
    }
    
    let html = '<h3><i class="fas fa-link"></i> Strong Correlations Detected</h3>';
    correlations.forEach(corr => {
        const badgeClass = corr.strength === 'strong' ? 'badge-strong' : 'badge-moderate';
        const directionClass = corr.direction === 'positive' ? 'badge-positive' : 'badge-negative';
        
        html += `
            <div class="pattern-card">
                <div class="pattern-header">
                    <span class="pattern-title">${corr.variable1} ↔ ${corr.variable2}</span>
                    <span class="pattern-badge ${badgeClass}">${corr.strength}</span>
                </div>
                <div style="margin-top: 8px;">
                    <span class="pattern-badge ${directionClass}">${corr.direction}</span>
                    <span style="margin-left: 10px; color: var(--text-secondary);">
                        Correlation: <strong style="color: var(--primary-color);">${corr.correlation}</strong>
                    </span>
                </div>
            </div>
        `;
    });
    
    div.innerHTML = html;
}

function displayTrends(trends) {
    const div = document.getElementById('trends');
    
    if (!trends || trends.length === 0) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No significant trends detected</p></div>';
        return;
    }
    
    let html = '<h3><i class="fas fa-chart-line"></i> Trends Analysis</h3>';
    trends.forEach(trend => {
        const trendIcon = trend.trend === 'increasing' ? '📈' : '📉';
        const badgeClass = trend.strength === 'strong' ? 'badge-strong' : 'badge-moderate';
        
        html += `
            <div class="pattern-card">
                <div class="pattern-header">
                    <span class="pattern-title">${trendIcon} ${trend.column}</span>
                    <span class="pattern-badge ${badgeClass}">${trend.strength}</span>
                </div>
                <div style="margin-top: 8px; color: var(--text-secondary);">
                    Trend: <strong style="color: var(--primary-color);">${trend.trend}</strong> | 
                    Slope: ${trend.slope} | 
                    R²: ${trend.r_squared}
                </div>
            </div>
        `;
    });
    
    div.innerHTML = html;
}

function displayOutliers(outliers) {
    const div = document.getElementById('outliers');
    
    if (!outliers || Object.keys(outliers).length === 0) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>No outliers detected</p></div>';
        return;
    }
    
    let html = '<h3><i class="fas fa-exclamation-triangle"></i> Outliers by Column</h3>';
    
    for (const [column, info] of Object.entries(outliers)) {
        html += `
            <div class="pattern-card">
                <div class="pattern-header">
                    <span class="pattern-title">${column}</span>
                    <span class="pattern-badge badge-moderate">${info.count} outliers</span>
                </div>
                <div style="margin-top: 8px; color: var(--text-secondary);">
                    Percentage: <strong style="color: var(--warning-color);">${info.percentage}%</strong>
                </div>
                <div style="margin-top: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    Sample values: ${info.values.slice(0, 5).map(v => v.toFixed(2)).join(', ')}...
                </div>
            </div>
        `;
    }
    
    div.innerHTML = html;
}

function displayAnomalies(anomalies) {
    const div = document.getElementById('anomalies');
    
    if (anomalies.error || !anomalies.total_anomalies) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No anomalies detected or insufficient data</p></div>';
        return;
    }
    
    let html = `
        <h3><i class="fas fa-search"></i> Anomaly Detection Results</h3>
        <div class="pattern-card">
            <div class="pattern-header">
                <span class="pattern-title">Total Anomalies Found</span>
                <span class="pattern-badge badge-strong">${anomalies.total_anomalies}</span>
            </div>
            <div style="margin-top: 12px;">
                <ul class="stats-list">
                    <li>
                        <span class="stats-label">Percentage of Dataset</span>
                        <span class="stats-value">${anomalies.percentage}%</span>
                    </li>
                    <li>
                        <span class="stats-label">Detection Method</span>
                        <span class="stats-value">Isolation Forest</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
    
    div.innerHTML = html;
}

function displayDistributions(distributions) {
    const div = document.getElementById('distributions');
    
    if (!distributions || Object.keys(distributions).length === 0) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-chart-area"></i><p>No distribution data available</p></div>';
        return;
    }
    
    let html = '<h3><i class="fas fa-chart-area"></i> Distribution Analysis</h3>';
    
    for (const [column, dist] of Object.entries(distributions)) {
        const normalBadge = dist.is_normal ? 
            '<span class="pattern-badge badge-positive">Normal</span>' : 
            `<span class="pattern-badge badge-moderate">${dist.distribution_type.replace('_', ' ')}</span>`;
        
        html += `
            <div class="pattern-card">
                <div class="pattern-header">
                    <span class="pattern-title">${column}</span>
                    ${normalBadge}
                </div>
                <div style="margin-top: 12px;">
                    <ul class="stats-list">
                        <li>
                            <span class="stats-label">Mean</span>
                            <span class="stats-value">${dist.mean}</span>
                        </li>
                        <li>
                            <span class="stats-label">Median</span>
                            <span class="stats-value">${dist.median}</span>
                        </li>
                        <li>
                            <span class="stats-label">Std Dev</span>
                            <span class="stats-value">${dist.std}</span>
                        </li>
                        <li>
                            <span class="stats-label">Skewness</span>
                            <span class="stats-value">${dist.skewness}</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    div.innerHTML = html;
}

// AI Insights
async function generateAIInsights() {
    if (!currentDatasetId) {
        alert('Please upload a dataset first');
        return;
    }
    
    if (!apiKey) {
        alert('Please set your Hugging Face API key first');
        document.getElementById('apiKey').focus();
        return;
    }
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('api_key', apiKey);
        
        const response = await fetch(`${API_BASE_URL}/ai-insights/${currentDatasetId}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate insights');
        }
        
        const data = await response.json();
        displayAIInsights(data);
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function displayAIInsights(data) {
    const section = document.getElementById('insightsSection');
    const narrativeDiv = document.getElementById('narrativeInsights');
    const gridDiv = document.getElementById('insightsGrid');
    
    // Display narrative
    narrativeDiv.innerHTML = `
        <h3><i class="fas fa-brain"></i> AI-Generated Insights</h3>
        <p>${data.narrative_insights}</p>
    `;
    
    // Display summary cards
    const summary = data.analysis_summary;
    gridDiv.innerHTML = `
        <div class="insight-card">
            <h4><i class="fas fa-link"></i> Correlations</h4>
            <div class="insight-value">${summary.correlations_found}</div>
            <p class="insight-description">Strong relationships discovered</p>
        </div>
        <div class="insight-card">
            <h4><i class="fas fa-chart-line"></i> Trends</h4>
            <div class="insight-value">${summary.trends_detected}</div>
            <p class="insight-description">Directional patterns identified</p>
        </div>
        <div class="insight-card">
            <h4><i class="fas fa-exclamation-triangle"></i> Outliers</h4>
            <div class="insight-value">${summary.outliers_in_columns}</div>
            <p class="insight-description">Columns with unusual values</p>
        </div>
        <div class="insight-card">
            <h4><i class="fas fa-search"></i> Anomalies</h4>
            <div class="insight-value">${summary.anomalies_detected}</div>
            <p class="insight-description">Anomalous records found</p>
        </div>
    `;
    
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

// Chart Recommendations
async function getChartRecommendations() {
    if (!currentDatasetId) {
        alert('Please upload a dataset first');
        return;
    }
    
    if (!apiKey) {
        alert('Please set your Hugging Face API key first');
        return;
    }
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('api_key', apiKey);
        
        const response = await fetch(`${API_BASE_URL}/chart-recommendations/${currentDatasetId}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to get recommendations');
        }
        
        const data = await response.json();
        displayChartRecommendations(data.recommendations);
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function displayChartRecommendations(recommendations) {
    const section = document.getElementById('recommendationsSection');
    const gridDiv = document.getElementById('chartRecommendations');
    
    const chartIcons = {
        'line': 'fa-chart-line',
        'bar': 'fa-chart-bar',
        'scatter': 'fa-chart-scatter',
        'histogram': 'fa-chart-area',
        'heatmap': 'fa-th',
        'treemap': 'fa-sitemap',
        'pie': 'fa-chart-pie'
    };
    
    let html = '';
    recommendations.forEach(rec => {
        const icon = chartIcons[rec.type] || 'fa-chart-bar';
        const priorityClass = rec.priority === 'high' ? 'priority-high' : '';
        
        html += `
            <div class="recommendation-card ${priorityClass}">
                <div class="chart-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="chart-type">${rec.type} Chart</div>
                <div class="chart-reason">${rec.reason}</div>
                <div style="margin-top: 12px;">
                    <span class="pattern-badge ${rec.priority === 'high' ? 'badge-strong' : 'badge-moderate'}">
                        ${rec.priority} priority
                    </span>
                </div>
            </div>
        `;
    });
    
    gridDiv.innerHTML = html;
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Utility Functions
function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `status-message ${type}`;
}
