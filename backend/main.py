from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
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


@app.get("/dataset/{dataset_id}/summary")
async def get_dataset_summary(dataset_id: str):
    """Get detailed dataset summary including data quality metrics"""
    if dataset_id not in uploaded_datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = uploaded_datasets[dataset_id]
        
        # Calculate detailed statistics
        summary = {
            "basic_info": {
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "memory_usage": float(df.memory_usage(deep=True).sum() / 1024 / 1024),  # MB
            },
            "columns": [],
            "missing_data": {
                "total_missing": int(df.isnull().sum().sum()),
                "columns_with_missing": df.isnull().sum()[df.isnull().sum() > 0].to_dict()
            },
            "data_types": df.dtypes.astype(str).to_dict(),
            "duplicates": {
                "total_duplicates": int(df.duplicated().sum()),
                "unique_rows": int(len(df.drop_duplicates()))
            }
        }
        
        # Column-level details
        for col in df.columns:
            col_info = {
                "name": col,
                "type": str(df[col].dtype),
                "missing_count": int(df[col].isnull().sum()),
                "missing_percentage": round(df[col].isnull().sum() / len(df) * 100, 2),
                "unique_count": int(df[col].nunique())
            }
            
            # Add statistics for numeric columns
            if pd.api.types.is_numeric_dtype(df[col]):
                col_info["statistics"] = {
                    "mean": float(df[col].mean()) if not df[col].isnull().all() else None,
                    "median": float(df[col].median()) if not df[col].isnull().all() else None,
                    "min": float(df[col].min()) if not df[col].isnull().all() else None,
                    "max": float(df[col].max()) if not df[col].isnull().all() else None,
                    "std": float(df[col].std()) if not df[col].isnull().all() else None
                }
            else:
                # For categorical columns
                col_info["top_values"] = df[col].value_counts().head(5).to_dict()
            
            summary["columns"].append(col_info)
        
        return summary
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary error: {str(e)}")


@app.post("/dataset/{dataset_id}/clean")
async def clean_dataset(
    dataset_id: str,
    drop_duplicates: bool = Form(False),
    fill_numeric_missing: str = Form("none"),  # none, mean, median, zero
    drop_missing_threshold: float = Form(0.0)  # Drop columns with > X% missing
):
    """Clean dataset by removing duplicates and handling missing values"""
    if dataset_id not in uploaded_datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        df = uploaded_datasets[dataset_id].copy()
        cleaning_report = {
            "original_shape": df.shape,
            "actions_taken": []
        }
        
        # Drop duplicates
        if drop_duplicates:
            before = len(df)
            df = df.drop_duplicates()
            removed = before - len(df)
            if removed > 0:
                cleaning_report["actions_taken"].append(
                    f"Removed {removed} duplicate rows"
                )
        
        # Drop columns with high missing percentage
        if drop_missing_threshold > 0:
            cols_to_drop = []
            for col in df.columns:
                missing_pct = df[col].isnull().sum() / len(df) * 100
                if missing_pct > drop_missing_threshold:
                    cols_to_drop.append(col)
            
            if cols_to_drop:
                df = df.drop(columns=cols_to_drop)
                cleaning_report["actions_taken"].append(
                    f"Dropped {len(cols_to_drop)} columns with >{drop_missing_threshold}% missing: {cols_to_drop}"
                )
        
        # Fill missing numeric values
        if fill_numeric_missing != "none":
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                if df[col].isnull().any():
                    if fill_numeric_missing == "mean":
                        df[col].fillna(df[col].mean(), inplace=True)
                    elif fill_numeric_missing == "median":
                        df[col].fillna(df[col].median(), inplace=True)
                    elif fill_numeric_missing == "zero":
                        df[col].fillna(0, inplace=True)
            
            cleaning_report["actions_taken"].append(
                f"Filled missing numeric values using {fill_numeric_missing}"
            )
        
        # Update the dataset
        uploaded_datasets[dataset_id] = df
        
        cleaning_report["final_shape"] = df.shape
        cleaning_report["rows_removed"] = cleaning_report["original_shape"][0] - df.shape[0]
        cleaning_report["columns_removed"] = cleaning_report["original_shape"][1] - df.shape[1]
        
        return cleaning_report
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleaning error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
