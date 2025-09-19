"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar } from "lucide-react"

interface KPI {
  id: string
  name: string
  value: number
  target: number
  unit: string
  trend: "up" | "down" | "stable"
  change: number
  icon: React.ReactNode
}

export function KPIDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([
    {
      id: "1",
      name: "Monthly Recurring Revenue",
      value: 800000,
      target: 1000000,
      unit: "₹",
      trend: "up",
      change: 12.5,
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: "2",
      name: "Customer Acquisition Cost",
      value: 15000,
      target: 12000,
      unit: "₹",
      trend: "down",
      change: -8.2,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "3",
      name: "Gross Margin",
      value: 75,
      target: 80,
      unit: "%",
      trend: "up",
      change: 3.1,
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: "4",
      name: "Burn Multiple",
      value: 1.8,
      target: 1.5,
      unit: "x",
      trend: "down",
      change: -5.5,
      icon: <Calendar className="w-4 h-4" />,
    },
  ])

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-500"
      case "down":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4" />
      case "down":
        return <TrendingDown className="w-4 h-4" />
      default:
        return null
    }
  }

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">📈 Key Performance Indicators</CardTitle>
        <CardDescription>Track your most important financial metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi) => {
            const progress = Math.min((kpi.value / kpi.target) * 100, 100)

            return (
              <div key={kpi.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {kpi.icon}
                    <span className="font-medium text-sm">{kpi.name}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getTrendColor(kpi.trend)}`}>
                    {getTrendIcon(kpi.trend)}
                    <span className="text-sm">
                      {kpi.change > 0 ? "+" : ""}
                      {kpi.change}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold">
                      {kpi.unit === "₹" ? kpi.unit : ""}
                      {kpi.value.toLocaleString()}
                      {kpi.unit !== "₹" ? kpi.unit : ""}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Target: {kpi.unit === "₹" ? kpi.unit : ""}
                      {kpi.target.toLocaleString()}
                      {kpi.unit !== "₹" ? kpi.unit : ""}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(kpi.value, kpi.target)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="text-xs text-muted-foreground">{progress.toFixed(1)}% of target achieved</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
