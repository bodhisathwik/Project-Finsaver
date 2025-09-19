"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface BudgetItem {
  id: string
  category: string
  budgeted: number
  actual: number
  month: string
}

export function BudgetTracker() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: "1", category: "Marketing", budgeted: 50000, actual: 45000, month: "Current" },
    { id: "2", category: "Engineering", budgeted: 200000, actual: 210000, month: "Current" },
    { id: "3", category: "Operations", budgeted: 30000, actual: 28000, month: "Current" },
  ])
  const [newCategory, setNewCategory] = useState("")
  const [newBudget, setNewBudget] = useState("")

  const addBudgetItem = () => {
    if (newCategory && newBudget) {
      const newItem: BudgetItem = {
        id: Date.now().toString(),
        category: newCategory,
        budgeted: Number.parseInt(newBudget),
        actual: 0,
        month: "Current",
      }
      setBudgetItems([...budgetItems, newItem])
      setNewCategory("")
      setNewBudget("")
    }
  }

  const updateActual = (id: string, actual: number) => {
    setBudgetItems((items) => items.map((item) => (item.id === id ? { ...item, actual } : item)))
  }

  const getVarianceColor = (budgeted: number, actual: number) => {
    const variance = ((actual - budgeted) / budgeted) * 100
    if (variance > 10) return "text-red-500"
    if (variance < -10) return "text-green-500"
    return "text-yellow-500"
  }

  const getVarianceIcon = (budgeted: number, actual: number) => {
    const variance = ((actual - budgeted) / budgeted) * 100
    if (variance > 10) return <TrendingUp className="w-4 h-4 text-red-500" />
    if (variance < -10) return <TrendingDown className="w-4 h-4 text-green-500" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">📊 Budget vs Actual Tracker</CardTitle>
        <CardDescription>Monitor spending against budgeted amounts by category</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new budget item */}
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
          <Input type="number" placeholder="Budget" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
          <Button onClick={addBudgetItem} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Budget items */}
        <div className="space-y-3">
          {budgetItems.map((item) => {
            const variance = ((item.actual - item.budgeted) / item.budgeted) * 100
            const progress = (item.actual / item.budgeted) * 100

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center gap-2">
                    {getVarianceIcon(item.budgeted, item.actual)}
                    <span className={`text-sm ${getVarianceColor(item.budgeted, item.actual)}`}>
                      {variance > 0 ? "+" : ""}
                      {variance.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    ₹{item.actual.toLocaleString()} / ₹{item.budgeted.toLocaleString()}
                  </span>
                  <Input
                    type="number"
                    value={item.actual}
                    onChange={(e) => updateActual(item.id, Number.parseInt(e.target.value) || 0)}
                    className="w-24 h-6 text-xs"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
