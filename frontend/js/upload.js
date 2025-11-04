// Upload page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateDatasetIndicator();
});

function initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => fileInput.click());
    }
}

// API Key Management
async function setApiKey() {
    const apiKeyInput = document.getElementById('apiKey');
    const apiKeyValue = apiKeyInput.value.trim();
    
    if (!apiKeyValue) {
        showStatusMessage('apiStatus', 'Please enter a valid API key', 'error');
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
            setStoredData(STORAGE_KEYS.API_KEY, apiKeyValue);
            showStatusMessage('apiStatus', '✓ API key set successfully!', 'success');
            apiKeyInput.value = '';
        } else {
            showStatusMessage('apiStatus', 'Failed to set API key', 'error');
        }
    } catch (error) {
        showStatusMessage('apiStatus', `Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function showStatusMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    const bgColor = type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500';
    element.innerHTML = `<div class="${bgColor} border rounded-lg px-4 py-2">${message}</div>`;
    if (type === 'success') {
        setTimeout(() => element.innerHTML = '', 3000);
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
        showStatusMessage('uploadStatus', 'Please upload a CSV or JSON file', 'error');
        return;
    }
    
    try {
        showLoading(true);
        showStatusMessage('uploadStatus', 'Uploading file...', 'success');
        
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
        
        // Store dataset info
        setStoredData(STORAGE_KEYS.DATASET_ID, data.dataset_id);
        setStoredData(STORAGE_KEYS.DATASET_INFO, {
            filename: file.name,
            rows: data.rows,
            columns: data.columns,
            column_names: data.column_names
        });
        
        showStatusMessage('uploadStatus', `✓ File uploaded successfully! Dataset ID: ${data.dataset_id}`, 'success');
        updateDatasetIndicator();
        displayDataCleaning(data);
        
    } catch (error) {
        showStatusMessage('uploadStatus', `Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayDataCleaning(data) {
    const section = document.getElementById('cleaningSection');
    section.style.display = 'block';
    
    // Update info cards
    document.getElementById('totalRows').textContent = data.rows.toLocaleString();
    document.getElementById('totalCols').textContent = data.columns;
    
    // Calculate missing values
    let totalMissing = 0;
    const columnDetails = [];
    
    for (const [col, dtype] of Object.entries(data.dtypes)) {
        let nullCount = 0;
        data.preview.forEach(row => {
            if (row[col] === null || row[col] === undefined || row[col] === '') {
                nullCount++;
            }
        });
        
        columnDetails.push({
            name: col,
            type: dtype,
            nullCount: nullCount
        });
        
        totalMissing += nullCount;
    }
    
    document.getElementById('missingValues').textContent = totalMissing;
    
    // Count numeric columns
    const numericTypes = ['int64', 'float64', 'int32', 'float32'];
    const numericCount = Object.values(data.dtypes).filter(dt => 
        numericTypes.some(nt => dt.includes(nt))
    ).length;
    document.getElementById('numericCols').textContent = numericCount;
    
    // Display data preview table
    displayDataPreviewTable(data);
    
    // Display quality checks
    displayQualityChecks(data, totalMissing);
    
    // Display column details
    displayColumnDetails(columnDetails);
    
    // Scroll to cleaning section
    section.scrollIntoView({ behavior: 'smooth' });
}

function displayDataPreviewTable(data) {
    const tableDiv = document.getElementById('previewTable');
    
    let tableHTML = '<table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700"><thead class="bg-zinc-50 dark:bg-[#1a1f27]"><tr>';
    data.column_names.forEach(col => {
        tableHTML += `<th class="px-4 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">${col}</th>`;
    });
    tableHTML += '</tr></thead><tbody class="bg-white dark:bg-[#111618] divide-y divide-zinc-200 dark:divide-zinc-700">';
    
    data.preview.slice(0, 10).forEach((row, idx) => {
        tableHTML += `<tr class="${idx % 2 === 0 ? 'bg-white dark:bg-[#111618]' : 'bg-zinc-50 dark:bg-[#1a1f27]'}">`;
        data.column_names.forEach(col => {
            const value = row[col];
            const displayValue = value !== null && value !== undefined ? value : '<span class="text-red-500 italic">null</span>';
            tableHTML += `<td class="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300">${displayValue}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    
    tableDiv.innerHTML = tableHTML;
}

function displayQualityChecks(data, totalMissing) {
    const checksDiv = document.getElementById('qualityChecks');
    
    const checks = [
        {
            label: 'Data Completeness',
            status: totalMissing === 0 ? 'pass' : 'warning',
            message: totalMissing === 0 ? 'No missing values' : `${totalMissing} missing values found`,
            icon: totalMissing === 0 ? 'check_circle' : 'warning'
        },
        {
            label: 'Row Count',
            status: data.rows > 10 ? 'pass' : 'warning',
            message: data.rows > 10 ? `${data.rows} rows available` : 'Limited data',
            icon: data.rows > 10 ? 'check_circle' : 'info'
        },
        {
            label: 'Column Count',
            status: data.columns > 1 ? 'pass' : 'warning',
            message: `${data.columns} columns`,
            icon: 'check_circle'
        },
        {
            label: 'Data Types',
            status: 'pass',
            message: 'Multiple data types detected',
            icon: 'check_circle'
        }
    ];
    
    let html = '';
    checks.forEach(check => {
        const bgColor = check.status === 'pass' ? 'bg-green-500/10 border-green-500' : 'bg-orange-500/10 border-orange-500';
        const textColor = check.status === 'pass' ? 'text-green-500' : 'text-orange-500';
        html += `
            <div class="${bgColor} border rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                    <span class="material-symbols-outlined ${textColor}">${check.icon}</span>
                    <p class="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">${check.label}</p>
                </div>
                <p class="text-xs ${textColor}">${check.message}</p>
            </div>
        `;
    });
    
    checksDiv.innerHTML = html;
}

function displayColumnDetails(columns) {
    const colDiv = document.getElementById('columnDetails');
    
    let html = '';
    columns.forEach(col => {
        const typeColor = col.type.includes('int') || col.type.includes('float') ? 'text-blue-500' : 'text-purple-500';
        const nullColor = col.nullCount > 0 ? 'text-orange-500' : 'text-green-500';
        html += `
            <div class="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-[#1a1f27] dark:to-[#111618] border border-zinc-300 dark:border-zinc-600 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-semibold text-zinc-900 dark:text-white text-sm">${col.name}</span>
                    <span class="${typeColor} text-xs font-mono bg-white dark:bg-[#283339] px-2 py-1 rounded">${col.type}</span>
                </div>
                <div class="text-xs ${nullColor}">
                    <span class="material-symbols-outlined text-sm align-middle">warning</span>
                    Null values: <strong>${col.nullCount}</strong>
                </div>
            </div>
        `;
    });
    
    colDiv.innerHTML = html;
}

function showStatisticalSummary() {
    if (checkDatasetExists()) {
        window.location.href = 'visualize.html';
    }
}

// Data Cleaning Functions
async function applyDataCleaning() {
    const datasetId = getStoredData(STORAGE_KEYS.DATASET_ID);
    if (!datasetId) {
        showStatusMessage('cleaningStatus', 'No dataset uploaded', 'error');
        return;
    }

    const dropDuplicates = document.getElementById('dropDuplicates').checked;
    const fillNumeric = document.getElementById('fillNumeric').value;
    const dropMissingThreshold = parseFloat(document.getElementById('dropMissingThreshold').value);

    try {
        showLoading(true);
        showStatusMessage('cleaningStatus', 'Cleaning data...', 'success');

        const formData = new FormData();
        formData.append('drop_duplicates', dropDuplicates);
        formData.append('fill_numeric_missing', fillNumeric);
        formData.append('drop_missing_threshold', dropMissingThreshold);

        const response = await fetch(`${API_BASE_URL}/dataset/${datasetId}/clean`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Cleaning failed');
        }

        const result = await response.json();
        displayCleaningReport(result);

        // Refresh data preview
        await refreshDataPreview();

    } catch (error) {
        showStatusMessage('cleaningStatus', `Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function displayCleaningReport(report) {
    let message = `<strong>✓ Data Cleaning Complete!</strong><br>`;
    message += `Original shape: ${report.original_shape[0]} rows × ${report.original_shape[1]} columns<br>`;
    message += `Final shape: ${report.final_shape[0]} rows × ${report.final_shape[1]} columns<br>`;
    message += `<br><strong>Actions taken:</strong><br>`;
    
    if (report.actions_taken.length === 0) {
        message += 'No changes were needed<br>';
    } else {
        report.actions_taken.forEach(action => {
            message += `• ${action}<br>`;
        });
    }
    
    if (report.rows_removed > 0 || report.columns_removed > 0) {
        message += `<br>Removed: ${report.rows_removed} rows, ${report.columns_removed} columns`;
    }
    
    showStatusMessage('cleaningStatus', message, 'success');
}

async function refreshDataPreview() {
    const datasetId = getStoredData(STORAGE_KEYS.DATASET_ID);
    if (!datasetId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dataset/${datasetId}/summary`);
        if (!response.ok) throw new Error('Failed to refresh data');

        const summary = await response.json();
        
        // Update the info cards
        document.getElementById('totalRows').textContent = summary.basic_info.total_rows.toLocaleString();
        document.getElementById('totalCols').textContent = summary.basic_info.total_columns;
        document.getElementById('missingValues').textContent = summary.missing_data.total_missing;
        
        // Count numeric columns
        const numericCount = summary.columns.filter(col => 
            col.type.includes('int') || col.type.includes('float')
        ).length;
        document.getElementById('numericCols').textContent = numericCount;
        
        // Update column details
        displayColumnDetails(summary.columns.map(col => ({
            name: col.name,
            type: col.type,
            nullCount: col.missing_count
        })));
        
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
}

function resetCleaningOptions() {
    document.getElementById('dropDuplicates').checked = false;
    document.getElementById('fillNumeric').value = 'none';
    document.getElementById('dropMissingThreshold').value = '0';
    showStatusMessage('cleaningStatus', 'Options reset', 'success');
}
