"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function WalletPage() {
  const { data: session } = useSession()
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Fetch user balance and transactions
    const fetchWalletData = async () => {
      const balanceResponse = await fetch("/api/balance")
      const balanceData = await balanceResponse.json()
      setBalance(balanceData.balance)

      const transactionsResponse = await fetch("/api/transactions")
      const transactionsData = await transactionsResponse.json()
      setTransactions(transactionsData)
    }
    fetchWalletData()
  }, [])

  const handleTransaction = async (type: "deposit" | "withdrawal") => {
    if (!amount) return

    const response = await fetch("/api/wallet-transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: Number.parseFloat(amount) }),
    })

    if (response.ok) {
      // Handle successful transaction
      const data = await response.json()
      setBalance(data.newBalance)
      setTransactions([...transactions, data.transaction])
      setAmount("")
    } else {
      // Handle error
      console.error("Transaction failed")
    }
  }

  if (!session) {
    return <div>Please log in to access your wallet.</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Manage your deposits and withdrawals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p>Current Balance: ${balance.toFixed(2)}</p>
          </div>
          <div className="space-y-4">
            <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div className="flex space-x-2">
              <Button onClick={() => handleTransaction("deposit")}>Deposit</Button>
              <Button onClick={() => handleTransaction("withdrawal")}>Withdraw</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

