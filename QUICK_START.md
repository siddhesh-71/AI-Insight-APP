# Quick Start Guide - AI Insights App

## 🚀 3-Step Setup (First Time Only)

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Get Hugging Face API Key
- Visit: https://huggingface.co/settings/tokens
- Create free account
- Generate new token (Read permission)
- Copy the token (starts with `hf_`)

### 3. Start the Application
**Option A: Automatic (Windows)**
```bash
double-click start.bat
```

**Option B: Manual**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend (new terminal)
python start_frontend.py
```

## 🎯 Using the App

1. **Open Browser**: http://localhost:3000/insights.html

2. **Set API Key**: Paste your Hugging Face token and click "Set API Key"

3. **Upload Data**: 
   - Drag & drop CSV/JSON file
   - OR use the sample: `sample_data.csv`

4. **Analyze**:
   - 📊 **Statistical Analysis** → Correlations, trends, outliers
   - 🤖 **AI Insights** → Automated pattern detection
   - 📈 **Chart Recommendations** → Smart visualization suggestions

## 📊 What You Get

### Statistical Analysis
✓ Correlation detection between variables
✓ Trend identification (increasing/decreasing)
✓ Outlier detection (unusual values)
✓ Anomaly detection (irregular patterns)
✓ Distribution analysis (normal, skewed, etc.)

### AI Insights
✓ Natural language summaries
✓ Key findings highlighted
✓ Pattern explanations
✓ Actionable recommendations

### Chart Recommendations
✓ Best chart types for your data
✓ Priority-ranked suggestions
✓ Reasoning for each recommendation

## 🔧 Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000/insights.html |
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |

## 📁 Sample Data

Use the included `sample_data.csv` for testing:
- 50 rows of sales data
- Multiple columns: date, revenue, customers, region, etc.
- Perfect for demonstrating all features

## 💡 Pro Tips

1. **Data Quality**: Clean data = better insights
2. **Column Names**: Use descriptive names (e.g., "total_revenue" not "tr")
3. **File Size**: Keep under 100MB for best performance
4. **API Limits**: Free tier sufficient for testing (hundreds of requests/day)
5. **Browser**: Use Chrome/Edge for best experience

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Port already in use" | Change port in config or close other apps |
| "Module not found" | Run `pip install -r requirements.txt` |
| "API key invalid" | Check key starts with `hf_` and no spaces |
| "Cannot connect to backend" | Ensure backend is running on port 8000 |
| Frontend not loading | Check that frontend server is running |

## 🛑 Stopping the App

**If using start.bat:**
Close the command windows

**If running manually:**
Press `Ctrl+C` in each terminal

## 📚 File Reference

```
insights-app/
├── README.md                    # Full documentation
├── HUGGINGFACE_SETUP.md        # API key guide
├── QUICK_START.md              # This file
├── start.bat                   # Windows auto-start
├── start_frontend.py           # Frontend server
├── sample_data.csv             # Test data
│
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── requirements.txt        # Dependencies
│   └── utils/
│       ├── analyzer.py         # Stats engine
│       └── ai_insights.py      # AI generator
│
└── frontend/
    ├── insights.html           # Main UI
    ├── css/insights.css        # Styling
    └── js/insights.js          # Logic
```

## 🎓 Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/tutorial/
- **Hugging Face**: https://huggingface.co/docs/hub/
- **Data Science**: https://scikit-learn.org/stable/

## ✨ Next Steps

After getting comfortable:
1. Try your own datasets
2. Explore different data patterns
3. Compare AI insights with statistical findings
4. Experiment with various file formats
5. Check API documentation at http://localhost:8000/docs

---

**Need more help?** Check `README.md` for detailed documentation.

**Happy analyzing! 🚀📊**
