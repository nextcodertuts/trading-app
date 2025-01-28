"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function ClientSymbolForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    binanceSymbol: "",
    currentPrice: "0",
    payout: "80",
    enabled: true,
    trend: "sideways",
    volatility: "1.0",
    minAmount: "10",
    maxAmount: "1000",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/symbols", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Symbol created successfully.",
      });

      setFormData({
        name: "",
        displayName: "",
        binanceSymbol: "",
        currentPrice: "0",
        payout: "80",
        enabled: true,
        trend: "sideways",
        volatility: "1.0",
        minAmount: "10",
        maxAmount: "1000",
      });

      setIsExpanded(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating symbol:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create symbol",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button onClick={() => setIsExpanded(true)} className="mb-4">
        New Symbol
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mb-8 p-4 border rounded-md"
    >
      <div>
        <Label htmlFor="name">Symbol Name (e.g., BTCUSDT)</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="displayName">Display Name (e.g., BTC/USDT)</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="binanceSymbol">Binance Symbol (e.g., BTCUSDT)</Label>
        <Input
          id="binanceSymbol"
          value={formData.binanceSymbol}
          onChange={(e) =>
            setFormData({ ...formData, binanceSymbol: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="currentPrice">Current Price</Label>
        <Input
          id="currentPrice"
          type="number"
          step="0.000001"
          value={formData.currentPrice}
          onChange={(e) =>
            setFormData({ ...formData, currentPrice: e.target.value })
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
          onChange={(e) => setFormData({ ...formData, payout: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="minAmount">Minimum Amount</Label>
        <Input
          id="minAmount"
          type="number"
          step="0.1"
          value={formData.minAmount}
          onChange={(e) =>
            setFormData({ ...formData, minAmount: e.target.value })
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="maxAmount">Maximum Amount</Label>
        <Input
          id="maxAmount"
          type="number"
          step="0.1"
          value={formData.maxAmount}
          onChange={(e) =>
            setFormData({ ...formData, maxAmount: e.target.value })
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
            <SelectItem value="sideways">Sideways</SelectItem>
            <SelectItem value="up">Up</SelectItem>
            <SelectItem value="down">Down</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="volatility">Volatility Factor</Label>
        <Input
          id="volatility"
          type="number"
          step="0.1"
          value={formData.volatility}
          onChange={(e) =>
            setFormData({ ...formData, volatility: e.target.value })
          }
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

      <div className="flex space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Symbol"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsExpanded(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
