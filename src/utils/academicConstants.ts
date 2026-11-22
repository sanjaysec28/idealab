export const DEGREES = [
  'B.E.',
  'B.Tech.',
  'M.E.',
  'M.Tech.',
  'MBA',
  'M.C.A.',
] as const;

export const DEPARTMENTS = [
  'AI & Data Science',
  'AI & Machine Learning',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Robotics & Automation',
  'Biomedical Engineering',
  'Civil Engineering',
  'Cyber Security',
  'Chemical Engineering',
  'Agricultural Engineering',
  'Medical Electronics',
  'Computer Science & Business Systems',
] as const;

export const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
] as const;

export const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
] as const;

export const REGISTRATION_NUMBER_REGEX = /^[A-Z0-9-]{4,32}$/;
export const PHONE_NUMBER_REGEX = /^[0-9+\-\s()]{7,24}$/;

export function normalizeRegistrationNumber(raw: string | undefined | null): string {
  return (raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function isValidRegistrationNumber(raw: string | undefined | null): boolean {
  const normalized = normalizeRegistrationNumber(raw);
  return REGISTRATION_NUMBER_REGEX.test(normalized);
}

export function isValidPhoneNumber(raw: string | undefined | null): boolean {
  const trimmed = (raw ?? '').trim();
  return PHONE_NUMBER_REGEX.test(trimmed);
}
