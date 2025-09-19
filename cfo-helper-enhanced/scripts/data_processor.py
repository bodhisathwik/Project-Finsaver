"""
CFO Helper - Data Processing Backend
Handles data import, export, and transformation for financial data
"""

import json
import csv
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import numpy as np

class DataProcessor:
    """Data processing utilities for CFO dashboard"""
    
    def __init__(self):
        self.supported_formats = ['csv', 'json', 'excel']
    
    def import_budget_data(self, file_path: str, format_type: str = 'csv') -> List[Dict[str, Any]]:
        """Import budget data from various formats"""
        if format_type == 'csv':
            return self._import_csv_budget(file_path)
        elif format_type == 'json':
            return self._import_json_budget(file_path)
        elif format_type == 'excel':
            return self._import_excel_budget(file_path)
        else:
            raise ValueError(f"Unsupported format: {format_type}")
    
    def _import_csv_budget(self, file_path: str) -> List[Dict[str, Any]]:
        """Import budget data from CSV"""
        budget_data = []
        try:
            df = pd.read_csv(file_path)
            for _, row in df.iterrows():
                budget_data.append({
                    'id': str(row.get('id', len(budget_data) + 1)),
                    'category': row.get('category', 'Other'),
                    'budgeted': float(row.get('budgeted', 0)),
                    'actual': float(row.get('actual', 0)),
                    'month': row.get('month', datetime.now().strftime('%Y-%m'))
                })
        except Exception as e:
            print(f"Error importing CSV budget data: {e}")
        
        return budget_data
    
    def _import_json_budget(self, file_path: str) -> List[Dict[str, Any]]:
        """Import budget data from JSON"""
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error importing JSON budget data: {e}")
            return []
    
    def _import_excel_budget(self, file_path: str) -> List[Dict[str, Any]]:
        """Import budget data from Excel"""
        budget_data = []
        try:
            df = pd.read_excel(file_path)
            for _, row in df.iterrows():
                budget_data.append({
                    'id': str(row.get('id', len(budget_data) + 1)),
                    'category': row.get('category', 'Other'),
                    'budgeted': float(row.get('budgeted', 0)),
                    'actual': float(row.get('actual', 0)),
                    'month': row.get('month', datetime.now().strftime('%Y-%m'))
                })
        except Exception as e:
            print(f"Error importing Excel budget data: {e}")
        
        return budget_data
    
    def export_financial_data(self, data: Dict[str, Any], format_type: str = 'json') -> str:
        """Export financial data to various formats"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if format_type == 'json':
            filename = f"financial_report_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2, default=str)
        
        elif format_type == 'csv':
            filename = f"financial_report_{timestamp}.csv"
            # Flatten the data for CSV export
            flattened_data = self._flatten_dict(data)
            df = pd.DataFrame([flattened_data])
            df.to_csv(filename, index=False)
        
        elif format_type == 'excel':
            filename = f"financial_report_{timestamp}.xlsx"
            with pd.ExcelWriter(filename) as writer:
                # Create separate sheets for different data types
                if 'budget_analysis' in data:
                    budget_df = pd.DataFrame(data['budget_analysis'].get('categories', {})).T
                    budget_df.to_excel(writer, sheet_name='Budget Analysis')
                
                if 'kpi_summary' in data:
                    kpi_df = pd.DataFrame(data['kpi_summary'])
                    kpi_df.to_excel(writer, sheet_name='KPI Summary', index=False)
        
        return filename
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
        """Flatten nested dictionary for CSV export"""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)
    
    def generate_sample_data(self) -> Dict[str, List[Dict[str, Any]]]:
        """Generate sample financial data for testing"""
        # Sample budget data
        budget_data = [
            {'id': '1', 'category': 'Personnel', 'budgeted': 50000, 'actual': 52000, 'month': '2025-01'},
            {'id': '2', 'category': 'Marketing', 'budgeted': 15000, 'actual': 12000, 'month': '2025-01'},
            {'id': '3', 'category': 'Operations', 'budgeted': 8000, 'actual': 8500, 'month': '2025-01'},
            {'id': '4', 'category': 'R&D', 'budgeted': 20000, 'actual': 18000, 'month': '2025-01'},
        ]
        
        # Sample cash flow data
        cash_flow_data = [
            {'id': '1', 'description': 'Monthly Subscriptions', 'amount': 75000, 'category': 'Revenue', 'type': 'inflow', 'date': '2025-01-01', 'recurring': True},
            {'id': '2', 'description': 'Salaries', 'amount': 50000, 'category': 'Personnel', 'type': 'outflow', 'date': '2025-01-01', 'recurring': True},
            {'id': '3', 'description': 'Office Rent', 'amount': 5000, 'category': 'Operations', 'type': 'outflow', 'date': '2025-01-01', 'recurring': True},
            {'id': '4', 'description': 'Marketing Campaign', 'amount': 12000, 'category': 'Marketing', 'type': 'outflow', 'date': '2025-01-15', 'recurring': False},
        ]
        
        # Sample KPI data
        kpi_data = [
            {'id': '1', 'name': 'Monthly Recurring Revenue', 'value': 75000, 'target': 80000, 'unit': '$', 'trend': 'up', 'change': 5.2},
            {'id': '2', 'name': 'Customer Acquisition Cost', 'value': 150, 'target': 120, 'unit': '$', 'trend': 'down', 'change': -8.1},
            {'id': '3', 'name': 'Gross Margin', 'value': 68.5, 'target': 70, 'unit': '%', 'trend': 'stable', 'change': 0.3},
            {'id': '4', 'name': 'Cash Runway', 'value': 14.2, 'target': 18, 'unit': 'months', 'trend': 'down', 'change': -2.1},
        ]
        
        return {
            'budget_data': budget_data,
            'cash_flow_data': cash_flow_data,
            'kpi_data': kpi_data
        }
    
    def calculate_trends(self, historical_data: List[Dict[str, Any]], value_field: str = 'value') -> Dict[str, Any]:
        """Calculate trends from historical data"""
        if len(historical_data) < 2:
            return {'trend': 'stable', 'change': 0, 'direction': 'none'}
        
        values = [float(item[value_field]) for item in historical_data if value_field in item]
        
        if len(values) < 2:
            return {'trend': 'stable', 'change': 0, 'direction': 'none'}
        
        # Calculate percentage change
        latest = values[-1]
        previous = values[-2]
        
        if previous == 0:
            change = 0
        else:
            change = ((latest - previous) / previous) * 100
        
        # Determine trend
        if abs(change) < 1:
            trend = 'stable'
            direction = 'none'
        elif change > 0:
            trend = 'up'
            direction = 'increasing'
        else:
            trend = 'down'
            direction = 'decreasing'
        
        return {
            'trend': trend,
            'change': round(change, 2),
            'direction': direction,
            'latest_value': latest,
            'previous_value': previous
        }
    
    def validate_financial_data(self, data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Validate financial data for consistency and completeness"""
        errors = []
        warnings = []
        
        # Validate budget data
        if 'budget_data' in data:
            for item in data['budget_data']:
                if not item.get('category'):
                    errors.append(f"Budget item {item.get('id', 'unknown')} missing category")
                if item.get('budgeted', 0) < 0:
                    warnings.append(f"Budget item {item.get('id', 'unknown')} has negative budgeted amount")
        
        # Validate cash flow data
        if 'cash_flow_data' in data:
            for item in data['cash_flow_data']:
                if not item.get('type') in ['inflow', 'outflow']:
                    errors.append(f"Cash flow item {item.get('id', 'unknown')} has invalid type")
                if item.get('amount', 0) <= 0:
                    warnings.append(f"Cash flow item {item.get('id', 'unknown')} has zero or negative amount")
        
        # Validate KPI data
        if 'kpi_data' in data:
            for item in data['kpi_data']:
                if not item.get('name'):
                    errors.append(f"KPI item {item.get('id', 'unknown')} missing name")
                if item.get('target', 0) <= 0:
                    warnings.append(f"KPI item {item.get('id', 'unknown')} has zero or negative target")
        
        return {'errors': errors, 'warnings': warnings}

# Example usage
if __name__ == "__main__":
    processor = DataProcessor()
    
    # Generate sample data
    sample_data = processor.generate_sample_data()
    print("Generated sample data:")
    print(json.dumps(sample_data, indent=2))
    
    # Validate the data
    validation_results = processor.validate_financial_data(sample_data)
    print(f"\nValidation results: {validation_results}")
    
    # Export sample data
    export_filename = processor.export_financial_data(sample_data, 'json')
    print(f"\nExported data to: {export_filename}")
    
    print("Data processor backend initialized successfully!")
