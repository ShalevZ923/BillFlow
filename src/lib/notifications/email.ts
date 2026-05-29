import { getEnv } from "@/lib/env";

export type EmailClient = {
  send: (params: {
    to: string;
    subject: string;
    text: string;
  }) => Promise<void>;
};

export async function sendReminderEmail(input: {
  to: string;
  billName: string;
  dueDate: string;
  amountLabel: string;
  type: "seven-day" | "one-day" | "overdue";
}, client?: EmailClient): Promise<void> {
  const env = getEnv();

  const subjectMap = {
    "seven-day": `Reminder: ${input.billName} due in 7 days`,
    "one-day": `Reminder: ${input.billName} due tomorrow`,
    overdue: `Overdue: ${input.billName} is past due`
  };

  const subject = subjectMap[input.type];
  const text = [
    `Bill: ${input.billName}`,
    `Amount: ${input.amountLabel}`,
    `Due Date: ${input.dueDate}`,
    "",
    "Log in to BillFlow to record this payment.",
    `${env.NEXT_PUBLIC_APP_URL}/dashboard`
  ].join("\n");

  if (client) {
    await client.send({ to: input.to, subject, text });
  }
}
