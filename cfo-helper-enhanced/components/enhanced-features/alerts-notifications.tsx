"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Settings,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
} from "lucide-react"

interface Alert {
  id: string
  title: string
  description: string
  type: "warning" | "critical" | "info"
  threshold: number
  currentValue: number
  isActive: boolean
  createdAt: string
  metric: "runway" | "burn_rate" | "revenue" | "cash_balance" | "expenses"
  condition: "below" | "above" | "equals"
  emailNotifications: boolean
  pushNotifications: boolean
}

interface ThresholdTemplate {
  name: string
  description: string
  metric: "runway" | "burn_rate" | "revenue" | "cash_balance" | "expenses"
  threshold: number
  condition: "below" | "above" | "equals"
  type: "warning" | "critical" | "info"
}

export function AlertsNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      title: "Critical Cash Runway",
      description: "Cash runway below 3 months - immediate action required",
      type: "critical",
      threshold: 3,
      currentValue: 2.1,
      isActive: true,
      createdAt: "2024-01-15",
      metric: "runway",
      condition: "below",
      emailNotifications: true,
      pushNotifications: true,
    },
    {
      id: "2",
      title: "High Burn Rate Alert",
      description: "Monthly burn rate exceeds $50K threshold",
      type: "warning",
      threshold: 50000,
      currentValue: 62000,
      isActive: true,
      createdAt: "2024-01-14",
      metric: "burn_rate",
      condition: "above",
      emailNotifications: true,
      pushNotifications: false,
    },
    {
      id: "3",
      title: "Revenue Milestone",
      description: "Celebrate when monthly revenue exceeds $100K target",
      type: "info",
      threshold: 100000,
      currentValue: 125000,
      isActive: false,
      createdAt: "2024-01-10",
      metric: "revenue",
      condition: "above",
      emailNotifications: false,
      pushNotifications: true,
    },
  ])

  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    type: "warning" as "warning" | "critical" | "info",
    threshold: "",
    metric: "runway" as "runway" | "burn_rate" | "revenue" | "cash_balance" | "expenses",
    condition: "below" as "below" | "above" | "equals",
    emailNotifications: true,
    pushNotifications: false,
  })

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  const thresholdTemplates: ThresholdTemplate[] = [
    {
      name: "Critical Runway Alert",
      description: "Alert when cash runway drops below 3 months",
      metric: "runway",
      threshold: 3,
      condition: "below",
      type: "critical",
    },
    {
      name: "Low Runway Warning",
      description: "Warning when cash runway drops below 6 months",
      metric: "runway",
      threshold: 6,
      condition: "below",
      type: "warning",
    },
    {
      name: "High Burn Rate",
      description: "Alert when monthly burn exceeds $50K",
      metric: "burn_rate",
      threshold: 50000,
      condition: "above",
      type: "warning",
    },
    {
      name: "Revenue Target",
      description: "Celebrate when monthly revenue exceeds $100K target",
      metric: "revenue",
      threshold: 100000,
      condition: "above",
      type: "info",
    },
    {
      name: "Low Cash Balance",
      description: "Critical alert when cash balance drops below $25K",
      metric: "cash_balance",
      threshold: 25000,
      condition: "below",
      type: "critical",
    },
  ]

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) => {
          const variation = (Math.random() - 0.5) * 0.1
          const newValue = alert.currentValue * (1 + variation)

          const thresholdCrossed =
            (alert.condition === "below" && newValue < alert.threshold && alert.currentValue >= alert.threshold) ||
            (alert.condition === "above" && newValue > alert.threshold && alert.currentValue <= alert.threshold)

          if (thresholdCrossed && !alert.isActive) {
            if (alert.pushNotifications) {
              showNotification(alert.title, alert.description)
            }
            return { ...alert, currentValue: newValue, isActive: true }
          }

          return { ...alert, currentValue: newValue }
        }),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const showNotification = (title: string, description: string) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        const notification = new Notification(`CFO Alert: ${title}`, {
          body: description,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "cfo-alert",
          requireInteraction: true,
          actions: [
            { action: "view", title: "View Dashboard" },
            { action: "dismiss", title: "Dismiss" },
          ],
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        setTimeout(() => {
          notification.close()
        }, 10000)
      } else if (Notification.permission === "default") {
        requestNotificationPermission()
      }
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)

        if (permission === "granted") {
          new Notification("CFO Helper Notifications Enabled", {
            body: "You'll now receive alerts when your financial metrics cross thresholds",
            icon: "/favicon.ico",
            tag: "permission-granted",
          })
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error)
      }
    }
  }

  useEffect(() => {
    if (notificationPermission === "default") {
      const timer = setTimeout(() => {
        requestNotificationPermission()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [notificationPermission])

  const applyTemplate = (template: ThresholdTemplate) => {
    setNewAlert({
      title: template.name,
      description: template.description,
      type: template.type,
      threshold: template.threshold.toString(),
      metric: template.metric,
      condition: template.condition,
      emailNotifications: true,
      pushNotifications: false,
    })
  }

  const addAlert = () => {
    if (newAlert.title && newAlert.description && newAlert.threshold) {
      const alert: Alert = {
        id: Date.now().toString(),
        title: newAlert.title,
        description: newAlert.description,
        type: newAlert.type,
        threshold: Number.parseFloat(newAlert.threshold),
        currentValue: 0,
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
        metric: newAlert.metric,
        condition: newAlert.condition,
        emailNotifications: newAlert.emailNotifications,
        pushNotifications: newAlert.pushNotifications,
      }
      setAlerts([...alerts, alert])
      setNewAlert({
        title: "",
        description: "",
        type: "warning",
        threshold: "",
        metric: "runway",
        condition: "below",
        emailNotifications: true,
        pushNotifications: false,
      })
    }
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, isActive: false } : alert)))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
      case "warning":
        return <Bell className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
      default:
        return "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
    }
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "runway":
        return <Calendar className="w-4 h-4" />
      case "burn_rate":
        return <TrendingDown className="w-4 h-4" />
      case "revenue":
        return <Target className="w-4 h-4" />
      case "cash_balance":
        return <DollarSign className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const formatValue = (value: number, metric: string) => {
    if (metric === "runway") {
      return `${value.toFixed(1)} months`
    }
    if (metric === "burn_rate" || metric === "revenue" || metric === "cash_balance") {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  const activeAlerts = alerts.filter((alert) => alert.isActive)
  const criticalAlerts = activeAlerts.filter((alert) => alert.type === "critical")

  const getNotificationStatusColor = () => {
    switch (notificationPermission) {
      case "granted":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "denied":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }
  }

  const getNotificationStatusText = () => {
    switch (notificationPermission) {
      case "granted":
        return "Notifications Enabled ✓"
      case "denied":
        return "Notifications Blocked"
      default:
        return "Enable Notifications"
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          🚨 Smart Alerts & Notifications
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2 bg-red-600 text-white">
              {activeAlerts.length}
            </Badge>
          )}
          {criticalAlerts.length > 0 && (
            <Badge className="ml-1 bg-red-700 text-white animate-pulse">{criticalAlerts.length} Critical</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Set intelligent thresholds and get notified when key metrics cross limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getNotificationStatusColor()}`}>
          <div className="flex items-center gap-2">
            <Bell
              className={`w-4 h-4 ${
                notificationPermission === "granted"
                  ? "text-green-600 dark:text-green-400"
                  : notificationPermission === "denied"
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                notificationPermission === "granted"
                  ? "text-green-900 dark:text-green-100"
                  : notificationPermission === "denied"
                    ? "text-red-900 dark:text-red-100"
                    : "text-blue-900 dark:text-blue-100"
              }`}
            >
              {getNotificationStatusText()}
            </span>
            {notificationPermission === "denied" && (
              <span className="text-xs text-red-700 dark:text-red-300">(Check browser settings to re-enable)</span>
            )}
          </div>
          {notificationPermission !== "granted" && (
            <Button
              onClick={requestNotificationPermission}
              size="sm"
              variant="outline"
              className={`${
                notificationPermission === "denied"
                  ? "border-red-300 dark:border-red-600 text-red-700 dark:text-red-300"
                  : "border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
              } bg-transparent`}
              disabled={notificationPermission === "denied"}
            >
              {notificationPermission === "denied" ? "Blocked" : "Enable"}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Quick Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {thresholdTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(template)}
                className="justify-start text-left h-auto p-3 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div>
                  <div className="font-medium text-xs text-slate-900 dark:text-white">{template.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Create Custom Alert</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Alert title"
              value={newAlert.title}
              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
            <Input
              placeholder="Description"
              value={newAlert.description}
              onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              value={newAlert.metric}
              onValueChange={(value: "runway" | "burn_rate" | "revenue" | "cash_balance" | "expenses") =>
                setNewAlert({ ...newAlert, metric: value })
              }
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                <SelectItem
                  value="runway"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cash Runway
                </SelectItem>
                <SelectItem
                  value="burn_rate"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Burn Rate
                </SelectItem>
                <SelectItem
                  value="revenue"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Revenue
                </SelectItem>
                <SelectItem
                  value="cash_balance"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cash Balance
                </SelectItem>
                <SelectItem
                  value="expenses"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Expenses
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newAlert.condition}
              onValueChange={(value: "below" | "above" | "equals") => setNewAlert({ ...newAlert, condition: value })}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                <SelectItem
                  value="below"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Below
                </SelectItem>
                <SelectItem
                  value="above"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Above
                </SelectItem>
                <SelectItem
                  value="equals"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Equals
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Threshold value"
              value={newAlert.threshold}
              onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            />

            <Select
              value={newAlert.type}
              onValueChange={(value: "warning" | "critical" | "info") => setNewAlert({ ...newAlert, type: value })}
            >
              <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                <SelectItem
                  value="info"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Info
                </SelectItem>
                <SelectItem
                  value="warning"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Warning
                </SelectItem>
                <SelectItem
                  value="critical"
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Critical
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="email-notifications"
                checked={newAlert.emailNotifications}
                onCheckedChange={(checked) => setNewAlert({ ...newAlert, emailNotifications: checked })}
              />
              <Label htmlFor="email-notifications" className="text-sm text-slate-700 dark:text-slate-300">
                Email notifications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="push-notifications"
                checked={newAlert.pushNotifications}
                onCheckedChange={(checked) => setNewAlert({ ...newAlert, pushNotifications: checked })}
              />
              <Label htmlFor="push-notifications" className="text-sm text-slate-700 dark:text-slate-300">
                Push notifications
              </Label>
            </div>
            <Button onClick={addAlert} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Active Alerts</h4>
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      {getMetricIcon(alert.metric)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-900 dark:text-white">{alert.title}</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Threshold: {formatValue(alert.threshold, alert.metric)} | Current:{" "}
                          {formatValue(alert.currentValue, alert.metric)}
                        </span>
                        <div className="flex items-center gap-1">
                          {alert.emailNotifications && (
                            <Badge variant="secondary" className="text-xs">
                              📧
                            </Badge>
                          )}
                          {alert.pushNotifications && (
                            <Badge variant="secondary" className="text-xs">
                              🔔
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-8 w-8 p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Alert History</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {alerts
              .filter((alert) => !alert.isActive)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/30 dark:bg-slate-800/30 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="text-sm text-slate-900 dark:text-white">{alert.title}</span>
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        Resolved
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{alert.createdAt}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
