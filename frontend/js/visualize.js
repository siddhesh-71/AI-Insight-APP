// Visualize page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    updateDatasetIndicator();
    
    // Check if dataset exists
    if (!checkDatasetExists()) {
        return;
    }
});

// Statistical Analysis
async function runStatisticalAnalysis() {
    const datasetId = getStoredData(STORAGE_KEYS.DATASET_ID);
    
    if (!datasetId) {
        alert('Please upload a dataset first');
        window.location.href = 'upload.html';
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/analyze/${datasetId}`, {
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
    displayCorrelations(data.correlations);
    displayTrends(data.trends);
    displayOutliers(data.outliers);
    displayDistributions(data.distributions);
}

function displayCorrelations(correlations) {
    const div = document.getElementById('correlations');
    
    if (!correlations || correlations.length === 0) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No significant correlations found</p></div>';
        return;
    }
    
    let html = '<h3 style="margin-bottom: 20px;"><i class="fas fa-link"></i> Strong Correlations Detected</h3>';
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
    
    let html = '<h3 style="margin-bottom: 20px;"><i class="fas fa-chart-line"></i> Trends Analysis</h3>';
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
    
    let html = '<h3 style="margin-bottom: 20px;"><i class="fas fa-exclamation-triangle"></i> Outliers by Column</h3>';
    
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
                    Sample values: ${info.values.slice(0, 5).map(v => typeof v === 'number' ? v.toFixed(2) : v).join(', ')}...
                </div>
            </div>
        `;
    }
    
    div.innerHTML = html;
}

function displayDistributions(distributions) {
    const div = document.getElementById('distributions');
    
    if (!distributions || Object.keys(distributions).length === 0) {
        div.innerHTML = '<div class="empty-state"><i class="fas fa-chart-area"></i><p>No distribution data available</p></div>';
        return;
    }
    
    let html = '<h3 style="margin-bottom: 20px;"><i class="fas fa-chart-area"></i> Distribution Analysis</h3>';
    
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

// Chart Recommendations
async function getChartRecommendations() {
    const datasetId = getStoredData(STORAGE_KEYS.DATASET_ID);
    const apiKey = getStoredData(STORAGE_KEYS.API_KEY);
    
    if (!datasetId) {
        alert('Please upload a dataset first');
        window.location.href = 'upload.html';
        return;
    }
    
    if (!apiKey) {
        alert('Please set your Hugging Face API key first');
        window.location.href = 'upload.html';
        return;
    }
    
    try {
        showLoading(true);
        
        const formData = new FormData();
        formData.append('api_key', apiKey);
        
        const response = await fetch(`${API_BASE_URL}/chart-recommendations/${datasetId}`, {
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
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}
