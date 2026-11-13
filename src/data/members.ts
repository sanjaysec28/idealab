import { Member } from '../types';
import { ASSETS, getStudentAvatar } from '../utils/assets';

const firstNames = [
  'Aarav', 'Ananya', 'Aditya', 'Diya', 'Rohan', 'Sneha', 'Karthik', 'Priya', 
  'Rahul', 'Kavya', 'Arjun', 'Meera', 'Vikram', 'Anjali', 'Varun', 'Pooja',
  'Siddharth', 'Divya', 'Nikhil', 'Tanvi', 'Akash', 'Shruti', 'Vishal', 'Neha',
  'Manoj', 'Swathi', 'Kiran', 'Deepika', 'Harish', 'Nandini', 'Ajay', 'Revathi',
  'Sanjay', 'Geetha', 'Vinoth', 'Yamini', 'Prabhu', 'Bhavana', 'Suresh', 'Keerthana'
];

const lastNames = [
  'Kumar', 'Sharma', 'Reddy', 'Patel', 'Iyer', 'Nair', 'Verma', 'Gupta',
  'Rao', 'Menon', 'Pillai', 'Choudhury', 'Joshi', 'Mehta', 'Sundaram', 'Murthy',
  'Krishnan', 'Subramanian', 'Ranganathan', 'Balakrishnan', 'Venkatesh', 'Raman',
  'Nataraian', 'Srinivasan', 'Raghavan', 'Swaminathan', 'Perumal', 'Arumugam'
];

const departments = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Information Technology',
  'Electronics & Communication Engg',
  'Electrical & Electronics Engg',
  'Mechanical Engineering',
  'Biomedical Engineering',
  'Civil Engineering'
];

const years: ('1st Year' | '2nd Year' | '3rd Year' | '4th Year')[] = [
  '1st Year', '2nd Year', '3rd Year', '4th Year'
];

const skillsList = [
  ['React', 'TypeScript', 'Node.js', 'Tailwind'],
  ['Python', 'TensorFlow', 'PyTorch', 'Data Analysis'],
  ['Arduino', 'IoT', 'C++', 'Circuit Design'],
  ['Flutter', 'Firebase', 'Mobile UI', 'Dart'],
  ['UI/UX', 'Figma', 'Prototyping', 'Design Systems'],
  ['ROS', 'Robotics', 'Python', 'Computer Vision'],
  ['Solidity', 'Web3', 'Smart Contracts', 'React'],
  ['Docker', 'AWS', 'Linux', 'DevOps']
];

const badges = ['Innovator', 'Master Maker', 'AI Pioneer', 'Community Lead', 'Hardware Guru', 'Code Ninja'];

export const MEMBERS: Member[] = Array.from({ length: 70 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index * 3) % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const dept = departments[index % departments.length];
  const yr = years[index % years.length];
  const avatar = getStudentAvatar(index);
  const skills = skillsList[index % skillsList.length];
  const rollNumber = `SEC2024${String(index + 101).padStart(3, '0')}`;
  
  return {
    id: `member-${index + 1}`,
    name,
    rollNumber,
    department: dept,
    year: yr,
    avatar,
    coverImage: ASSETS.campus.mainBuilding,
    bio: `Passionate student innovator at Saveetha Engineering College exploring ${skills[0]} and ${skills[1]}. Building impactful campus tech solutions.`,
    skills,
    projectsCount: (index % 4) + 1,
    ideasCount: (index % 3) + 1,
    points: 150 + ((index * 37) % 850),
    badge: badges[index % badges.length],
    github: `https://github.com/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    email: `${firstName.toLowerCase()}.${rollNumber.toLowerCase()}@saveetha.ac.in`
  };
});
