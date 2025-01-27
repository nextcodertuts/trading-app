/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SymbolForm({ symbol = null, onSuccess = () => {} }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: symbol?.name || "",
    currentPrice: symbol?.currentPrice || 0,
    payout: symbol?.payout || 80,
    enabled: symbol?.enabled ?? true,
    trend: symbol?.trend || "",
    volatility: symbol?.volatility || 1.0,
    status: symbol?.status || "active",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const url = symbol
      ? `/api/admin/symbols/${symbol.id}`
      : "/api/admin/symbols";
    const method = symbol ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: symbol?.id, // Include the id for update requests
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Symbol ${symbol ? "updated" : "created"} successfully.`,
        });
        onSuccess(result.symbol);
        if (!symbol) {
          setFormData({
            name: "",
            currentPrice: 0,
            payout: 80,
            enabled: true,
            trend: "",
            volatility: 1.0,
            status: "active",
          });
        }
      } else {
        throw new Error("Failed to save symbol");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${
          symbol ? "update" : "create"
        } symbol. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="currentPrice">Current Price</Label>
        <Input
          id="currentPrice"
          type="number"
          step="0.01"
          value={formData.currentPrice}
          onChange={(e) =>
            setFormData({
              ...formData,
              currentPrice: Number.parseFloat(e.target.value),
            })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="payout">Payout (%)</Label>
        <Input
          id="payout"
          type="number"
          step="0.1"
          value={formData.payout}
          onChange={(e) =>
            setFormData({
              ...formData,
              payout: Number.parseFloat(e.target.value),
            })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="trend">Trend</Label>
        <Select
          value={formData.trend}
          onValueChange={(value) => setFormData({ ...formData, trend: value })}
        >
          <SelectTrigger id="trend">
            <SelectValue placeholder="Select trend" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="up">Up</SelectItem>
            <SelectItem value="down">Down</SelectItem>
            <SelectItem value="volatile">Volatile</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="volatility">Volatility</Label>
        <Input
          id="volatility"
          type="number"
          step="0.1"
          value={formData.volatility}
          onChange={(e) =>
            setFormData({
              ...formData,
              volatility: Number.parseFloat(e.target.value),
            })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Input
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="enabled"
          checked={formData.enabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, enabled: checked })
          }
        />
        <Label htmlFor="enabled">Enabled</Label>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : symbol ? "Update Symbol" : "Create Symbol"}
      </Button>
    </form>
  );
}
