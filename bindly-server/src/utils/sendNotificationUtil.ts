import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();


export async function sendBatchNotifications(notifications: ExpoPushMessage[]): Promise<void> {
    const chunks = expo.chunkPushNotifications(notifications.map(notification => ({
      ...notification,
      sound: 'default' as const
    })));
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    }
}
