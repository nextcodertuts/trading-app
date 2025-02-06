/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Copy, Users, DollarSign, Gift } from "lucide-react";

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  referrals: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
  bonuses: Array<{
    id: number;
    amount: number;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ReferralPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/referral/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching referral stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    // Get the current user's referral code from localStorage or API
    const referralCode = "YOUR_REFERRAL_CODE"; // Replace with actual code
    const link = `${window.location.origin}/auth/register?ref=${referralCode}`;
    setReferralLink(link);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Referral Program</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalReferrals || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalEarnings?.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <div>10% on friend's first deposit</div>
              <div>5% on friend's trading volume</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 p-2 border rounded bg-muted"
            />
            <Button
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.name || referral.email}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(referral.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {!stats?.referrals.length && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No referrals yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bonus History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.bonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell>${bonus.amount.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{bonus.type}</TableCell>
                    <TableCell className="capitalize">{bonus.status}</TableCell>
                  </TableRow>
                ))}
                {!stats?.bonuses.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No bonuses yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
