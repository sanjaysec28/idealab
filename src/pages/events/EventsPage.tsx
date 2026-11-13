import React, { useState } from 'react';
import { EVENTS } from '../../data/events';
import { EventItem } from '../../types';
import { Calendar, MapPin, Clock, Users, Check, Sparkles } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>(EVENTS);

  const handleToggleRSVP = (id: string) => {
    setEvents(events.map(ev => {
      if (ev.id === id) {
        const isReg = !ev.isRegistered;
        return {
          ...ev,
          isRegistered: isReg,
          registeredCount: isReg ? ev.registeredCount + 1 : ev.registeredCount - 1
        };
      }
      return ev;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#202124]">Workshops, Hackathons & Tech Talks</h1>
        <p className="text-xs text-[#777777] mt-1">Register for hands-on technical masterclasses at Saveetha IDEA Lab.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#202124] text-[10px] font-bold px-3 py-1 rounded-full border border-[#EEEEEE]">
                {event.category}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs font-semibold text-[#E63946]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#777777]">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#202124]">{event.title}</h3>
                <p className="text-xs text-[#777777] leading-relaxed">{event.description}</p>

                <div className="flex items-center gap-2 text-xs text-[#777777] pt-1">
                  <MapPin className="w-4 h-4 text-[#E63946]" />
                  <span>{event.location}</span>
                </div>

                {event.speaker && (
                  <div className="flex items-center gap-3 pt-3 border-t border-[#EEEEEE]">
                    <img src={event.speaker.avatar} alt={event.speaker.name} className="w-8 h-8 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-[#202124]">{event.speaker.name}</p>
                      <p className="text-[10px] text-[#777777]">{event.speaker.role}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
                <span className="text-xs font-medium text-[#777777] flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.registeredCount}/{event.capacity} Registered
                </span>

                <button
                  onClick={() => handleToggleRSVP(event.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    event.isRegistered
                      ? 'bg-[#32B878]/10 text-[#32B878] border border-[#32B878]/30'
                      : 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-md shadow-[#E63946]/20'
                  }`}
                >
                  {event.isRegistered ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Registered</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Register Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
