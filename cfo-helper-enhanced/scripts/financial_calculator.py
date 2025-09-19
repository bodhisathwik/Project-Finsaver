"""
CFO Helper - Financial Calculator Backend
Handles core financial calculations and metrics for the CFO dashboard
"""

import json
import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class AlertType(Enum):
    WARNING = "warning"
    CRITICAL = "critical"
    INFO = "info"

class TrendDirection(Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

@dataclass
class BudgetItem:
    id: str
    category: str
    budgeted: float
    actual: float
    month: str
    
    @property
    def variance(self) -> float:
        """Calculate variance percentage"""
        if self.budgeted == 0:
            return 0
        return ((self.actual - self.budgeted) / self.budgeted) * 100
    
    @property
    def progress(self) -> float:
        """Calculate progress percentage"""
        if self.budgeted == 0:
            return 0
        return (self.actual / self.budgeted) * 100

@dataclass
class CashFlowItem:
    id: str
    description: str
    amount: float
    category: str
    type: str  # "inflow" or "outflow"
    date: str
    recurring: bool = False
    
    @property
    def adjusted_amount(self) -> float:
        """Return negative amount for outflows"""
        return -abs(self.amount) if self.type == "outflow" else abs(self.amount)

@dataclass
class KPI:
    id: str
    name: str
    value: float
    target: float
    unit: str
    trend: str
    change: float
    
    @property
    def progress_percentage(self) -> float:
        """Calculate progress towards target"""
        if self.target == 0:
            return 0
        return (self.value / self.target) * 100
    
    @property
    def performance_status(self) -> str:
        """Determine performance status"""
        progress = self.progress_percentage
        if progress >= 90:
            return "excellent"
        elif progress >= 70:
            return "good"
        else:
            return "needs_improvement"

@dataclass
class Alert:
    id: str
    title: str
    description: str
    type: str
    threshold: float
    current_value: float
    is_active: bool
    created_at: str
    metric: str
    condition: str  # "below", "above", "equals"
    email_notifications: bool = True
    push_notifications: bool = True
    
    def check_threshold(self) -> bool:
        """Check if alert should be triggered"""
        if self.condition == "below":
            return self.current_value < self.threshold
        elif self.condition == "above":
            return self.current_value > self.threshold
        elif self.condition == "equals":
            return abs(self.current_value - self.threshold) < 0.01
        return False

class FinancialCalculator:
    """Main financial calculator class"""
    
    def __init__(self):
        self.budget_items: List[BudgetItem] = []
        self.cash_flow_items: List[CashFlowItem] = []
        self.kpis: List[KPI] = []
        self.alerts: List[Alert] = []
    
    def calculate_runway(self, cash_balance: float, monthly_burn: float) -> float:
        """Calculate cash runway in months"""
        if monthly_burn <= 0:
            return float('inf')
        return cash_balance / monthly_burn
    
    def calculate_burn_rate(self, cash_flow_items: List[CashFlowItem], months: int = 3) -> float:
        """Calculate average monthly burn rate"""
        total_outflow = sum(
            item.adjusted_amount for item in cash_flow_items 
            if item.type == "outflow"
        )
        return abs(total_outflow) / months if months > 0 else 0
    
    def calculate_mrr(self, revenue_items: List[CashFlowItem]) -> float:
        """Calculate Monthly Recurring Revenue"""
        return sum(
            item.adjusted_amount for item in revenue_items 
            if item.type == "inflow" and item.recurring
        )
    
    def calculate_gross_margin(self, revenue: float, cogs: float) -> float:
        """Calculate gross margin percentage"""
        if revenue == 0:
            return 0
        return ((revenue - cogs) / revenue) * 100
    
    def calculate_cac(self, marketing_spend: float, new_customers: int) -> float:
        """Calculate Customer Acquisition Cost"""
        if new_customers == 0:
            return 0
        return marketing_spend / new_customers
    
    def calculate_burn_multiple(self, net_burn: float, net_new_arr: float) -> float:
        """Calculate burn multiple"""
        if net_new_arr == 0:
            return float('inf')
        return net_burn / net_new_arr
    
    def analyze_budget_variance(self, budget_items: List[BudgetItem]) -> Dict[str, Any]:
        """Analyze budget variance across categories"""
        total_budgeted = sum(item.budgeted for item in budget_items)
        total_actual = sum(item.actual for item in budget_items)
        
        category_analysis = {}
        for item in budget_items:
            if item.category not in category_analysis:
                category_analysis[item.category] = {
                    'budgeted': 0,
                    'actual': 0,
                    'variance': 0,
                    'items': []
                }
            
            cat = category_analysis[item.category]
            cat['budgeted'] += item.budgeted
            cat['actual'] += item.actual
            cat['items'].append(asdict(item))
        
        # Calculate variance for each category
        for category in category_analysis:
            cat = category_analysis[category]
            if cat['budgeted'] > 0:
                cat['variance'] = ((cat['actual'] - cat['budgeted']) / cat['budgeted']) * 100
        
        return {
            'total_budgeted': total_budgeted,
            'total_actual': total_actual,
            'total_variance': ((total_actual - total_budgeted) / total_budgeted * 100) if total_budgeted > 0 else 0,
            'categories': category_analysis
        }
    
    def forecast_cash_flow(self, 
                          current_balance: float, 
                          monthly_inflow: float, 
                          monthly_outflow: float, 
                          months: int = 12) -> List[Dict[str, Any]]:
        """Forecast cash flow for specified months"""
        forecast = []
        balance = current_balance
        
        for month in range(1, months + 1):
            net_flow = monthly_inflow - monthly_outflow
            balance += net_flow
            
            forecast.append({
                'month': month,
                'starting_balance': balance - net_flow,
                'inflow': monthly_inflow,
                'outflow': monthly_outflow,
                'net_flow': net_flow,
                'ending_balance': balance
            })
        
        return forecast
    
    def generate_scenario_analysis(self, 
                                 base_case: Dict[str, float], 
                                 optimistic_multiplier: float = 1.2, 
                                 pessimistic_multiplier: float = 0.8) -> Dict[str, Any]:
        """Generate scenario analysis for financial planning"""
        scenarios = {
            'base_case': base_case,
            'optimistic': {k: v * optimistic_multiplier for k, v in base_case.items()},
            'pessimistic': {k: v * pessimistic_multiplier for k, v in base_case.items()}
        }
        
        # Calculate runway for each scenario
        for scenario_name, scenario_data in scenarios.items():
            if 'cash_balance' in scenario_data and 'monthly_burn' in scenario_data:
                scenarios[scenario_name]['runway_months'] = self.calculate_runway(
                    scenario_data['cash_balance'], 
                    scenario_data['monthly_burn']
                )
        
        return scenarios
    
    def check_all_alerts(self, current_metrics: Dict[str, float]) -> List[Dict[str, Any]]:
        """Check all alerts against current metrics"""
        triggered_alerts = []
        
        for alert in self.alerts:
            if alert.metric in current_metrics:
                alert.current_value = current_metrics[alert.metric]
                
                if alert.check_threshold():
                    triggered_alerts.append({
                        'alert': asdict(alert),
                        'triggered_at': datetime.datetime.now().isoformat(),
                        'severity': alert.type,
                        'message': f"{alert.title}: {alert.description}"
                    })
        
        return triggered_alerts
    
    def export_financial_report(self) -> Dict[str, Any]:
        """Export comprehensive financial report"""
        return {
            'generated_at': datetime.datetime.now().isoformat(),
            'budget_analysis': self.analyze_budget_variance(self.budget_items),
            'kpi_summary': [asdict(kpi) for kpi in self.kpis],
            'cash_flow_summary': {
                'total_inflow': sum(item.adjusted_amount for item in self.cash_flow_items if item.type == "inflow"),
                'total_outflow': sum(abs(item.adjusted_amount) for item in self.cash_flow_items if item.type == "outflow"),
                'net_flow': sum(item.adjusted_amount for item in self.cash_flow_items)
            },
            'active_alerts': len([alert for alert in self.alerts if alert.is_active])
        }

# Example usage and testing
if __name__ == "__main__":
    calc = FinancialCalculator()
    
    # Test runway calculation
    runway = calc.calculate_runway(500000, 50000)
    print(f"Cash runway: {runway:.1f} months")
    
    # Test scenario analysis
    base_case = {
        'cash_balance': 500000,
        'monthly_burn': 50000,
        'monthly_revenue': 80000
    }
    
    scenarios = calc.generate_scenario_analysis(base_case)
    print(f"Scenario analysis: {json.dumps(scenarios, indent=2)}")
    
    print("Financial calculator backend initialized successfully!")
