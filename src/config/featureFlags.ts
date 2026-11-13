/**
 * Feature Flags for IDEA LAB Student Application.
 *
 * Temporary Testing Mode:
 * - When `IS_TIMETABLE_TESTING_MODE` is `true`, verified students skip the
 *   membership request and coordinator approval screens and enter `/timetable`
 *   directly after completing Firebase email verification.
 * - Production coordinator approval routes, Firestore security rules, and
 *   membership records remain completely intact.
 * - Set `VITE_ENABLE_TIMETABLE_TESTING_MODE=false` (or omit in production builds)
 *   to restore the full coordinator-approved membership gate.
 */

const rawTestingFlag: unknown =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_ENABLE_TIMETABLE_TESTING_MODE
    : typeof process !== 'undefined'
    ? process.env.VITE_ENABLE_TIMETABLE_TESTING_MODE
    : undefined;

const isViteDev: boolean = Boolean(
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
);

export const IS_TIMETABLE_TESTING_MODE: boolean =
  rawTestingFlag !== undefined && rawTestingFlag !== ''
    ? String(rawTestingFlag).toLowerCase() === 'true'
    : isViteDev;
