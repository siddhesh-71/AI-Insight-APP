// Shared utilities and configuration
const API_BASE_URL = 'http://localhost:8000';

// Session storage keys
const STORAGE_KEYS = {
    DATASET_ID: 'currentDatasetId',
    API_KEY: 'apiKey',
    DATASET_INFO: 'datasetInfo'
};

// Get from session storage
function getStoredData(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Save to session storage
function setStoredData(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

// Clear session storage
function clearStoredData() {
    sessionStorage.clear();
}

// Update dataset indicator in navbar
function updateDatasetIndicator() {
    const datasetInfo = getStoredData(STORAGE_KEYS.DATASET_INFO);
    const indicator = document.getElementById('datasetIndicator');
    
    if (datasetInfo && indicator) {
        indicator.textContent = `Dataset: ${datasetInfo.filename}`;
        indicator.classList.add('has-data');
    } else if (indicator) {
        indicator.textContent = 'No Dataset';
        indicator.classList.remove('has-data');
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }
}

// Show status message
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `status-message ${type}`;
    }
}

// Check if user has uploaded data
function checkDatasetExists() {
    const datasetId = getStoredData(STORAGE_KEYS.DATASET_ID);
    if (!datasetId) {
        alert('Please upload a dataset first');
        window.location.href = 'upload.html';
        return false;
    }
    return true;
}

// Check if API key is set
function checkApiKey() {
    const apiKey = getStoredData(STORAGE_KEYS.API_KEY);
    if (!apiKey) {
        alert('Please set your Hugging Face API key first');
        window.location.href = 'upload.html';
        return false;
    }
    return true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateDatasetIndicator();
});
