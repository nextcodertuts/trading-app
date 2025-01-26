/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function ClientSymbolForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    currentPrice: 0,
    payout: 80,
    enabled: true,
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

      if (response.ok) {
        toast({
          title: "Success",
          description: "Symbol created successfully.",
        });
        setFormData({
          name: "",
          currentPrice: 0,
          payout: 80,
          enabled: true,
        });
        setIsExpanded(false);
        router.refresh();
      } else {
        throw new Error("Failed to create symbol");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create symbol. Please try again.",
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
