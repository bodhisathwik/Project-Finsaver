"""
CFO Helper - Alert Engine Backend
Handles intelligent alert monitoring and notification system
"""

import json
import smtplib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from dataclasses import dataclass, asdict
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AlertRule:
    id: str
    name: str
    metric: str
    condition: str  # "below", "above", "equals", "change_percent"
    threshold: float
    severity: str  # "low", "medium", "high", "critical"
    enabled: bool = True
    email_enabled: bool = True
    push_enabled: bool = True
    cooldown_minutes: int = 60  # Minimum time between alerts
    last_triggered: Optional[str] = None

@dataclass
class AlertEvent:
    id: str
    rule_id: str
    triggered_at: str
    metric_value: float
    threshold_value: float
    severity: str
    message: str
    acknowledged: bool = False
    resolved: bool = False

class AlertEngine:
    """Intelligent alert monitoring and notification system"""
    
    def __init__(self):
        self.rules: List[AlertRule] = []
        self.events: List[AlertEvent] = []
        self.notification_handlers: Dict[str, Callable] = {}
        self._setup_default_rules()
    
    def _setup_default_rules(self):
        """Setup default CFO alert rules"""
        default_rules = [
            AlertRule(
                id="runway_critical",
                name="Cash Runway Critical",
                metric="cash_runway_months",
                condition="below",
                threshold=3.0,
                severity="critical",
                cooldown_minutes=30
            ),
            AlertRule(
                id="runway_warning",
                name="Cash Runway Warning",
                metric="cash_runway_months",
                condition="below",
                threshold=6.0,
                severity="high",
                cooldown_minutes=60
            ),
            AlertRule(
                id="burn_rate_high",
                name="High Burn Rate",
                metric="monthly_burn_rate",
                condition="above",
                threshold=100000,
                severity="medium",
                cooldown_minutes=120
            ),
            AlertRule(
                id="revenue_decline",
                name="Revenue Decline",
                metric="monthly_revenue",
                condition="change_percent",
                threshold=-10.0,  # 10% decline
                severity="high",
                cooldown_minutes=60
            ),
            AlertRule(
                id="cash_balance_low",
                name="Low Cash Balance",
                metric="cash_balance",
                condition="below",
                threshold=250000,
                severity="high",
                cooldown_minutes=120
            ),
            AlertRule(
                id="budget_overspend",
                name="Budget Overspend",
                metric="budget_variance_percent",
                condition="above",
                threshold=15.0,
                severity="medium",
                cooldown_minutes=180
            ),
            AlertRule(
                id="cac_high",
                name="High Customer Acquisition Cost",
                metric="customer_acquisition_cost",
                condition="above",
                threshold=200,
                severity="medium",
                cooldown_minutes=240
            ),
            AlertRule(
                id="gross_margin_low",
                name="Low Gross Margin",
                metric="gross_margin_percent",
                condition="below",
                threshold=60.0,
                severity="medium",
                cooldown_minutes=180
            )
        ]
        
        self.rules.extend(default_rules)
    
    def add_rule(self, rule: AlertRule) -> bool:
        """Add a new alert rule"""
        try:
            # Check if rule with same ID already exists
            existing_rule = next((r for r in self.rules if r.id == rule.id), None)
            if existing_rule:
                logger.warning(f"Rule with ID {rule.id} already exists. Updating...")
                self.rules.remove(existing_rule)
            
            self.rules.append(rule)
            logger.info(f"Added alert rule: {rule.name}")
            return True
        except Exception as e:
            logger.error(f"Error adding rule: {e}")
            return False
    
    def remove_rule(self, rule_id: str) -> bool:
        """Remove an alert rule"""
        try:
            rule = next((r for r in self.rules if r.id == rule_id), None)
            if rule:
                self.rules.remove(rule)
                logger.info(f"Removed alert rule: {rule.name}")
                return True
            else:
                logger.warning(f"Rule with ID {rule_id} not found")
                return False
        except Exception as e:
            logger.error(f"Error removing rule: {e}")
            return False
    
    def check_metrics(self, current_metrics: Dict[str, float], historical_metrics: Optional[Dict[str, List[float]]] = None) -> List[AlertEvent]:
        """Check all metrics against alert rules"""
        triggered_events = []
        current_time = datetime.now()
        
        for rule in self.rules:
            if not rule.enabled:
                continue
            
            # Check cooldown period
            if rule.last_triggered:
                last_trigger_time = datetime.fromisoformat(rule.last_triggered)
                if (current_time - last_trigger_time).total_seconds() < (rule.cooldown_minutes * 60):
                    continue
            
            # Get current metric value
            if rule.metric not in current_metrics:
                continue
            
            current_value = current_metrics[rule.metric]
            should_trigger = False
            
            # Check condition
            if rule.condition == "below":
                should_trigger = current_value < rule.threshold
            elif rule.condition == "above":
                should_trigger = current_value > rule.threshold
            elif rule.condition == "equals":
                should_trigger = abs(current_value - rule.threshold) < 0.01
            elif rule.condition == "change_percent" and historical_metrics:
                # Check percentage change from previous period
                if rule.metric in historical_metrics and len(historical_metrics[rule.metric]) > 0:
                    previous_value = historical_metrics[rule.metric][-1]
                    if previous_value != 0:
                        change_percent = ((current_value - previous_value) / previous_value) * 100
                        should_trigger = change_percent <= rule.threshold  # Negative threshold for decline
            
            if should_trigger:
                event = self._create_alert_event(rule, current_value)
                triggered_events.append(event)
                
                # Update last triggered time
                rule.last_triggered = current_time.isoformat()
                
                # Send notifications
                self._send_notifications(event, rule)
        
        self.events.extend(triggered_events)
        return triggered_events
    
    def _create_alert_event(self, rule: AlertRule, current_value: float) -> AlertEvent:
        """Create an alert event"""
        event_id = f"{rule.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Generate appropriate message
        if rule.condition == "below":
            message = f"{rule.name}: {rule.metric} is {current_value:.2f}, below threshold of {rule.threshold:.2f}"
        elif rule.condition == "above":
            message = f"{rule.name}: {rule.metric} is {current_value:.2f}, above threshold of {rule.threshold:.2f}"
        elif rule.condition == "change_percent":
            message = f"{rule.name}: {rule.metric} changed by {rule.threshold:.1f}% to {current_value:.2f}"
        else:
            message = f"{rule.name}: {rule.metric} triggered with value {current_value:.2f}"
        
        return AlertEvent(
            id=event_id,
            rule_id=rule.id,
            triggered_at=datetime.now().isoformat(),
            metric_value=current_value,
            threshold_value=rule.threshold,
            severity=rule.severity,
            message=message
        )
    
    def _send_notifications(self, event: AlertEvent, rule: AlertRule):
        """Send notifications for triggered alert"""
        try:
            # Email notification
            if rule.email_enabled and "email" in self.notification_handlers:
                self.notification_handlers["email"](event, rule)
            
            # Push notification
            if rule.push_enabled and "push" in self.notification_handlers:
                self.notification_handlers["push"](event, rule)
            
            # Log notification
            logger.info(f"Alert triggered: {event.message}")
            
        except Exception as e:
            logger.error(f"Error sending notifications: {e}")
    
    def register_notification_handler(self, notification_type: str, handler: Callable):
        """Register a notification handler"""
        self.notification_handlers[notification_type] = handler
        logger.info(f"Registered {notification_type} notification handler")
    
    def get_active_alerts(self) -> List[AlertEvent]:
        """Get all active (unresolved) alerts"""
        return [event for event in self.events if not event.resolved]
    
    def acknowledge_alert(self, event_id: str) -> bool:
        """Acknowledge an alert"""
        try:
            event = next((e for e in self.events if e.id == event_id), None)
            if event:
                event.acknowledged = True
                logger.info(f"Alert acknowledged: {event_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error acknowledging alert: {e}")
            return False
    
    def resolve_alert(self, event_id: str) -> bool:
        """Resolve an alert"""
        try:
            event = next((e for e in self.events if e.id == event_id), None)
            if event:
                event.resolved = True
                event.acknowledged = True
                logger.info(f"Alert resolved: {event_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error resolving alert: {e}")
            return False
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get summary of alert system status"""
        active_events = self.get_active_alerts()
        
        severity_counts = {
            "critical": len([e for e in active_events if e.severity == "critical"]),
            "high": len([e for e in active_events if e.severity == "high"]),
            "medium": len([e for e in active_events if e.severity == "medium"]),
            "low": len([e for e in active_events if e.severity == "low"])
        }
        
        return {
            "total_rules": len(self.rules),
            "enabled_rules": len([r for r in self.rules if r.enabled]),
            "total_events": len(self.events),
            "active_events": len(active_events),
            "acknowledged_events": len([e for e in self.events if e.acknowledged and not e.resolved]),
            "resolved_events": len([e for e in self.events if e.resolved]),
            "severity_breakdown": severity_counts,
            "last_check": datetime.now().isoformat()
        }
    
    def export_alert_data(self) -> Dict[str, Any]:
        """Export all alert data"""
        return {
            "rules": [asdict(rule) for rule in self.rules],
            "events": [asdict(event) for event in self.events],
            "summary": self.get_alert_summary(),
            "exported_at": datetime.now().isoformat()
        }

# Example notification handlers
def email_notification_handler(event: AlertEvent, rule: AlertRule):
    """Example email notification handler"""
    # This would integrate with actual email service
    logger.info(f"EMAIL ALERT: {event.message}")
    # In production, you would send actual email here

def push_notification_handler(event: AlertEvent, rule: AlertRule):
    """Example push notification handler"""
    # This would integrate with push notification service
    logger.info(f"PUSH ALERT: {event.message}")
    # In production, you would send push notification here

# Example usage
if __name__ == "__main__":
    # Initialize alert engine
    alert_engine = AlertEngine()
    
    # Register notification handlers
    alert_engine.register_notification_handler("email", email_notification_handler)
    alert_engine.register_notification_handler("push", push_notification_handler)
    
    # Example metrics
    current_metrics = {
        "cash_runway_months": 2.5,  # Will trigger critical alert
        "monthly_burn_rate": 120000,  # Will trigger high burn rate alert
        "cash_balance": 200000,  # Will trigger low cash balance alert
        "budget_variance_percent": 18.0,  # Will trigger budget overspend alert
        "monthly_revenue": 75000,
        "customer_acquisition_cost": 150,
        "gross_margin_percent": 68.5
    }
    
    # Check metrics and trigger alerts
    triggered_events = alert_engine.check_metrics(current_metrics)
    
    print(f"Triggered {len(triggered_events)} alerts:")
    for event in triggered_events:
        print(f"- {event.severity.upper()}: {event.message}")
    
    # Get alert summary
    summary = alert_engine.get_alert_summary()
    print(f"\nAlert Summary: {json.dumps(summary, indent=2)}")
    
    print("Alert engine backend initialized successfully!")
