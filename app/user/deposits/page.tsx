/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { QRCodeSVG } from "qrcode.react";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DepositPage() {
  const [formData, setFormData] = useState({
    mobile: "",
    amount: "",
    upiId: "",
    fullName: "",
  });
  const [upiQrCode, setUpiQrCode] = useState("");
  const [utr, setUtr] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const adminUpiId = "8927203711@okbizaxis"; // Replace with your admin UPI ID

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDepositClick = () => {
    if (
      !formData.amount ||
      !formData.mobile ||
      !formData.upiId ||
      !formData.fullName
    ) {
      toast({
        title: "Error",
        description: "Please fill all the fields.",
        variant: "destructive",
      });
      return;
    }

    // Generate UPI QR Code using upi.me format
    const upiString = `upi://pay?pa=${adminUpiId}&pn=Admin&am=${formData.amount}&cu=INR`;
    setUpiQrCode(upiString);
    setIsDialogOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!utr) {
      toast({
        title: "Error",
        description: "Please enter the UTR for the transaction.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/wallet-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit",
          amount: parseFloat(formData.amount),
          utr,
          userUpiId: formData.upiId,
          userFullName: formData.fullName,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description:
            "Deposit submitted successfully. Awaiting admin approval.",
        });
        setIsDialogOpen(false);
        router.push("/user");
      } else {
        toast({
          title: "Error",
          description: "Failed to submit deposit. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting deposit:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Deposit Funds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter deposit amount"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upiId">Your UPI ID</Label>
            <Input
              id="upiId"
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              placeholder="Enter your UPI ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>
          <Button className="w-full" onClick={handleDepositClick}>
            Deposit
          </Button>
        </CardContent>
      </Card>

      {/* Dialog for UPI Payment */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Scan the QR code below or use the admin UPI ID to pay the deposit
              amount.
            </p>
            <QRCodeSVG value={upiQrCode} size={200} className="mx-auto" />
            <p className="mt-2 text-sm">
              <strong>Admin UPI ID:</strong> {adminUpiId}
            </p>
            <p className="mt-2 text-sm">
              <strong>Amount:</strong> ₹{formData.amount}
            </p>
            <div className="space-y-2">
              <Label htmlFor="utr">UTR (Transaction Reference)</Label>
              <Input
                id="utr"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter UTR after payment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleFinalSubmit} className="w-full">
              Final Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
