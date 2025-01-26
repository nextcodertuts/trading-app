"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("userId") || "");
  const [symbolId, setSymbolId] = useState(searchParams.get("symbolId") || "");
  const [direction, setDirection] = useState(
    searchParams.get("direction") || ""
  );
  const [outcome, setOutcome] = useState(searchParams.get("outcome") || "");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (symbolId) params.set("symbolId", symbolId);
    if (direction) params.set("direction", direction);
    if (outcome) params.set("outcome", outcome);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const clearFilters = () => {
    setUserId("");
    setSymbolId("");
    setDirection("");
    setOutcome("");
    router.push("/admin/orders");
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Input
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-40"
      />
      <Input
        placeholder="Symbol ID"
        value={symbolId}
        onChange={(e) => setSymbolId(e.target.value)}
        className="w-40"
      />
      <Select value={direction} onValueChange={setDirection}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="up">Up</SelectItem>
          <SelectItem value="down">Down</SelectItem>
        </SelectContent>
      </Select>
      <Select value={outcome} onValueChange={setOutcome}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Outcome" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="win">Win</SelectItem>
          <SelectItem value="loss">Loss</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={applyFilters}>Apply Filters</Button>
      <Button variant="outline" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );
}
