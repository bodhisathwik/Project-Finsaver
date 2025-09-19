"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Plus,
  Download,
  RotateCcw,
  Moon,
  Sun,
  FileText,
  Copy,
  X,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "next-themes"
import { BudgetTracker } from "./enhanced-features/budget-tracker"
import { KPIDashboard } from "./enhanced-features/kpi-dashboard"
import { CashFlowCategories } from "./enhanced-features/cash-flow-categories"
import { AlertsNotifications } from "./enhanced-features/alerts-notifications"

interface ChartInstance {
  destroy(): void
  update(): void
}

interface HeadcountRole {
  id: string
  role: string
  salary: number
  startMonth: number
}

interface FinancialInputs {
  monthlySpend: number
  oneTimeSpend: number
  priceIncrease: number
}

interface Scenario {
  inputs: FinancialInputs
  headcount: HeadcountRole[]
  runway: number
  forecastData: number[]
}

export function CFODashboard() {
  const { theme, setTheme } = useTheme()
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<ChartInstance | null>(null)

  const [inputs, setInputs] = useState<FinancialInputs>({
    monthlySpend: 0,
    oneTimeSpend: 0,
    priceIncrease: 0,
  })

  const [headcount, setHeadcount] = useState<HeadcountRole[]>([])
  const [scenarioA, setScenarioA] = useState<Scenario | null>(null)
  const [scenarioB, setScenarioB] = useState<Scenario | null>(null)
  const [chatHistory, setChatHistory] = useState<Array<{ text: string; sender: "user" | "ai" }>>([])
  const [chatInput, setChatInput] = useState("")
  const [insights, setInsights] = useState<string[]>(["AI is monitoring your data stream..."])
  const [scenarioCounter, setScenarioCounter] = useState(0)
  const [isRiskSimActive, setIsRiskSimActive] = useState(false)
  const [showMemoModal, setShowMemoModal] = useState(false)
  const [memoContent, setMemoContent] = useState("")
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const initialData = {
    bankBalance: 5000000,
    monthlyRevenue: 800000,
    monthlyCosts: 1200000,
  }

  const formatRunway = (months: number) => (isFinite(months) ? `${months.toFixed(1)} mo` : "Infinite ∞")

  const formatCurrency = (val: number) =>
    `₹${new Intl.NumberFormat("en-IN", { maximumSignificantDigits: 3 }).format(val)}`

  const calculateForecast = (params: FinancialInputs & { headcount?: HeadcountRole[] }) => {
    const localHeadcount = params.headcount || headcount
    let currentBalance = initialData.bankBalance - params.oneTimeSpend
    const forecast = [currentBalance]

    for (let month = 1; month < 25; month++) {
      const monthlyHeadcountCost = localHeadcount
        .filter((r) => r.startMonth < month)
        .reduce((sum, r) => sum + r.salary, 0)

      const monthlyRevenue = initialData.monthlyRevenue * (1 + params.priceIncrease / 100)
      const monthlyBurn = initialData.monthlyCosts + params.monthlySpend + monthlyHeadcountCost - monthlyRevenue
      currentBalance -= monthlyBurn
      forecast.push(Math.max(0, currentBalance))
    }

    const firstMonthHeadcount = localHeadcount.reduce((sum, r) => sum + r.salary, 0)
    const displayBurn =
      initialData.monthlyCosts +
      params.monthlySpend +
      firstMonthHeadcount -
      initialData.monthlyRevenue * (1 + params.priceIncrease / 100)
    const displayRunway =
      displayBurn > 0 ? (initialData.bankBalance - params.oneTimeSpend) / displayBurn : Number.POSITIVE_INFINITY

    return { runway: displayRunway, burn: displayBurn, forecastData: forecast }
  }

  const baseResult = calculateForecast({ monthlySpend: 0, oneTimeSpend: 0, priceIncrease: 0, headcount: [] })
  const currentResult = calculateForecast(inputs)

  const addRole = (role = "", salary = 100000, startMonth = 0) => {
    const newRole: HeadcountRole = {
      id: `role-${Date.now()}`,
      role,
      salary,
      startMonth,
    }
    setHeadcount([...headcount, newRole])
    setScenarioCounter((prev) => prev + 1)
  }

  const removeRole = (id: string) => {
    setHeadcount(headcount.filter((r) => r.id !== id))
    setScenarioCounter((prev) => prev + 1)
  }

  const updateRole = (id: string, field: keyof HeadcountRole, value: any) => {
    setHeadcount(headcount.map((role) => (role.id === id ? { ...role, [field]: value } : role)))
    setScenarioCounter((prev) => prev + 1)
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return

    setChatHistory((prev) => [...prev, { text: chatInput, sender: "user" }])
    const query = chatInput
    setChatInput("")

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          text: `I've processed your request: "${query}". The financial model has been updated accordingly.`,
          sender: "ai",
        },
      ])
    }, 1000)
  }

  const saveScenario = (type: "A" | "B") => {
    const scenario: Scenario = {
      inputs: { ...inputs },
      headcount: [...headcount],
      runway: currentResult.runway,
      forecastData: currentResult.forecastData,
    }

    if (type === "A") {
      setScenarioA(scenario)
    } else {
      setScenarioB(scenario)
    }
  }

  const clearScenario = (type: "A" | "B") => {
    if (type === "A") {
      setScenarioA(null)
    } else {
      setScenarioB(null)
    }
  }

  const exportToCSV = () => {
    const csvData = [
      ["Metric", "Base Case", "Current Scenario"],
      ["Runway (months)", baseResult.runway.toFixed(1), currentResult.runway.toFixed(1)],
      ["Monthly Burn (₹)", baseResult.burn.toLocaleString(), currentResult.burn.toLocaleString()],
      ["Monthly Spend (₹)", "0", inputs.monthlySpend.toLocaleString()],
      ["One-time Spend (₹)", "0", inputs.oneTimeSpend.toLocaleString()],
      ["Price Change (%)", "0", inputs.priceIncrease.toString()],
      [""],
      ["Month", "Base Forecast", "Current Forecast"],
      ...Array.from({ length: 25 }, (_, i) => [
        `M${i}`,
        baseResult.forecastData[i]?.toLocaleString() || "",
        currentResult.forecastData[i]?.toLocaleString() || "",
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `runway-forecast-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateMemo = async () => {
    setIsGeneratingMemo(true)
    setShowMemoModal(true)

    setTimeout(() => {
      const memo = `Subject: Q4 Financial Planning Update

Dear Board Members,

I'm writing to update you on our proposed Q4 financial initiatives and their projected impact on our key metrics.

**Proposed Changes:**
- Additional monthly spending of ${formatCurrency(inputs.monthlySpend)} for strategic initiatives
- One-time expenditure of ${formatCurrency(inputs.oneTimeSpend)}
- Price adjustment of ${inputs.priceIncrease}%

**Financial Impact:**
- Current runway extends to ${formatRunway(baseResult.runway)} under base case scenario
- With proposed changes, runway adjusts to ${formatRunway(currentResult.runway)}
- Monthly burn rate changes from ${formatCurrency(baseResult.burn)} to ${formatCurrency(currentResult.burn)}

These strategic investments position us for accelerated growth while maintaining healthy cash management practices.

Best regards,
CEO`

      setMemoContent(memo)
      setIsGeneratingMemo(false)
    }, 2000)
  }

  const resetAll = () => {
    setInputs({ monthlySpend: 0, oneTimeSpend: 0, priceIncrease: 0 })
    setHeadcount([])
    setScenarioA(null)
    setScenarioB(null)
    setIsRiskSimActive(false)
    setScenarioCounter(0)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const mockInsights = [
        "Revenue velocity increased 15% this month",
        "Marketing spend efficiency improved",
        "Customer acquisition costs trending down",
        "Subscription renewals above target",
        "Operating expenses within budget",
        "Cash flow positive trend detected",
      ]

      const newInsight = mockInsights[Math.floor(Math.random() * mockInsights.length)]
      setInsights((prev) => {
        const filtered = prev.filter((insight) => !insight.startsWith("AI is monitoring"))
        return [newInsight, ...filtered].slice(0, 5)
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const initializeChart = async () => {
    if (!chartRef.current) return

    try {
      const { Chart, registerables } = await import("chart.js")
      Chart.register(...registerables)

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (!ctx) return

      const isDark = theme === "dark"
      const textColor = isDark ? "#e2e8f0" : "#334155"
      const gridColor = isDark ? "#475569" : "#cbd5e1"
      const backgroundColor = isDark ? "#1e293b" : "#ffffff"

      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: 25 }, (_, i) => `M${i}`),
          datasets: [
            {
              label: "Base Case",
              data: baseResult.forecastData,
              borderColor: "#64748b",
              backgroundColor: "rgba(100, 116, 139, 0.1)",
              borderWidth: 2,
              fill: false,
              tension: 0.1,
            },
            {
              label: "Current Scenario",
              data: currentResult.forecastData,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              fill: false,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
            y: {
              ticks: {
                color: textColor,
              },
              grid: {
                color: gridColor,
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: textColor,
              },
            },
          },
          backgroundColor: backgroundColor,
        },
      })

      chartInstanceRef.current = chart
    } catch (error) {
      console.error("Error initializing chart:", error)
    }
  }

  useEffect(() => {
    initializeChart()
  }, [theme, scenarioCounter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CFO Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Strategic financial planning and analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              variant="outline"
              size="sm"
              className="transition-all duration-200 hover:scale-105"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bank Balance</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(initialData.bankBalance)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Runway</p>
                  <p className="text-2xl font-bold text-secondary">{formatRunway(currentResult.runway)}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-chart-3">{formatCurrency(initialData.monthlyRevenue)}</p>
                </div>
                <div className="p-3 bg-chart-3/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Burn</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(currentResult.burn)}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-in">
        <TabsList className="grid w-full grid-cols-6 mb-8 bg-card/50 backdrop-blur-sm border shadow-lg">
          <TabsTrigger
            value="overview"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="runway"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Calendar className="h-4 w-4" />
            <span>Runway Analysis</span>
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
          </TabsTrigger>
          <TabsTrigger
            value="kpi"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="h-4 w-4" />
            <span>KPIs</span>
          </TabsTrigger>
          <TabsTrigger
            value="cashflow"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <PieChart className="h-4 w-4" />
            <span>Cash Flow</span>
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="card-hover border-0 shadow-lg bg-gradient-to-r from-card via-card to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <span>AI Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-3">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me about your financials..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleChat()}
                />
                <Button onClick={handleChat} className="bg-primary hover:bg-primary/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runway" className="space-y-6">
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Financial Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monthlySpend" className="text-sm font-medium">
                    Monthly Spend
                  </Label>
                  <Input
                    id="monthlySpend"
                    type="number"
                    value={inputs.monthlySpend}
                    onChange={(e) => setInputs({ ...inputs, monthlySpend: Number.parseFloat(e.target.value) || 0 })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oneTimeSpend" className="text-sm font-medium">
                    One-time Spend
                  </Label>
                  <Input
                    id="oneTimeSpend"
                    type="number"
                    value={inputs.oneTimeSpend}
                    onChange={(e) => setInputs({ ...inputs, oneTimeSpend: Number.parseFloat(e.target.value) || 0 })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceIncrease" className="text-sm font-medium">
                    Price Increase (%)
                  </Label>
                  <Input
                    id="priceIncrease"
                    type="number"
                    value={inputs.priceIncrease}
                    onChange={(e) => setInputs({ ...inputs, priceIncrease: Number.parseFloat(e.target.value) || 0 })}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Headcount Planning</CardTitle>
                <Button onClick={() => addRole()} className="bg-secondary hover:bg-secondary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {headcount.map((role) => (
                  <div key={role.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                    <Input
                      value={role.role}
                      onChange={(e) => updateRole(role.id, "role", e.target.value)}
                      placeholder="Role title"
                      className="transition-all duration-200"
                    />
                    <Input
                      value={role.salary}
                      onChange={(e) => updateRole(role.id, "salary", Number.parseFloat(e.target.value) || 0)}
                      placeholder="Annual salary"
                      type="number"
                      className="transition-all duration-200"
                    />
                    <Input
                      value={role.startMonth}
                      onChange={(e) => updateRole(role.id, "startMonth", Number.parseFloat(e.target.value) || 0)}
                      placeholder="Start month"
                      type="number"
                      className="transition-all duration-200"
                    />
                    <Button
                      onClick={() => removeRole(role.id)}
                      variant="outline"
                      className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Runway Forecast</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                    Base: {formatRunway(baseResult.runway)}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                    Current: {formatRunway(currentResult.runway)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full bg-gradient-to-br from-muted/20 to-transparent rounded-lg p-4">
                <canvas ref={chartRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Scenario Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <Button onClick={() => saveScenario("A")} className="flex-1 bg-chart-1 hover:bg-chart-1/90">
                    Save Scenario A
                  </Button>
                  <Button onClick={() => clearScenario("A")} variant="outline" className="flex-1">
                    Clear A
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => saveScenario("B")} className="flex-1 bg-chart-2 hover:bg-chart-2/90">
                    Save Scenario B
                  </Button>
                  <Button onClick={() => clearScenario("B")} variant="outline" className="flex-1">
                    Clear B
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={exportToCSV} variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="mr-2 h-4 w-4" /> Export to CSV
                </Button>
                <Button onClick={generateMemo} variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" /> Generate Memo
                </Button>
                <Button
                  onClick={resetAll}
                  variant="outline"
                  className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset All
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTracker />
        </TabsContent>
        <TabsContent value="kpi">
          <KPIDashboard />
        </TabsContent>
        <TabsContent value="cashflow">
          <CashFlowCategories />
        </TabsContent>
        <TabsContent value="alerts">
          <AlertsNotifications />
        </TabsContent>
      </Tabs>

      {showMemoModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-card border shadow-2xl rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-card to-muted/20">
              <h2 className="text-2xl font-bold">Executive Memo</h2>
              <Button onClick={() => setShowMemoModal(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isGeneratingMemo ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Generating memo...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <pre className="bg-muted/30 p-6 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {memoContent}
                  </pre>
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => navigator.clipboard.writeText(memoContent)}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
