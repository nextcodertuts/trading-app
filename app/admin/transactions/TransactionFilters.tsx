"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const handleFilter = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (type) params.set("type", type);
      else params.delete("type");
      if (status) params.set("status", status);
      else params.delete("status");
      params.set("page", "1"); // Reset to first page when filtering
      router.push(`/admin/transactions?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setType("");
      setStatus("");
      router.push("/admin/transactions");
    });
  };

  return (
    <div className="flex items-end space-x-4 mb-4">
      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleFilter} disabled={isPending}>
        Apply Filters
      </Button>
      <Button onClick={handleReset} variant="outline" disabled={isPending}>
        Reset
      </Button>
    </div>
  );
}
