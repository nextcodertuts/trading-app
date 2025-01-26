/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import prisma from "@/lib/prisma";
import SymbolForm from "../SymbolForm";

export default async function EditSymbol({
  params,
}: {
  params: { id: string };
}) {
  const symbol = await prisma.symbol.findUnique({
    where: { id: Number.parseInt(params.id) },
  });

  if (!symbol) {
    return <div>Symbol not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Symbol: {symbol.name}</h1>
      <SymbolForm symbol={symbol} />
    </div>
  );
}
