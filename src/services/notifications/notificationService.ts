import { NotificationRecord, StudentMembership } from '../../types/membership';
import {
  formatCoordinatorLoginNotification,
  mockWhatsAppAdapter,
  WhatsAppNotificationAdapter,
} from './whatsappNotificationAdapter';

const NOTIFICATION_STORAGE_KEY = 'idealab_notification_logs_v2';

function readStoredNotifications(): Record<string, NotificationRecord> {
  if (typeof localStorage === 'undefined') {
    return memoryNotifications;
  }
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, NotificationRecord>) : { ...memoryNotifications };
  } catch {
    return { ...memoryNotifications };
  }
}

let memoryNotifications: Record<string, NotificationRecord> = {};

function persistNotifications(map: Record<string, NotificationRecord>): void {
  memoryNotifications = { ...map };
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // Fallback safely to in-memory map
    }
  }
}

export class NotificationService {
  private adapter: WhatsAppNotificationAdapter;

  constructor(adapter: WhatsAppNotificationAdapter = mockWhatsAppAdapter) {
    this.adapter = adapter;
  }

  public getByRequestId(requestId: string): NotificationRecord | null {
    const logs = readStoredNotifications();
    return logs[requestId] ?? null;
  }

  /**
   * Sends coordinator WhatsApp notification ONCE per requestId.
   * Never throws on delivery failure so the student's PENDING request remains saved.
   */
  public async notifyCoordinatorOfNewLogin(
    membership: StudentMembership,
    options?: { simulateFailure?: boolean }
  ): Promise<NotificationRecord> {
    const logs = readStoredNotifications();
    const existing = logs[membership.requestId];

    // Idempotency guard: never send duplicate notifications for the same requestId
    if (existing && (existing.deliveryStatus === 'SENT' || existing.deliveryStatus === 'PENDING')) {
      return existing;
    }

    const messageBody = formatCoordinatorLoginNotification({
      displayName: membership.fullName,
      email: membership.email,
      requestId: membership.requestId,
      requestedAt: membership.requestedAt,
    });

    const record: NotificationRecord = existing
      ? {
          ...existing,
          deliveryStatus: 'RETRYING',
          attempts: existing.attempts + 1,
        }
      : {
          notificationId: `notif_${membership.requestId}`,
          requestId: membership.requestId,
          userId: membership.userId,
          channel: 'WHATSAPP',
          recipientRole: 'COORDINATOR',
          messageBody,
          deliveryStatus: 'PENDING',
          attempts: 1,
          createdAt: new Date().toISOString(),
        };

    logs[membership.requestId] = record;
    persistNotifications(logs);

    try {
      const shouldFail =
        options?.simulateFailure || membership.email.toLowerCase().includes('+failnotif');

      const result = await this.adapter.sendToCoordinator({
        requestId: membership.requestId,
        messageBody,
        simulateFailure: shouldFail,
      });

      const updated: NotificationRecord = result.success
        ? {
            ...record,
            deliveryStatus: 'SENT',
            sentAt: new Date().toISOString(),
            lastError: undefined,
          }
        : {
            ...record,
            deliveryStatus: 'FAILED',
            lastError: result.error || 'Failed to deliver WhatsApp notification.',
          };

      const nextLogs = readStoredNotifications();
      nextLogs[membership.requestId] = updated;
      persistNotifications(nextLogs);
      return updated;
    } catch (err) {
      const updated: NotificationRecord = {
        ...record,
        deliveryStatus: 'FAILED',
        lastError: err instanceof Error ? err.message : 'Unexpected WhatsApp delivery failure.',
      };
      const nextLogs = readStoredNotifications();
      nextLogs[membership.requestId] = updated;
      persistNotifications(nextLogs);
      return updated;
    }
  }

  public async retryFailedNotification(
    requestId: string,
    options?: { simulateFailure?: boolean }
  ): Promise<NotificationRecord | null> {
    const logs = readStoredNotifications();
    const existing = logs[requestId];
    if (!existing) {
      return null;
    }
    if (existing.deliveryStatus === 'SENT') {
      return existing;
    }

    const retryingRecord: NotificationRecord = {
      ...existing,
      deliveryStatus: 'RETRYING',
      attempts: existing.attempts + 1,
    };
    logs[requestId] = retryingRecord;
    persistNotifications(logs);

    try {
      const result = await this.adapter.sendToCoordinator({
        requestId,
        messageBody: existing.messageBody,
        simulateFailure: options?.simulateFailure ?? false,
      });

      const updated: NotificationRecord = result.success
        ? {
            ...retryingRecord,
            deliveryStatus: 'SENT',
            sentAt: new Date().toISOString(),
            lastError: undefined,
          }
        : {
            ...retryingRecord,
            deliveryStatus: 'FAILED',
            lastError: result.error || 'Retry failed.',
          };

      const nextLogs = readStoredNotifications();
      nextLogs[requestId] = updated;
      persistNotifications(nextLogs);
      return updated;
    } catch (err) {
      const updated: NotificationRecord = {
        ...retryingRecord,
        deliveryStatus: 'FAILED',
        lastError: err instanceof Error ? err.message : 'Retry failed.',
      };
      const nextLogs = readStoredNotifications();
      nextLogs[requestId] = updated;
      persistNotifications(nextLogs);
      return updated;
    }
  }

  public clearAllForTesting(): void {
    memoryNotifications = {};
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
    }
  }
}

export const notificationService = new NotificationService();
