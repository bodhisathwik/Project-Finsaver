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
    return total >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">💰 Cash Flow Categories</CardTitle>
        <CardDescription>Categorize and track your cash inflows and outflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new item form */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 border rounded-lg bg-muted/50">
          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={newItem.amount}
            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
          />
          <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={newItem.type}
            onValueChange={(value: "inflow" | "outflow") => setNewItem({ ...newItem, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inflow">Inflow</SelectItem>
              <SelectItem value="outflow">Outflow</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addItem} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Category summaries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => {
            const total = getCategoryTotal(category)
            const hasItems = items.some((item) => item.category === category)

            if (!hasItems) return null

            return (
              <Badge key={category} variant="outline" className={`p-2 justify-between ${getCategoryColor(category)}`}>
                <span className="font-medium">{category}</span>
                <span>₹{Math.abs(total).toLocaleString()}</span>
              </Badge>
            )
          })}
        </div>

        {/* Items list */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.description}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.recurring && (
                    <Badge variant="secondary" className="text-xs">
                      Recurring
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {item.amount >= 0 ? "+" : ""}₹{Math.abs(item.amount).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
