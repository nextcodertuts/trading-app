"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Binary Trading App
          </Link>
          <nav>
            {session ? (
              <>
                <Link href="/dashboard" className="mr-4">
                  Dashboard
                </Link>
                <Link href="/wallet" className="mr-4">
                  Wallet
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="mr-4">
                    Admin
                  </Link>
                )}
                <Button onClick={() => signOut()} variant="ghost">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="mr-4">
                  Login
                </Link>
                <Link href="/signup">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">{children}</main>
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">© 2025 Binary Trading App. All rights reserved.</div>
      </footer>
    </div>
  )
}

