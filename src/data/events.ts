import { EventItem } from '../types';
import { ASSETS, getEventImage } from '../utils/assets';

export const EVENTS: EventItem[] = [
  {
    id: 'event-1',
    title: 'Generative AI & LLM Application Workshop',
    description: 'Hands-on masterclass on building RAG applications and multimodal AI agents using the Google Gemini SDK and TypeScript.',
    date: 'Nov 18, 2026',
    time: '02:00 PM - 05:00 PM',
    location: 'IDEA Lab Main Hall, Academic Block 3',
    category: 'Workshop',
    banner: getEventImage(0),
    capacity: 70,
    registeredCount: 58,
    isRegistered: true,
    speaker: {
      name: 'Dr. Rajesh Kumar',
      role: 'Head of AI Research, Saveetha',
      avatar: ASSETS.students[1]
    }
  },
  {
    id: 'event-2',
    title: 'SEC Annual 24-Hour IoT Hackathon 2026',
    description: 'Build innovative hardware and software solutions to solve real-world smart campus challenges. Exciting cash prizes and mentorship!',
    date: 'Nov 25-26, 2026',
    time: '10:00 AM onwards',
    location: 'Central Auditorium & IDEA Lab',
    category: 'Hackathon',
    banner: getEventImage(1),
    capacity: 120,
    registeredCount: 94,
    isRegistered: false,
    speaker: {
      name: 'Guest Innovators',
      role: 'Industry Tech Leaders',
      avatar: ASSETS.students[2]
    }
  },
  {
    id: 'event-3',
    title: 'PCB Design & SMD Soldering Masterclass',
    description: 'Learn professional schematic capture, PCB layout routing in KiCad, and hands-on surface mount device soldering.',
    date: 'Dec 02, 2026',
    time: '03:00 PM - 05:30 PM',
    location: 'Electronics Prototyping Lab, IDEA Lab',
    category: 'Workshop',
    banner: getEventImage(2),
    capacity: 40,
    registeredCount: 38,
    isRegistered: false,
    speaker: {
      name: 'Prof. Anitha Ramesh',
      role: 'ECE Faculty Lead',
      avatar: ASSETS.students[3]
    }
  },
  {
    id: 'event-4',
    title: 'Student Project Demo Day & Investor Meet',
    description: 'Showcase your semester projects to visiting industry experts, alumni entrepreneurs, and incubation partners.',
    date: 'Dec 15, 2026',
    time: '09:30 AM - 01:00 PM',
    location: 'Saveetha Convention Center',
    category: 'Demo Day',
    banner: getEventImage(3),
    capacity: 200,
    registeredCount: 142,
    isRegistered: true,
    speaker: {
      name: 'SEC Alumni Panel',
      role: 'Startup Founders & CTOs',
      avatar: ASSETS.students[4]
    }
  }
];
