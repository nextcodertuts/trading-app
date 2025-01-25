/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck
import React from "react";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import { formatDate } from "@/lib/dateFormatter";

interface Trade {
  id: number;
  symbolId: number;
  symbol: { name: string };
  amount: number;
  direction: "up" | "down";
  entryPrice: number;
  exitPrice: number | null;
  outcome: "win" | "loss" | null;
  expiresAt: string;
  createdAt: string;
}

interface TradeItemProps {
  trade: {
    id: number;
    symbolId: number;
    symbol: { name: string };
    amount: number;
    direction: "up" | "down";
    entryPrice: number;
    exitPrice: number | null;
    outcome: "win" | "loss" | null;
    expiresAt: string;
    createdAt: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export function TradeItem({ trade, isExpanded, onToggle }: TradeItemProps) {
  const getOutcomeColor = (outcome: string | null) => {
    switch (outcome) {
      case "win":
        return "text-green-500";
      case "loss":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <span className="text-lg font-semibold">{trade.symbol.name}</span>
          <span
            className={`text-sm ${
              trade.direction === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trade.direction === "up" ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`font-bold ${getOutcomeColor(trade.outcome)}`}>
            {trade.outcome ? trade.outcome.toUpperCase() : "PENDING"}
          </span>
          <span className="text-gray-400">{formatDate(trade.createdAt)}</span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 bg-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Amount:</p>
              <p className="font-semibold">${trade.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Entry Price:</p>
              <p className="font-semibold">${trade.entryPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">Exit Price:</p>
              <p className="font-semibold">
                {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : "Pending"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Expiry:</p>
              <p className="font-semibold">{formatDate(trade.expiresAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
