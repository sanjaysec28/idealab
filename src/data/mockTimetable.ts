import { TimetableClassEntry } from '../types/timetable';

const NOW_ISO = '2026-11-13T08:00:00.000Z';

export const MOCK_DEMO_TIMETABLE_CLASSES: TimetableClassEntry[] = [
  {
    id: 'demo-19AI303',
    subjectCode: '19AI303',
    subjectName: 'Machine Learning',
    subjectAbbreviation: 'ML',
    facultyName: 'Dr. Kavitha R',
    days: ['mon', 'wed', 'fri'],
    scheduleByDay: {
      mon: ['slot-1', 'slot-3'],
      wed: ['slot-2'],
      fri: ['slot-1'],
    },
    isDemo: true,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'demo-19AI301',
    subjectCode: '19AI301',
    subjectName: 'Data Structures',
    subjectAbbreviation: 'DS',
    facultyName: 'Dr. Arun K',
    days: ['tue', 'thu', 'sat'],
    scheduleByDay: {
      tue: ['slot-1', 'slot-3'],
      thu: ['slot-2'],
      sat: ['slot-1'],
    },
    isDemo: true,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
  {
    id: 'demo-19AI305',
    subjectCode: '19AI305',
    subjectName: 'Database Management',
    subjectAbbreviation: 'DM',
    facultyName: 'Dr. Priya S',
    days: ['mon', 'tue', 'wed', 'thu'],
    scheduleByDay: {
      mon: ['slot-2'],
      tue: ['slot-4'],
      wed: ['slot-3'],
      thu: ['slot-4'],
    },
    isDemo: true,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
  },
];

export function cloneDemoTimetableClasses(): TimetableClassEntry[] {
  return MOCK_DEMO_TIMETABLE_CLASSES.map((cls) => ({
    ...cls,
    days: [...cls.days],
    scheduleByDay: Object.fromEntries(
      Object.entries(cls.scheduleByDay).map(([day, slots]) => [day, [...(slots ?? [])]])
    ),
  }));
}
