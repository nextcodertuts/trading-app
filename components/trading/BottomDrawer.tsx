"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ChartNoAxesCombined } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { TradeHistory } from "./TradeHistory";

export default function BottomDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center">
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">
            <ChartNoAxesCombined />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-4 w-full mx-auto">
            <DialogTitle className="font-semibold mb-2" hidden>
              Trade History
            </DialogTitle>
            <TradeHistory />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
