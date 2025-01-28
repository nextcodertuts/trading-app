/* eslint-disable react-hooks/exhaustive-deps */
// components/admin/SymbolManipulationControl.tsx

import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Symbol {
  id: number;
  name: string;
  trend: string;
  volatility: number;
  bias: number;
  manipulationPercentage: number;
}

export function SymbolManipulationControl() {
  const [symbols, setSymbols] = useState<Symbol[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSymbols();
  }, []);

  const fetchSymbols = async () => {
    try {
      const response = await fetch("/api/symbols");
      if (!response.ok) throw new Error("Failed to fetch symbols");
      const data = await response.json();
      setSymbols(data.symbols);
    } catch (error) {
      console.error("Error fetching symbols:", error);
      toast({
        title: "Error",
        description: "Failed to fetch symbols",
        variant: "destructive",
      });
    }
  };

  const handleSymbolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const symbol = symbols.find((s) => s.id === parseInt(event.target.value));
    setSelectedSymbol(symbol || null);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!selectedSymbol) return;
    setSelectedSymbol({
      ...selectedSymbol,
      [event.target.name]:
        event.target.type === "number"
          ? parseFloat(event.target.value)
          : event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSymbol) return;

    try {
      const response = await fetch("/api/symbol-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedSymbol),
      });

      if (!response.ok) throw new Error("Failed to update symbol");

      toast({
        title: "Success",
        description: "Symbol updated successfully",
      });
    } catch (error) {
      console.error("Error updating symbol:", error);
      toast({
        title: "Error",
        description: "Failed to update symbol",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Symbol Manipulation Control</h2>
      <select
        className="mb-4 p-2 border rounded"
        onChange={handleSymbolChange}
        value={selectedSymbol?.id || ""}
      >
        <option value="">Select a symbol</option>
        {symbols.map((symbol) => (
          <option key={symbol.id} value={symbol.id}>
            {symbol.name}
          </option>
        ))}
      </select>

      {selectedSymbol && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Trend</label>
            <select
              name="trend"
              value={selectedSymbol.trend}
              onChange={handleInputChange}
              className="p-2 border rounded w-full"
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="sideways">Sideways</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Volatility</label>
            <input
              type="number"
              name="volatility"
              value={selectedSymbol.volatility}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              className="p-2 border rounded w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Bias</label>
            <input
              type="number"
              name="bias"
              value={selectedSymbol.bias}
              onChange={handleInputChange}
              step="0.01"
              min="-1"
              max="1"
              className="p-2 border rounded w-full"
            />
          </div>

          <div>
            <label className="block mb-1">Manipulation Percentage</label>
            <input
              type="number"
              name="manipulationPercentage"
              value={selectedSymbol.manipulationPercentage}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              max="1"
              className="p-2 border rounded w-full"
            />
          </div>

          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Update Symbol
          </button>
        </form>
      )}
    </div>
  );
}
