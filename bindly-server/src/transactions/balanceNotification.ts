import { PrismaClient } from "@prisma/client";
import { DatabaseResponse } from "../types";
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { sendBatchNotifications } from "../utils/sendNotificationUtil";

const prisma = new PrismaClient();


export async function canNotify(initiator: string, receiver: string): Promise<DatabaseResponse<any>> {
    try {
        // Get notification record
        const data = await prisma.balance_notification.findFirst({
            where: { initiator, receiver }
        });



        console.log(data)
        console.log(initiator)
        console.log(receiver)

        // Get receiver data (username & tokens)
        const receiverData = await prisma.users.findUnique({
            where: { username: receiver },
            select: { username: true, tokens: true }
        });

        if (!receiverData) {
            return { data: null, error: new Error("Receiver not found") };
        }

        const tokens = Array.isArray(receiverData.tokens)
            ? receiverData.tokens.filter((token: unknown) => Expo.isExpoPushToken(token))
            : [];

        // Helper function to send notifications
        async function sendNotification() {
            if (tokens.length > 0) {
                const notifications: ExpoPushMessage[] = tokens.map((token) => ({
                    to: token,
                    sound: "default",
                    title: "Bindly",
                    body: `Please pay ${initiator}`,
                }));
                console.log(notifications,'notifications')
                await sendBatchNotifications(notifications);
            }
        }

        if (data) {
            // Check if last notification was sent in the last 12 hours
            if (data.latest_call > new Date(Date.now() - 1000 * 60 * 60 * 12)) {
                return { data: `Already notified ${receiver} within the last 12 hours`, error: null };
            }

            // ✅ Fix: Await the update
            await prisma.balance_notification.update({
                where: { id: data.id },
                data: { latest_call: new Date() }
            });

            await sendNotification(); // Send notification

            return { data: `Notified ${receiver}`, error: null };
        } else {
            // ✅ Fix: Create new notification entry in DB
            await prisma.balance_notification.create({
                data: {
                    initiator,
                    receiver,
                    latest_call: new Date(),
                }
            });

            await sendNotification(); // Send notification

            return { data: `Notified ${receiver}`, error: null };
        }
    } catch (error) {
        console.log(error)
        return {
            data: null,
            error: error instanceof Error ? error : new Error("Unknown error")
        };
    }
}
