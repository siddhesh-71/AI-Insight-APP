// AI Insights page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    updateDatasetIndicator();
    
    // Check if dataset and API key exist
    if (!checkDatasetExists() || !checkApiKey()) {
        return;
    }
});

// AI Insights
async function generateAIInsights() {
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
        
        const response = await fetch(`${API_BASE_URL}/ai-insights/${datasetId}`, {
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
    // Show narrative section
    const narrativeSection = document.getElementById('narrativeSection');
    const narrativeDiv = document.getElementById('narrativeInsights');
    narrativeSection.style.display = 'block';
    
    narrativeDiv.innerHTML = `
        <h3><i class="fas fa-brain"></i> AI-Generated Insights</h3>
        <p style="margin-top: 16px;">${data.narrative_insights}</p>
    `;
    
    // Show summary section
    const summarySection = document.getElementById('summarySection');
    const summaryDiv = document.getElementById('insightsSummary');
    summarySection.style.display = 'block';
    
    const summary = data.analysis_summary;
    summaryDiv.innerHTML = `
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
    
    // Show chart recommendations section
    const chartsSection = document.getElementById('insightChartsSection');
    const chartsDiv = document.getElementById('insightChartRecommendations');
    chartsSection.style.display = 'block';
    
    displayChartRecommendationsInDiv(data.chart_recommendations, chartsDiv);
    
    // Scroll to top of insights
    narrativeSection.scrollIntoView({ behavior: 'smooth' });
}

function displayChartRecommendationsInDiv(recommendations, targetDiv) {
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
    
    targetDiv.innerHTML = html;
}
