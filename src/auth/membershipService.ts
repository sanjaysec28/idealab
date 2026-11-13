import { mockMembershipService } from '../data/mock/mockMembershipService';

/**
 * Membership Service facade.
 * Swap mockMembershipService with a Firestore adapter when Firebase credentials are provisioned.
 */
export const membershipService = mockMembershipService;
