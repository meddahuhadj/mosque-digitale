import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { Server as SocketIOServer } from "socket.io";
import { childLogger } from "../logger.js";

const log = childLogger("notifications");

let io: SocketIOServer | null = null;

export function setSocketIO(server: SocketIOServer) {
  io = server;
}

export async function createNotification(params: {
  mosqueId: string;
  userId?: string;
  title: string;
  body: string;
  type?: string;
  data?: Record<string, unknown>;
}) {
  const [notification] = await db
    .insert(notifications)
    .values({
      mosqueId: params.mosqueId,
      userId: params.userId || null,
      title: params.title,
      body: params.body,
      type: (params.type as any) || "system",
      data: params.data || {},
    })
    .returning();

  // Push via Socket.IO
  if (io) {
    if (params.userId) {
      io.of("/notifications").to(`user:${params.userId}`).emit("notification", {
        id: notification.id,
        title: params.title,
        body: params.body,
        type: params.type,
        data: params.data,
      });
    }
    io.of("/notifications").to(`mosque:${params.mosqueId}`).emit("notification", {
      id: notification.id,
      title: params.title,
      body: params.body,
      type: params.type,
      data: params.data,
    });
  }

  return notification;
}

export async function getNotifications(mosqueId: string, userId?: string, limit = 20) {
  const conditions = [eq(notifications.mosqueId, mosqueId)];
  if (userId) conditions.push(eq(notifications.userId, userId));

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(notifications.createdAt)
    .limit(limit);
}

export async function markAsRead(notificationId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}
