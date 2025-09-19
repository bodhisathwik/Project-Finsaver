"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"

interface CashFlowItem {
  id: string
  description: string
  amount: number
  category: string
  type: "inflow" | "outflow"
  date: string
  recurring: boolean
}

export function CashFlowCategories() {
  const [items, setItems] = useState<CashFlowItem[]>([
    {
      id: "1",
      description: "SaaS Subscriptions",
      amount: 800000,
      category: "Revenue",
      type: "inflow",
      date: "2024-01-01",
      recurring: true,
    },
    {
      id: "2",
      description: "Salaries",
      amount: -600000,
      category: "Personnel",
      type: "outflow",
      date: "2024-01-01",
      recurring: true,
    },
    {
      id: "3",
      description: "Office Rent",
      amount: -50000,
      category: "Operations",
      type: "outflow",
      date: "2024-01-01",
      recurring: true,
    },
    {
      id: "4",
      description: "Marketing Spend",
      amount: -100000,
      category: "Marketing",
      type: "outflow",
      date: "2024-01-01",
      recurring: true,
    },
  ])

  const [newItem, setNewItem] = useState({
    description: "",
    amount: "",
    category: "",
    type: "outflow" as "inflow" | "outflow",
    recurring: false,
  })

  const categories = ["Revenue", "Personnel", "Operations", "Marketing", "R&D", "Legal", "Other"]

  const addItem = () => {
    if (newItem.description && newItem.amount && newItem.category) {
      const item: CashFlowItem = {
        id: Date.now().toString(),
        description: newItem.description,
        amount:
          newItem.type === "outflow"
            ? -Math.abs(Number.parseInt(newItem.amount))
            : Math.abs(Number.parseInt(newItem.amount)),
        category: newItem.category,
        type: newItem.type,
        date: new Date().toISOString().split("T")[0],
        recurring: newItem.recurring,
      }
      setItems([...items, item])
      setNewItem({ description: "", amount: "", category: "", type: "outflow", recurring: false })
    }
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const getCategoryTotal = (category: string) => {
    return items.filter((item) => item.category === category).reduce((sum, item) => sum + item.amount, 0)
  }

  const getCategoryColor = (category: string) => {
    const total = getCategoryTotal(category)
    return total >= 0
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          💰 Cash Flow Categories
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Categorize and track your cash inflows and outflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newItem.amount}
            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
          <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              {categories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={newItem.type}
            onValueChange={(value: "inflow" | "outflow") => setNewItem({ ...newItem, type: value })}
          >
            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
              <SelectItem
                value="inflow"
                className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Inflow
              </SelectItem>
              <SelectItem
                value="outflow"
                className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Outflow
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => {
            const total = getCategoryTotal(category)
            const hasItems = items.some((item) => item.category === category)

            if (!hasItems) return null

            return (
              <Badge
                key={category}
                variant="outline"
                className={`p-2 justify-between border-slate-300 dark:border-slate-600 ${getCategoryColor(category)}`}
              >
                <span className="font-medium">{category}</span>
                <span>₹{Math.abs(total).toLocaleString()}</span>
              </Badge>
            )
          })}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">{item.description}</span>
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    {item.category}
                  </Badge>
                  {item.recurring && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Recurring
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${item.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {item.amount >= 0 ? "+" : ""}₹{Math.abs(item.amount).toLocaleString()}
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
