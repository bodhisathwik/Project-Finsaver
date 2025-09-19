"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, FileText, FileSpreadsheet } from "lucide-react"

interface ExportDialogProps {
  data: any
  scenarios: any
}

export function ExportDialog({ data, scenarios }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const exportToCSV = () => {
    const csvData = [
      ["Month", "Base Case", "Current Scenario", "Scenario A", "Scenario B"],
      ...Array.from({ length: 25 }, (_, i) => [
        `M${i}`,
        data.base?.[i] || "",
        data.current?.[i] || "",
        scenarios.scenarioA?.forecastData?.[i] || "",
        scenarios.scenarioB?.forecastData?.[i] || "",
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
    setIsOpen(false)
  }

  const exportToPDF = () => {
    // Simple PDF export using browser print
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Runway Forecast Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .metric { padding: 15px; border: 1px solid #ccc; border-radius: 8px; }
              .scenarios { margin-top: 20px; }
              .scenario { margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Runway Financial Forecast</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="metrics">
              <div class="metric">
                <h3>Current Runway</h3>
                <p>${data.runway || "N/A"}</p>
              </div>
              <div class="metric">
                <h3>Monthly Burn</h3>
                <p>${data.burn || "N/A"}</p>
              </div>
            </div>
            <div class="scenarios">
              <h2>Saved Scenarios</h2>
              ${scenarios.scenarioA ? `<div class="scenario"><h3>Scenario A</h3><p>Runway: ${scenarios.scenarioA.runway}</p></div>` : ""}
              ${scenarios.scenarioB ? `<div class="scenario"><h3>Scenario B</h3><p>Runway: ${scenarios.scenarioB.runway}</p></div>` : ""}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Financial Data</DialogTitle>
          <DialogDescription>Choose your preferred export format for the runway forecast data.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
