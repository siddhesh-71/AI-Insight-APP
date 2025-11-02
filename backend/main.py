from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import json
import os
from typing import Optional
from utils.analyzer import DataAnalyzer
from utils.ai_insights import AIInsightsGenerator
import io

app = FastAPI(title="AI Insights API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store uploaded data in memory (for demo purposes)
# In production, use a database or cache
uploaded_datasets = {}

# Hugging Face API key storage
hf_api_key = None


@app.get("/")
async def root():
    return {
        "message": "AI Insights API",
        "version": "1.0.0",
        "endpoints": [
            "/upload",
            "/analyze",
            "/ai-insights",
            "/chart-recommendations",
            "/explain-pattern"
        ]
    }


@app.post("/set-api-key")
async def set_api_key(api_key: str = Form(...)):
    """Set Hugging Face API key"""
    global hf_api_key
    hf_api_key = api_key
    return {"message": "API key set successfully"}


@app.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    """Upload CSV or JSON data file"""
    try:
        contents = await file.read()
        
        # Determine file type and parse
        if file.filename and file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename and file.filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or JSON.")
        
        # Generate a dataset ID
        dataset_id = f"dataset_{len(uploaded_datasets) + 1}"
        
        # Store the dataframe
        uploaded_datasets[dataset_id] = df
        
        # Return basic info
        return {
            "dataset_id": dataset_id,
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "preview": df.head(5).to_dict('records'),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/analyze/{dataset_id}")
async def analyze_data(dataset_id: str):
    """Perform comprehensive statistical analysis"""
    if dataset_id not in uploaded_datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = uploaded_datasets[dataset_id]
        analyzer = DataAnalyzer(df)
        
        insights = analyzer.get_comprehensive_insights()
        
        return JSONResponse(content=insights)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/ai-insights/{dataset_id}")
async def generate_ai_insights(dataset_id: str, api_key: Optional[str] = Form(None)):
    """Generate AI-powered narrative insights"""
    if dataset_id not in uploaded_datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Use provided key or global key
    key = api_key or hf_api_key
    if not key:
        raise HTTPException(status_code=400, detail="Hugging Face API key required")
    
    try:
        df = uploaded_datasets[dataset_id]
        
        # Perform analysis
        analyzer = DataAnalyzer(df)
        analysis_results = analyzer.get_comprehensive_insights()
        
        # Generate AI insights
        ai_generator = AIInsightsGenerator(api_key=key)
        narrative = ai_generator.generate_narrative_insights(analysis_results)
        
        # Get chart recommendations
        data_summary = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'numeric_columns': len(analyzer.numeric_cols),
            'categorical_columns': len(analyzer.categorical_cols),
            'column_names': df.columns.tolist()
        }
        chart_recommendations = ai_generator.recommend_chart_type(data_summary)
        
        return {
            "narrative_insights": narrative,
            "chart_recommendations": chart_recommendations,
            "analysis_summary": {
                "correlations_found": len(analysis_results.get('correlations', [])),
                "trends_detected": len(analysis_results.get('trends', [])),
                "outliers_in_columns": len(analysis_results.get('outliers', {})),
                "anomalies_detected": analysis_results.get('anomalies', {}).get('total_anomalies', 0)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insights error: {str(e)}")


@app.post("/chart-recommendations/{dataset_id}")
async def get_chart_recommendations(dataset_id: str, api_key: Optional[str] = Form(None)):
    """Get chart type recommendations"""
    if dataset_id not in uploaded_datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    key = api_key or hf_api_key
    if not key:
        raise HTTPException(status_code=400, detail="Hugging Face API key required")
    
    try:
        df = uploaded_datasets[dataset_id]
        analyzer = DataAnalyzer(df)
        
        data_summary = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'numeric_columns': len(analyzer.numeric_cols),
            'categorical_columns': len(analyzer.categorical_cols),
            'column_names': df.columns.tolist()
        }
        
        ai_generator = AIInsightsGenerator(api_key=key)
        recommendations = ai_generator.recommend_chart_type(data_summary)
        
        return {"recommendations": recommendations}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")


@app.post("/explain-pattern")
async def explain_pattern(
    pattern_type: str = Form(...),
    pattern_data: str = Form(...),
    api_key: Optional[str] = Form(None)
):
    """Explain a specific pattern in natural language"""
    key = api_key or hf_api_key
    if not key:
        raise HTTPException(status_code=400, detail="Hugging Face API key required")
    
    try:
        pattern_dict = json.loads(pattern_data)
        
        ai_generator = AIInsightsGenerator(api_key=key)
        explanation = ai_generator.explain_pattern(pattern_type, pattern_dict)
        
        return {"explanation": explanation}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")


@app.get("/datasets")
async def list_datasets():
    """List all uploaded datasets"""
    datasets = []
    for dataset_id, df in uploaded_datasets.items():
        datasets.append({
            "dataset_id": dataset_id,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist()
        })
    return {"datasets": datasets}


@app.delete("/dataset/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset"""
    if dataset_id not in uploaded_datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    del uploaded_datasets[dataset_id]
    return {"message": f"Dataset {dataset_id} deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
