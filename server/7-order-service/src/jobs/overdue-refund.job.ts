import { processOverdueRefunds } from '@order/services/refund.service';

const OVERDUE_REFUND_INTERVAL_MS = 60 * 1000;

let interval: NodeJS.Timeout | undefined;

export const startOverdueRefundJob = (): void => {
  if (interval) {
    return;
  }

  const run = async (): Promise<void> => {
    await processOverdueRefunds().catch(() => undefined);
  };

  void run();
  interval = setInterval(() => {
    void run();
  }, OVERDUE_REFUND_INTERVAL_MS);
};
