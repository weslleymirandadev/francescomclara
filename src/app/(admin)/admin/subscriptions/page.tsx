import { getSubscriptionPlans } from "./actions";
import SubscriptionClient from "./SubscriptionClient";

export default async function AdminSubscriptionsPage() {
  const plans = await getSubscriptionPlans();

  return (
    <SubscriptionClient initialPlans={plans || []} />
  );
}