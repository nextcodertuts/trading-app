"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function WithdrawalForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [withdrawForm, setWithdrawForm] = useState({
    accountNumber: "",
    ifsc: "",
    beneficiaryName: "",
    upiId: "",
    amount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWithdrawForm({ ...withdrawForm, [name]: value });
  };

  const handleWithdrawSubmit = async () => {
    if (
      !withdrawForm.amount ||
      (!withdrawForm.accountNumber && !withdrawForm.upiId)
    ) {
      toast({
        title: "Error",
        description: "Please provide all required details.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/wallet-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "withdrawal",
          amount: parseFloat(withdrawForm.amount),
          accountNumber: withdrawForm.accountNumber,
          ifsc: withdrawForm.ifsc,
          beneficiaryName: withdrawForm.beneficiaryName,
          upiId: withdrawForm.upiId,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Withdrawal request submitted successfully.",
        });
        setWithdrawForm({
          accountNumber: "",
          ifsc: "",
          beneficiaryName: "",
          upiId: "",
          amount: "",
        });
        router.push("/user");
      } else {
        toast({
          title: "Error",
          description: "Failed to submit withdrawal request.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-lg max-h-fit">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Withdraw Funds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Bank Account Number</Label>
          <Input
            id="accountNumber"
            name="accountNumber"
            value={withdrawForm.accountNumber}
            onChange={handleInputChange}
            placeholder="Enter your bank account number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ifsc">IFSC Code</Label>
          <Input
            id="ifsc"
            name="ifsc"
            value={withdrawForm.ifsc}
            onChange={handleInputChange}
            placeholder="Enter IFSC code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
          <Input
            id="beneficiaryName"
            name="beneficiaryName"
            value={withdrawForm.beneficiaryName}
            onChange={handleInputChange}
            placeholder="Enter beneficiary name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="upiId">UPI ID (Optional)</Label>
          <Input
            id="upiId"
            name="upiId"
            value={withdrawForm.upiId}
            onChange={handleInputChange}
            placeholder="Enter your UPI ID"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={withdrawForm.amount}
            onChange={handleInputChange}
            placeholder="Enter withdrawal amount"
          />
        </div>
        <Button className="w-full" onClick={handleWithdrawSubmit}>
          Withdraw
        </Button>
      </CardContent>
    </Card>
  );
}
