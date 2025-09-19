"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Trash2 } from "lucide-react"

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

  const removeItem = (id: string) => {
    setBudgetItems((items) => items.filter((item) => item.id !== id))
  }

  const getVarianceColor = (budgeted: number, actual: number) => {
    const variance = ((actual - budgeted) / budgeted) * 100
    if (variance > 10) return "text-red-500 dark:text-red-400"
    if (variance < -10) return "text-green-500 dark:text-green-400"
    return "text-yellow-500 dark:text-yellow-400"
  }

  const getVarianceIcon = (budgeted: number, actual: number) => {
    const variance = ((actual - budgeted) / budgeted) * 100
    if (variance > 10) return <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400" />
    if (variance < -10) return <TrendingDown className="w-4 h-4 text-green-500 dark:text-green-400" />
    return <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          📊 Budget vs Actual Tracker
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Monitor spending against budgeted amounts by category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <Input
            type="number"
            placeholder="Budget"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <Button onClick={addBudgetItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {budgetItems.map((item) => {
            const variance = ((item.actual - item.budgeted) / item.budgeted) * 100
            const progress = (item.actual / item.budgeted) * 100

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900 dark:text-white">{item.category}</span>
                  <div className="flex items-center gap-2">
                    {getVarianceIcon(item.budgeted, item.actual)}
                    <span className={`text-sm ${getVarianceColor(item.budgeted, item.actual)}`}>
                      {variance > 0 ? "+" : ""}
                      {variance.toFixed(1)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-2" />
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    ₹{item.actual.toLocaleString()} / ₹{item.budgeted.toLocaleString()}
                  </span>
                  <Input
                    type="number"
                    value={item.actual}
                    onChange={(e) => updateActual(item.id, Number.parseInt(e.target.value) || 0)}
                    className="w-24 h-6 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
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
