/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
"use client";
import type React from "react";
import { useState } from "react";
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
import { TransactionHistory } from "@/components/TransactionHistory";
import { Copy } from "lucide-react"; // Import the Copy icon

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
  const [bonusPercentage, setBonusPercentage] = useState(0); // Added bonusPercentage state
  const { toast } = useToast();
  const router = useRouter();

  const adminUpiId = "gpay-11256761617@okbizaxis"; // Replace with your admin UPI ID

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBonusSelection = (amount: number, bonus: number) => {
    setFormData({ ...formData, amount: amount.toString() });
    setBonusPercentage(bonus);
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
    const upiString = `upi://pay?pa=${adminUpiId}&pn=Blockstar&am=${formData.amount}&cu=INR`;
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

    const baseAmount = Number.parseFloat(formData.amount);
    const bonusAmount = baseAmount * (bonusPercentage / 100);
    const totalAmount = baseAmount + bonusAmount;

    try {
      const response = await fetch("/api/wallet-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit",
          amount: totalAmount,
          baseAmount: baseAmount,
          bonusAmount: bonusAmount,
          bonusPercentage: bonusPercentage,
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
        router.push("/trading/1");
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

  const copyUpiId = () => {
    navigator.clipboard
      .writeText(adminUpiId)
      .then(() => {
        toast({
          title: "Copied!",
          description: "UPI ID copied to clipboard",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Error",
          description: "Failed to copy UPI ID",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 p-2 min-h-screen">
      <div className="md:col-span-1">
        <Card className="w-full  ">
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
              <p className="text-xs text-secondary">min amount ₹1000</p>
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
            <div className="space-y-2">
              {" "}
              {/* Added bonus selection buttons */}
              <Label>Quick Select (with bonus)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handleBonusSelection(2000, 10)}>
                  2000 (+10%)
                </Button>
                <Button onClick={() => handleBonusSelection(3000, 20)}>
                  3000 (+20%)
                </Button>
                <Button onClick={() => handleBonusSelection(5000, 30)}>
                  5000 (+30%)
                </Button>
                <Button onClick={() => handleBonusSelection(10000, 40)}>
                  10000 (+40%)
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={handleDepositClick}>
              Deposit
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <TransactionHistory />
        {/* <RealTimePrice /> */}
      </div>

      {/* Dialog for UPI Payment */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Scan the QR code below or use the UPI ID to pay the deposit
              amount.
            </p>
            <QRCodeSVG value={upiQrCode} size={200} className="mx-auto" />
            <div className="mt-2 text-sm flex items-center justify-center space-x-2">
              <strong>P2P UPI ID:</strong>
              <span>{adminUpiId}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyUpiId}
                className="h-6 w-6"
                aria-label="Copy UPI ID"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-sm">
              <strong>Amount:</strong> ₹{formData.amount}
              {bonusPercentage > 0 && (
                <span className="text-green-600 ml-2">
                  (+ {bonusPercentage}% bonus)
                </span>
              )}
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
