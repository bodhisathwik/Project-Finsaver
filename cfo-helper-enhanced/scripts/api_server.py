"""
CFO Helper - API Server Backend
Simple Flask API server to serve financial data and calculations
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime
from financial_calculator import FinancialCalculator
from data_processor import DataProcessor
from alert_engine import AlertEngine

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize backend components
calc = FinancialCalculator()
processor = DataProcessor()
alert_engine = AlertEngine()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/calculate/runway', methods=['POST'])
def calculate_runway():
    """Calculate cash runway"""
    try:
        data = request.get_json()
        cash_balance = data.get('cash_balance', 0)
        monthly_burn = data.get('monthly_burn', 0)
        
        runway = calc.calculate_runway(cash_balance, monthly_burn)
        
        return jsonify({
            'runway_months': runway,
            'cash_balance': cash_balance,
            'monthly_burn': monthly_burn,
            'calculated_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/calculate/scenario-analysis', methods=['POST'])
def scenario_analysis():
    """Generate scenario analysis"""
    try:
        data = request.get_json()
        base_case = data.get('base_case', {})
        optimistic_mult = data.get('optimistic_multiplier', 1.2)
        pessimistic_mult = data.get('pessimistic_multiplier', 0.8)
        
        scenarios = calc.generate_scenario_analysis(base_case, optimistic_mult, pessimistic_mult)
        
        return jsonify({
            'scenarios': scenarios,
            'calculated_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/budget/analyze', methods=['POST'])
def analyze_budget():
    """Analyze budget variance"""
    try:
        data = request.get_json()
        budget_items = data.get('budget_items', [])
        
        # Convert to BudgetItem objects
        budget_objects = []
        for item in budget_items:
            budget_objects.append(calc.BudgetItem(**item))
        
        analysis = calc.analyze_budget_variance(budget_objects)
        
        return jsonify({
            'analysis': analysis,
            'calculated_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/forecast/cash-flow', methods=['POST'])
def forecast_cash_flow():
    """Forecast cash flow"""
    try:
        data = request.get_json()
        current_balance = data.get('current_balance', 0)
        monthly_inflow = data.get('monthly_inflow', 0)
        monthly_outflow = data.get('monthly_outflow', 0)
        months = data.get('months', 12)
        
        forecast = calc.forecast_cash_flow(current_balance, monthly_inflow, monthly_outflow, months)
        
        return jsonify({
            'forecast': forecast,
            'parameters': {
                'current_balance': current_balance,
                'monthly_inflow': monthly_inflow,
                'monthly_outflow': monthly_outflow,
                'months': months
            },
            'calculated_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/alerts/check', methods=['POST'])
def check_alerts():
    """Check metrics against alert rules"""
    try:
        data = request.get_json()
        current_metrics = data.get('current_metrics', {})
        historical_metrics = data.get('historical_metrics', {})
        
        triggered_events = alert_engine.check_metrics(current_metrics, historical_metrics)
        
        return jsonify({
            'triggered_alerts': [event.__dict__ for event in triggered_events],
            'alert_summary': alert_engine.get_alert_summary(),
            'checked_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/alerts/summary', methods=['GET'])
def get_alert_summary():
    """Get alert system summary"""
    try:
        summary = alert_engine.get_alert_summary()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/alerts/acknowledge/<event_id>', methods=['POST'])
def acknowledge_alert(event_id):
    """Acknowledge an alert"""
    try:
        success = alert_engine.acknowledge_alert(event_id)
        return jsonify({
            'success': success,
            'event_id': event_id,
            'acknowledged_at': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/data/sample', methods=['GET'])
def get_sample_data():
    """Get sample financial data"""
    try:
        sample_data = processor.generate_sample_data()
        return jsonify(sample_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/data/validate', methods=['POST'])
def validate_data():
    """Validate financial data"""
    try:
        data = request.get_json()
        validation_results = processor.validate_financial_data(data)
        return jsonify(validation_results)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/export/report', methods=['POST'])
def export_report():
    """Export comprehensive financial report"""
    try:
        data = request.get_json()
        format_type = data.get('format', 'json')
        
        # Generate comprehensive report
        report_data = calc.export_financial_report()
        
        if format_type == 'json':
            return jsonify(report_data)
        else:
            filename = processor.export_financial_data(report_data, format_type)
            return jsonify({
                'filename': filename,
                'format': format_type,
                'exported_at': datetime.now().isoformat()
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("Starting CFO Helper API Server...")
    print("Available endpoints:")
    print("- GET  /api/health")
    print("- POST /api/calculate/runway")
    print("- POST /api/calculate/scenario-analysis")
    print("- POST /api/budget/analyze")
    print("- POST /api/forecast/cash-flow")
    print("- POST /api/alerts/check")
    print("- GET  /api/alerts/summary")
    print("- POST /api/alerts/acknowledge/<event_id>")
    print("- GET  /api/data/sample")
    print("- POST /api/data/validate")
    print("- POST /api/export/report")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
