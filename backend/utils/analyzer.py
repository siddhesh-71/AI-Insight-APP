import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.linear_model import LinearRegression
from scipy import stats
from typing import Dict, List, Any, Tuple
import json


class DataAnalyzer:
    """Advanced data analysis utilities for pattern recognition and statistical analysis"""
    
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_cols = data.select_dtypes(include=['object', 'category']).columns.tolist()
        
    def detect_outliers(self, method='iqr', threshold=1.5) -> Dict[str, Any]:
        """Detect outliers using IQR or Z-score method"""
        outliers = {}
        
        for col in self.numeric_cols:
            if method == 'iqr':
                Q1 = self.data[col].quantile(0.25)
                Q3 = self.data[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - threshold * IQR
                upper_bound = Q3 + threshold * IQR
                col_outliers = self.data[(self.data[col] < lower_bound) | (self.data[col] > upper_bound)]
            else:  # z-score
                col_data = self.data[col].dropna()
                z_scores = np.abs(stats.zscore(col_data.values))  # pyright: ignore[reportCallIssue, reportArgumentType]
                col_outliers = self.data.loc[col_data.index][z_scores > threshold]
            
            if len(col_outliers) > 0:
                outliers[col] = {
                    'count': len(col_outliers),
                    'percentage': round(len(col_outliers) / len(self.data) * 100, 2),
                    'values': col_outliers[col].tolist()[:10]  # First 10 outliers
                }
        
        return outliers
    
    def detect_correlations(self, threshold=0.5) -> List[Dict[str, Any]]:
        """Find strong correlations between numeric variables"""
        if len(self.numeric_cols) < 2:
            return []
        
        corr_matrix = self.data[self.numeric_cols].corr(method='pearson')  # pyright: ignore[reportCallIssue]
        strong_corrs = []
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i + 1, len(corr_matrix.columns)):
                corr_value = corr_matrix.iloc[i, j]
                if abs(corr_value) >= threshold:
                    strong_corrs.append({
                        'variable1': corr_matrix.columns[i],
                        'variable2': corr_matrix.columns[j],
                        'correlation': round(corr_value, 3),
                        'strength': 'strong' if abs(corr_value) > 0.7 else 'moderate',
                        'direction': 'positive' if corr_value > 0 else 'negative'
                    })
        
        return sorted(strong_corrs, key=lambda x: abs(x['correlation']), reverse=True)
    
    def detect_trends(self) -> List[Dict[str, Any]]:
        """Detect linear trends in numeric data"""
        trends = []
        
        if len(self.data) < 3:
            return trends
        
        X = np.arange(len(self.data)).reshape(-1, 1)
        
        for col in self.numeric_cols:
            y = self.data[col].dropna().values
            if len(y) < 3:
                continue
            
            X_valid = X[:len(y)]
            model = LinearRegression()
            model.fit(X_valid, y)
            
            slope = model.coef_[0]
            r_squared = model.score(X_valid, y)
            
            if r_squared > 0.5:  # Only report significant trends
                trend_type = 'increasing' if slope > 0 else 'decreasing'
                trends.append({
                    'column': col,
                    'trend': trend_type,
                    'slope': round(slope, 4),
                    'r_squared': round(r_squared, 3),
                    'strength': 'strong' if r_squared > 0.7 else 'moderate'
                })
        
        return sorted(trends, key=lambda x: x['r_squared'], reverse=True)
    
    def perform_clustering(self, n_clusters=3, method='kmeans') -> Dict[str, Any]:
        """Perform clustering analysis on numeric data"""
        if len(self.numeric_cols) < 2 or len(self.data) < n_clusters:
            return {'error': 'Insufficient data for clustering'}
        
        # Prepare data
        X = self.data[self.numeric_cols].dropna()
        if len(X) < n_clusters:
            return {'error': 'Insufficient data for clustering'}
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Apply clustering
        if method == 'kmeans':
            clusterer = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
        else:  # dbscan
            clusterer = DBSCAN(eps=0.5, min_samples=5)
        
        labels = clusterer.fit_predict(X_scaled)
        
        # Get cluster statistics
        cluster_stats = []
        unique_labels = np.unique(labels)
        
        for label in unique_labels:
            cluster_mask = labels == label
            cluster_size = np.sum(cluster_mask)
            cluster_data = X[cluster_mask]
            
            stats_dict = {
                'cluster_id': int(label),
                'size': int(cluster_size),
                'percentage': round(cluster_size / len(X) * 100, 2)
            }
            
            # Add mean values for each feature
            for col in self.numeric_cols:
                if col in X.columns:
                    stats_dict[f'{col}_mean'] = round(cluster_data[col].mean(), 2)
            
            cluster_stats.append(stats_dict)
        
        return {
            'method': method,
            'n_clusters': len(unique_labels),
            'cluster_stats': cluster_stats,
            'labels': labels.tolist()
        }
    
    def detect_anomalies(self, contamination=0.1) -> Dict[str, Any]:
        """Detect anomalies using statistical methods"""
        from sklearn.ensemble import IsolationForest
        
        if len(self.numeric_cols) < 1 or len(self.data) < 10:
            return {'error': 'Insufficient data for anomaly detection'}
        
        X = self.data[self.numeric_cols].dropna()
        if len(X) < 10:
            return {'error': 'Insufficient data for anomaly detection'}
        
        iso_forest = IsolationForest(contamination='auto' if contamination is None else contamination, random_state=42)  # pyright: ignore[reportArgumentType]
        predictions = iso_forest.fit_predict(X)
        
        anomaly_indices = np.where(predictions == -1)[0]
        
        return {
            'total_anomalies': len(anomaly_indices),
            'percentage': round(len(anomaly_indices) / len(X) * 100, 2),
            'anomaly_scores': iso_forest.score_samples(X).tolist(),
            'anomaly_indices': anomaly_indices.tolist()[:20]  # First 20
        }
    
    def get_distribution_analysis(self) -> Dict[str, Any]:
        """Analyze distributions of numeric variables"""
        distributions = {}
        
        for col in self.numeric_cols:
            data = self.data[col].dropna()
            if len(data) < 3:
                continue
            
            # Test for normality
            _, p_value = stats.normaltest(data) if len(data) >= 8 else (0, 1)
            
            # Skewness and kurtosis
            skewness = stats.skew(data)
            kurtosis = stats.kurtosis(data)
            
            distributions[col] = {
                'mean': round(data.mean(), 2),
                'median': round(data.median(), 2),
                'std': round(data.std(), 2),
                'skewness': round(skewness, 3),
                'kurtosis': round(kurtosis, 3),
                'is_normal': p_value > 0.05,
                'distribution_type': self._classify_distribution(skewness, kurtosis)
            }
        
        return distributions
    
    def _classify_distribution(self, skewness, kurtosis) -> str:
        """Classify distribution based on skewness and kurtosis"""
        if abs(skewness) < 0.5 and abs(kurtosis) < 0.5:
            return 'normal'
        elif skewness > 0.5:
            return 'right_skewed'
        elif skewness < -0.5:
            return 'left_skewed'
        elif kurtosis > 0.5:
            return 'heavy_tailed'
        else:
            return 'light_tailed'
    
    def get_categorical_insights(self) -> Dict[str, Any]:
        """Analyze categorical variables"""
        insights = {}
        
        for col in self.categorical_cols:
            value_counts = self.data[col].value_counts()
            
            insights[col] = {
                'unique_values': len(value_counts),
                'most_common': value_counts.head(5).to_dict(),
                'mode': value_counts.index[0],
                'mode_frequency': int(value_counts.iloc[0]),
                'mode_percentage': round(value_counts.iloc[0] / len(self.data) * 100, 2)
            }
        
        return insights
    
    def get_comprehensive_insights(self) -> Dict[str, Any]:
        """Get all insights in one call"""
        insights = {
            'basic_stats': {
                'total_rows': len(self.data),
                'total_columns': len(self.data.columns),
                'numeric_columns': len(self.numeric_cols),
                'categorical_columns': len(self.categorical_cols),
                'missing_values': self.data.isnull().sum().to_dict()
            },
            'outliers': self.detect_outliers(),
            'correlations': self.detect_correlations(),
            'trends': self.detect_trends(),
            'distributions': self.get_distribution_analysis(),
            'categorical_insights': self.get_categorical_insights(),
            'anomalies': self.detect_anomalies()
        }
        
        return insights
