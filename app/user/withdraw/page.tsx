import { TransactionHistory } from "@/components/TransactionHistory";
import { WithdrawalForm } from "@/components/WithdrawalForm";

export default function WithdrawPage() {
  return (
    <div className="container mx-auto gap-2 grid grid-cols-1 md:grid-cols-3 justify-between p-4">
      <WithdrawalForm />
      <div className="col-span-2">
        <TransactionHistory />
      </div>
    </div>
  );
}
