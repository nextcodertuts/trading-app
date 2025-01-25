/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { use } from "react";

async function fetchOrders() {
  const response = await fetch("/api/orders");
  return response.json();
}

export function OrderStatus() {
  const orders = use(fetchOrders());

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Order Status</h2>
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order: any) => (
            <div
              key={order.id}
              className="border-b pb-2 mb-2 last:border-b-0 last:pb-0"
            >
              <p className="text-sm text-gray-700">
                {order.direction.toUpperCase()} - ₹{order.amount} for{" "}
                {order.time} seconds
              </p>
              <p className="text-xs text-gray-500">
                Status: {order.status || "Pending"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
