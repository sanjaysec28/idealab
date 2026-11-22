import { auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function unwrapRawErrorText(rawMessage: string): string {
  const trimmed = rawMessage.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<FirestoreErrorInfo>;
      if (typeof parsed.error === 'string' && parsed.error.trim().length > 0) {
        return parsed.error.trim();
      }
    } catch {
      // Not valid JSON; treat as plain message
    }
  }
  return trimmed;
}

/**
 * Converts any Firebase / Firestore / Auth error (including serialized FirestoreErrorInfo JSON)
 * into a clean, user-friendly message without exposing UIDs, tokens, paths, or raw Firebase objects.
 */
export function getFriendlyFirebaseErrorMessage(
  error: unknown,
  fallbackMessage = 'Unable to complete this request right now. Please try again.'
): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  if (!raw) {
    return fallbackMessage;
  }

  const normalized = unwrapRawErrorText(raw);
  const lower = normalized.toLowerCase();

  if (
    lower.includes('missing or insufficient permissions') ||
    lower.includes('permission-denied') ||
    lower.includes('permission denied')
  ) {
    return 'We could not save your changes right now due to an account permission check. Please refresh the page or sign in again with Google.';
  }

  if (
    lower.includes('unauthenticated') ||
    lower.includes('session expired') ||
    lower.includes('requires-recent-login') ||
    lower.includes('token-revoked') ||
    lower.includes('user-token-expired')
  ) {
    return 'Your session expired. Please sign in again with Google.';
  }

  if (
    lower.includes('client is offline') ||
    lower.includes('network-request-failed') ||
    lower.includes('unavailable') ||
    lower.includes('failed to get document because the client is offline')
  ) {
    return 'Network connection issue while connecting to IDEA LAB. Please check your internet connection and try again.';
  }

  if (lower.includes('quota exceeded') || lower.includes('resource-exhausted')) {
    return 'Service quota temporarily reached. Please try again later.';
  }

  // Never leak raw JSON blobs, FirebaseError prefixes, UIDs, or internal stack/auth metadata
  if (
    normalized.startsWith('{') ||
    lower.includes('firebaseerror') ||
    lower.includes('authinfo') ||
    lower.includes('userid') ||
    lower.includes('providerinfo') ||
    lower.includes('operationtype') ||
    lower.includes('students/')
  ) {
    return fallbackMessage;
  }

  return normalized;
}

