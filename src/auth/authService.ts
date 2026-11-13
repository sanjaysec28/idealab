import { mockAuthService } from '../data/mock/mockAuthService';

/**
 * Auth Service facade.
 * Swap mockAuthService with a Firebase Auth adapter when Firebase credentials are provisioned.
 */
export const authService = mockAuthService;
