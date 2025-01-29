import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceUpdater } from "./PriceUpdater";

export function LivePriceDisplay({ symbol }: { symbol: any }) {
  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="font-semibold">
          {symbol.name} Market Price
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 pt-0 px-3">
        <Suspense fallback={<div>Loading price...</div>}>
          <PriceUpdater symbolId={symbol.id} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
