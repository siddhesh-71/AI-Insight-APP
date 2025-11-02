import os
import requests
from typing import Dict, List, Any
from huggingface_hub import InferenceClient
import json


class AIInsightsGenerator:
    """Generate AI-powered insights using Hugging Face models"""
    
    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv('HUGGINGFACE_API_KEY') or ""
        if not self.api_key:
            raise ValueError("Hugging Face API key is required")
        
        self.client = InferenceClient(token=self.api_key)
        self.headers = {"Authorization": f"Bearer {self.api_key}"}
        
    def generate_narrative_insights(self, analysis_results: Dict[str, Any]) -> str:
        """Generate natural language insights from analysis results"""
        
        # Create a structured prompt
        prompt = self._create_insights_prompt(analysis_results)
        
        try:
            # Use Hugging Face's text generation
            response = self.client.text_generation(
                prompt,
                model="mistralai/Mixtral-8x7B-Instruct-v0.1",
                max_new_tokens=500,
                temperature=0.7,
                top_p=0.95
            )
            
            return response
        except Exception as e:
            # Fallback to simpler model
            try:
                response = self.client.text_generation(
                    prompt,
                    model="microsoft/Phi-3-mini-4k-instruct",
                    max_new_tokens=500,
                    temperature=0.7
                )
                return response
            except Exception as fallback_error:
                return self._generate_rule_based_insights(analysis_results)
    
    def _create_insights_prompt(self, analysis_results: Dict[str, Any]) -> str:
        """Create a detailed prompt for the AI model"""
        
        prompt = """You are a data analyst. Analyze the following statistical findings and provide key insights in a clear, concise manner.

Dataset Overview:
"""
        
        # Add basic stats
        if 'basic_stats' in analysis_results:
            stats = analysis_results['basic_stats']
            prompt += f"- Total Records: {stats.get('total_rows', 0)}\n"
            prompt += f"- Columns: {stats.get('total_columns', 0)} ({stats.get('numeric_columns', 0)} numeric, {stats.get('categorical_columns', 0)} categorical)\n\n"
        
        # Add correlations
        if 'correlations' in analysis_results and analysis_results['correlations']:
            prompt += "Key Correlations:\n"
            for corr in analysis_results['correlations'][:3]:
                prompt += f"- {corr['variable1']} and {corr['variable2']}: {corr['correlation']} ({corr['strength']} {corr['direction']})\n"
            prompt += "\n"
        
        # Add trends
        if 'trends' in analysis_results and analysis_results['trends']:
            prompt += "Trends Detected:\n"
            for trend in analysis_results['trends'][:3]:
                prompt += f"- {trend['column']}: {trend['trend']} trend (R²={trend['r_squared']})\n"
            prompt += "\n"
        
        # Add outliers
        if 'outliers' in analysis_results and analysis_results['outliers']:
            prompt += "Outliers Found:\n"
            for col, info in list(analysis_results['outliers'].items())[:3]:
                prompt += f"- {col}: {info['count']} outliers ({info['percentage']}%)\n"
            prompt += "\n"
        
        # Add anomalies
        if 'anomalies' in analysis_results and 'total_anomalies' in analysis_results['anomalies']:
            anom = analysis_results['anomalies']
            prompt += f"Anomalies: {anom['total_anomalies']} detected ({anom['percentage']}%)\n\n"
        
        prompt += "Provide 3-5 actionable insights based on these findings. Be specific and highlight the most important patterns."
        
        return prompt
    
    def _generate_rule_based_insights(self, analysis_results: Dict[str, Any]) -> str:
        """Generate insights using rule-based approach as fallback"""
        
        insights = []
        
        # Basic stats insights
        if 'basic_stats' in analysis_results:
            stats = analysis_results['basic_stats']
            insights.append(f"📊 Dataset contains {stats.get('total_rows', 0):,} records across {stats.get('total_columns', 0)} columns.")
            
            missing = stats.get('missing_values', {})
            if any(v > 0 for v in missing.values()):
                total_missing = sum(missing.values())
                insights.append(f"⚠️ Found {total_missing:,} missing values that may require attention.")
        
        # Correlation insights
        if 'correlations' in analysis_results and analysis_results['correlations']:
            top_corr = analysis_results['correlations'][0]
            insights.append(
                f"🔗 Strong {top_corr['direction']} correlation ({top_corr['correlation']}) detected between "
                f"{top_corr['variable1']} and {top_corr['variable2']}."
            )
        
        # Trend insights
        if 'trends' in analysis_results and analysis_results['trends']:
            for trend in analysis_results['trends'][:2]:
                insights.append(
                    f"📈 {trend['column']} shows a {trend['strength']} {trend['trend']} trend "
                    f"(R²={trend['r_squared']})."
                )
        
        # Outlier insights
        if 'outliers' in analysis_results and analysis_results['outliers']:
            total_outlier_cols = len(analysis_results['outliers'])
            insights.append(f"🎯 Outliers detected in {total_outlier_cols} variables, indicating potential data quality issues or interesting edge cases.")
        
        # Anomaly insights
        if 'anomalies' in analysis_results and 'total_anomalies' in analysis_results['anomalies']:
            anom = analysis_results['anomalies']
            if anom['total_anomalies'] > 0:
                insights.append(
                    f"🚨 {anom['total_anomalies']} anomalous records identified ({anom['percentage']}%), "
                    f"which may warrant further investigation."
                )
        
        # Distribution insights
        if 'distributions' in analysis_results:
            skewed_vars = [
                col for col, dist in analysis_results['distributions'].items()
                if 'skewed' in dist.get('distribution_type', '')
            ]
            if skewed_vars:
                insights.append(f"📊 {len(skewed_vars)} variables show skewed distributions: {', '.join(skewed_vars[:3])}.")
        
        return "\n\n".join(insights) if insights else "Analysis complete. No significant patterns detected."
    
    def recommend_chart_type(self, data_summary: Dict[str, Any]) -> List[Dict[str, str]]:
        """Recommend appropriate chart types based on data characteristics"""
        
        recommendations = []
        
        num_cols = data_summary.get('numeric_columns', 0)
        cat_cols = data_summary.get('categorical_columns', 0)
        total_rows = data_summary.get('total_rows', 0)
        
        # Time series detection
        has_time = any('date' in str(col).lower() or 'time' in str(col).lower() 
                      for col in data_summary.get('column_names', []))
        
        if has_time and num_cols >= 1:
            recommendations.append({
                'type': 'line',
                'reason': 'Time-based data detected - line charts show trends over time effectively',
                'priority': 'high'
            })
        
        if num_cols >= 2:
            recommendations.append({
                'type': 'scatter',
                'reason': 'Multiple numeric variables - scatter plots reveal correlations and clusters',
                'priority': 'high'
            })
        
        if cat_cols >= 1 and num_cols >= 1:
            recommendations.append({
                'type': 'bar',
                'reason': 'Categorical and numeric data - bar charts compare values across categories',
                'priority': 'high'
            })
        
        if num_cols >= 1:
            recommendations.append({
                'type': 'histogram',
                'reason': 'Numeric data - histograms show distribution patterns',
                'priority': 'medium'
            })
        
        if num_cols >= 2:
            recommendations.append({
                'type': 'heatmap',
                'reason': 'Multiple numeric variables - heatmap visualizes correlation matrix',
                'priority': 'medium'
            })
        
        if cat_cols >= 2:
            recommendations.append({
                'type': 'treemap',
                'reason': 'Hierarchical categorical data - treemap shows proportions and hierarchy',
                'priority': 'medium'
            })
        
        return recommendations
    
    def summarize_dataset(self, data_info: Dict[str, Any]) -> str:
        """Generate a concise dataset summary"""
        
        prompt = f"""Summarize this dataset in 2-3 sentences:
- {data_info.get('total_rows', 0)} rows, {data_info.get('total_columns', 0)} columns
- Numeric columns: {data_info.get('numeric_columns', 0)}
- Categorical columns: {data_info.get('categorical_columns', 0)}
- Key variables: {', '.join(data_info.get('column_names', [])[:5])}

Provide a brief, professional summary."""
        
        try:
            response = self.client.text_generation(
                prompt,
                model="microsoft/Phi-3-mini-4k-instruct",
                max_new_tokens=150,
                temperature=0.5
            )
            return response
        except Exception:
            return (
                f"This dataset contains {data_info.get('total_rows', 0):,} records with "
                f"{data_info.get('total_columns', 0)} variables "
                f"({data_info.get('numeric_columns', 0)} numeric, {data_info.get('categorical_columns', 0)} categorical). "
                f"Ready for analysis."
            )
    
    def explain_pattern(self, pattern_type: str, pattern_data: Dict[str, Any]) -> str:
        """Explain a specific pattern in plain language"""
        
        explanations = {
            'correlation': f"A {pattern_data.get('strength', 'strong')} {pattern_data.get('direction', 'positive')} "
                          f"correlation of {pattern_data.get('correlation', 0)} suggests that "
                          f"{pattern_data.get('variable1', 'variable 1')} and {pattern_data.get('variable2', 'variable 2')} "
                          f"tend to move together. This relationship could be useful for predictive modeling.",
            
            'trend': f"The {pattern_data.get('trend', 'increasing')} trend in {pattern_data.get('column', 'this variable')} "
                    f"(R²={pattern_data.get('r_squared', 0)}) indicates a clear directional pattern. "
                    f"This could signal growth, decline, or seasonal behavior worth investigating.",
            
            'outlier': f"Found {pattern_data.get('count', 0)} outliers ({pattern_data.get('percentage', 0)}% of data). "
                      f"These unusual values may represent errors, rare events, or important edge cases requiring attention.",
            
            'cluster': f"Identified {pattern_data.get('n_clusters', 0)} distinct groups in the data. "
                      f"These natural segments could represent different customer types, product categories, or behavioral patterns."
        }
        
        return explanations.get(pattern_type, "Pattern detected in the data.")
