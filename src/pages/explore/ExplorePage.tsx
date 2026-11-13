import React from 'react';
import { ASSETS } from '../../utils/assets';
import { Cpu, Wrench, Printer, Radio, CheckCircle, Clock } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const labEquipment = [
    { name: 'Bambu Lab X1 Carbon 3D Printers', status: 'Available (4/6)', icon: Printer, location: 'Makerspace Zone A' },
    { name: 'High-End AI GPU Workstations (RTX 4090)', status: 'In Use (2/4)', icon: Cpu, location: 'AI Research Lab' },
    { name: 'Keysight Digital Storage Oscilloscopes', status: 'Available (8/10)', icon: Radio, location: 'Electronics Bench 3' },
    { name: 'Epilog Laser Cutter 60W', status: 'Available (1/1)', icon: Wrench, location: 'Prototyping Bay B' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#202124]">Explore IDEA Lab Facilities</h1>
        <p className="text-xs text-[#777777] mt-1">Discover campus labs, makerspace equipment availability, and prototyping resources.</p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm">
          <div className="h-48 overflow-hidden">
            <img src={ASSETS.campus.makerspace} alt="Makerspace" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 space-y-3">
            <span className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider">Hardware & Prototyping</span>
            <h3 className="text-lg font-bold text-[#202124]">IDEA Lab Central Makerspace</h3>
            <p className="text-xs text-[#777777] leading-relaxed">
              Equipped with advanced 3D printers, CNC routers, PCB milling machines, and soldering stations for all registered SEC engineering students.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm">
          <div className="h-48 overflow-hidden">
            <img src={ASSETS.campus.ideaLabInterior} alt="AI & IoT Lab" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 space-y-3">
            <span className="text-[10px] font-bold text-[#32B878] uppercase tracking-wider">AI & Embedded Systems</span>
            <h3 className="text-lg font-bold text-[#202124]">AI Research & IoT Prototyping Lab</h3>
            <p className="text-xs text-[#777777] leading-relaxed">
              Dedicated high-performance GPU clusters for machine learning training and IoT microcontroller testbenches (ESP32, Arduino, Raspberry Pi 5).
            </p>
          </div>
        </div>
      </div>

      {/* Live Equipment Status */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#202124]">Live Equipment Availability</h3>
          <span className="text-xs text-[#32B878] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#32B878] rounded-full animate-pulse" />
            Live Sensors Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labEquipment.map((item, idx) => {
            const Icon = item.icon;
            const isAvail = item.status.includes('Available');
            return (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EEEEEE] flex items-center justify-center text-[#E63946] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#202124]">{item.name}</h4>
                    <p className="text-[10px] text-[#777777]">{item.location}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${isAvail ? 'bg-[#32B878]/10 text-[#32B878] border-[#32B878]/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                  {item.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
