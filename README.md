# AI-Powered Data Insights Application

An intelligent web application that automatically analyzes data, detects patterns, and generates AI-powered insights using Hugging Face models.

## 🌟 Features

### Core Capabilities
- **Multiple Data Formats**: Upload CSV and JSON files
- **Advanced Statistical Analysis**: 
  - Correlation detection
  - Trend analysis
  - Outlier identification
  - Anomaly detection
  - Distribution analysis
- **AI-Powered Insights**: 
  - Automated pattern recognition
  - Natural language insights generation
  - Chart recommendations
  - Intelligent data summaries
- **Interactive Visualizations**: Multiple chart type recommendations
- **Real-time Processing**: Fast data analysis with comprehensive results

## 📁 Project Structure

```
insights-app/
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── requirements.txt        # Python dependencies
│   └── utils/
│       ├── analyzer.py         # Statistical analysis engine
│       └── ai_insights.py      # AI insights generator (Hugging Face)
└── frontend/
    ├── insights.html           # Main UI
    ├── css/
    │   └── insights.css        # Styling
    └── js/
        └── insights.js         # Frontend logic
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10 or higher
- Hugging Face API key (free - get yours at https://huggingface.co/settings/tokens)

### Installation & Running

The application consists of two servers:

**1. Backend Server (Port 8000)**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**2. Frontend Server (Port 3000)**
```bash
# In a new terminal
python start_frontend.py
```

### Access the Application
Open your browser and navigate to:
```
http://localhost:3000/insights.html
```

## 📖 How to Use

### Step 1: Set Your Hugging Face API Key
1. Get a free API key from [Hugging Face](https://huggingface.co/settings/tokens)
2. Enter the API key in the configuration section
3. Click "Set API Key"

### Step 2: Upload Your Data
- Drag and drop a CSV or JSON file
- OR click "Browse Files" to select a file
- View the automatic data preview

### Step 3: Analyze Your Data

**Statistical Analysis**
- Click "Statistical Analysis" to run comprehensive analysis
- View results in organized tabs:
  - **Correlations**: Strong relationships between variables
  - **Trends**: Directional patterns and growth/decline
  - **Outliers**: Unusual values requiring attention
  - **Anomalies**: Irregular data points
  - **Distributions**: Statistical characteristics

**AI-Powered Insights**
- Click "Generate AI Insights" for intelligent analysis
- Get natural language summaries of key findings
- See pattern explanations and recommendations
- View automated insight metrics

**Chart Recommendations**
- Click "Chart Recommendations"
- Get intelligent visualization suggestions
- See recommended chart types with explanations
- Priority-ranked recommendations

## 🔬 Analysis Capabilities

### Statistical Features
- **Correlation Detection**: Identifies relationships (Pearson correlation > 0.5)
- **Trend Analysis**: Linear regression-based trend detection
- **Outlier Detection**: IQR and Z-score methods
- **Anomaly Detection**: Isolation Forest algorithm
- **Distribution Analysis**: Normality testing, skewness, kurtosis
- **Clustering**: K-means and DBSCAN segmentation

### AI Features (via Hugging Face)
- **Pattern Recognition**: Automated identification of data patterns
- **Natural Language Insights**: Plain-language explanations
- **Chart Recommendations**: Context-aware visualization suggestions
- **Smart Summaries**: Concise dataset overviews

## 🛠️ API Endpoints

### Backend API (http://localhost:8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload CSV/JSON file |
| `/analyze/{dataset_id}` | POST | Run statistical analysis |
| `/ai-insights/{dataset_id}` | POST | Generate AI insights |
| `/chart-recommendations/{dataset_id}` | POST | Get chart suggestions |
| `/set-api-key` | POST | Set Hugging Face API key |
| `/datasets` | GET | List all uploaded datasets |

## 📊 Supported Data Formats

**CSV Files**
- Standard comma-separated values
- Automatic type detection
- Header row required

**JSON Files**
- Array of objects format
- Nested structures supported
- Automatic schema inference

## 🎨 UI Features

- **Dark Theme**: Easy on the eyes for extended use
- **Responsive Design**: Works on desktop and mobile
- **Interactive Cards**: Hover effects and animations
- **Real-time Loading**: Progress indicators
- **Tabbed Navigation**: Organized result viewing
- **Drag & Drop**: Intuitive file upload

## 🔒 Privacy & Security

- All data processing happens locally or via secure APIs
- Files are stored in memory (not persisted to disk)
- API keys are session-based
- No data is retained after session ends

## 🧪 Example Use Cases

1. **Sales Analysis**: Identify trends, correlations between products, seasonal patterns
2. **Quality Control**: Detect anomalies and outliers in manufacturing data
3. **Customer Segmentation**: Cluster analysis for market research
4. **Financial Analysis**: Trend detection and correlation analysis
5. **Performance Monitoring**: Track KPIs and identify unusual patterns

## 📝 Sample Data

Create a sample CSV file for testing:

```csv
date,revenue,customers,region
2024-01-01,1500,25,North
2024-01-02,1800,30,South
2024-01-03,1600,28,North
2024-01-04,2100,35,East
2024-01-05,1900,32,West
```

## ⚙️ Configuration

### Environment Variables (Optional)
Create a `.env` file in the backend directory:

```env
HUGGINGFACE_API_KEY=your_api_key_here
```

### Port Configuration
- Backend: Edit `PORT` in `backend/main.py` (default: 8000)
- Frontend: Edit `PORT` in `start_frontend.py` (default: 3000)

## 🐛 Troubleshooting

**Backend won't start**
- Ensure Python 3.10+ is installed
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

**Frontend can't connect to backend**
- Verify backend is running on port 8000
- Check CORS settings in browser console
- Ensure `API_BASE_URL` in `insights.js` matches backend URL

**AI insights not generating**
- Verify Hugging Face API key is valid
- Check internet connection
- Try upgrading huggingface-hub: `pip install --upgrade huggingface-hub`

**File upload fails**
- Check file format (CSV or JSON only)
- Ensure file is properly formatted
- Try with a smaller file first

## 🚀 Performance Tips

- Keep datasets under 100MB for best performance
- Use CSV format for faster parsing
- Clean data before uploading for better insights
- Close unused datasets to free memory

## 📚 Technologies Used

**Backend**
- FastAPI - Modern Python web framework
- Pandas - Data manipulation and analysis
- Scikit-learn - Machine learning algorithms
- SciPy - Scientific computing
- Hugging Face - AI model inference

**Frontend**
- Vanilla JavaScript - No framework overhead
- Modern CSS3 - Animations and gradients
- Font Awesome - Icon library
- Inter Font - Clean typography

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Report bugs
- Suggest features
- Submit improvements
- Fork and modify

## 📄 License

This project is open source and available for educational and commercial use.

## 🔗 Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)

## 💡 Tips for Best Results

1. **Data Quality**: Clean, well-structured data produces better insights
2. **Column Names**: Use descriptive names for clearer analysis
3. **Data Types**: Ensure numeric columns are properly formatted
4. **Sample Size**: At least 10-20 rows for meaningful statistical analysis
5. **API Usage**: Hugging Face API has rate limits on free tier

## 🎯 Future Enhancements

- Database integration for persistent storage
- More data source connectors (SQL, APIs)
- Advanced visualization generation
- Custom model training
- Collaborative dashboards
- Export to PowerPoint/Excel
- Real-time data streaming
- Advanced filtering and transformation tools

---

**Made with ❤️ using FastAPI, Hugging Face, and modern web technologies**

For questions or support, please refer to the documentation or create an issue.
