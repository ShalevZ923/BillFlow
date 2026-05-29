export type PushSubscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushClient = {
  sendNotification: (
    subscription: PushSubscription,
    payload: string
  ) => Promise<void>;
};

export async function sendPushReminder(input: {
  subscription: PushSubscription;
  title: string;
  body: string;
}, client?: PushClient): Promise<void> {
  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    icon: "/icon.png"
  });

  if (client) {
    await client.sendNotification(input.subscription, payload);
  }
}
