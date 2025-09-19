"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, CheckCircle, X, Plus } from "lucide-react"

interface Alert {
  id: string
  title: string
  description: string
  type: "warning" | "critical" | "info"
  threshold: number
  currentValue: number
  isActive: boolean
  createdAt: string
}

export function AlertsNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      title: "Low Cash Runway",
      description: "Cash runway below 6 months",
      type: "critical",
      threshold: 6,
      currentValue: 4.2,
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "High Burn Rate",
      description: "Monthly burn exceeds budget by 20%",
      type: "warning",
      threshold: 20,
      currentValue: 25,
      isActive: true,
      createdAt: "2024-01-14",
    },
    {
      id: "3",
      title: "Revenue Target",
      description: "Monthly revenue target achieved",
      type: "info",
      threshold: 800000,
      currentValue: 850000,
      isActive: false,
      createdAt: "2024-01-10",
    },
  ])

  const [newAlert, setNewAlert] = useState({
    title: "",
    description: "",
    type: "warning" as "warning" | "critical" | "info",
    threshold: "",
  })

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
      }
      setAlerts([...alerts, alert])
      setNewAlert({ title: "", description: "", type: "warning", threshold: "" })
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
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <Bell className="w-4 h-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const activeAlerts = alerts.filter((alert) => alert.isActive)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 Alerts & Notifications
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {activeAlerts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Set up custom alerts for key financial metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new alert form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border rounded-lg bg-muted/50">
          <Input
            placeholder="Alert title"
            value={newAlert.title}
            onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newAlert.description}
            onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
          />
          <Select
            value={newAlert.type}
            onValueChange={(value: "warning" | "critical" | "info") => setNewAlert({ ...newAlert, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Threshold"
              value={newAlert.threshold}
              onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
            />
            <Button onClick={addAlert} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Active Alerts</h4>
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h5 className="font-medium">{alert.title}</h5>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Threshold: {alert.threshold} | Current: {alert.currentValue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)} className="h-6 w-6 p-0">
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All alerts history */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Alert History</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {alerts
              .filter((alert) => !alert.isActive)
              .map((alert) => (
                <div key={alert.id} className="p-2 border rounded-lg bg-muted/30 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span className="text-sm">{alert.title}</span>
                      <Badge variant="outline" className="text-xs">
                        Resolved
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.createdAt}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
