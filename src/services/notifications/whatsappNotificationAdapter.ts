export interface WhatsAppSendPayload {
  requestId: string;
  messageBody: string;
  simulateFailure?: boolean;
}

export interface WhatsAppSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface WhatsAppNotificationAdapter {
  sendToCoordinator: (payload: WhatsAppSendPayload) => Promise<WhatsAppSendResult>;
}

export function formatCoordinatorLoginNotification(params: {
  displayName: string;
  email: string;
  requestId: string;
  requestedAt: string;
}): string {
  const formattedTime = new Date(params.requestedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return [
    'IDEA LAB — New Student Login',
    `Name: ${params.displayName}`,
    `Email: ${params.email}`,
    `Request ID: ${params.requestId}`,
    `Requested at: ${formattedTime}`,
    'Status: PENDING APPROVAL',
  ].join('\n');
}

/**
 * Development mock WhatsApp adapter.
 * Ready to be swapped for a Firebase Cloud Function / WhatsApp Business Cloud API webhook.
 */
export const mockWhatsAppAdapter: WhatsAppNotificationAdapter = {
  async sendToCoordinator(payload: WhatsAppSendPayload): Promise<WhatsAppSendResult> {
    if (payload.simulateFailure) {
      return {
        success: false,
        error: 'WhatsApp webhook timeout (simulated delivery failure). Membership request preserved for retry.',
      };
    }

    return {
      success: true,
      providerMessageId: `wa_dev_${payload.requestId}_${Date.now()}`,
    };
  },
};
