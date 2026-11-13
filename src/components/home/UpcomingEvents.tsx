import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { HOME_DEMO_EVENTS } from '../../data/homeDemoData';
import { SafeMediaImage } from './SafeMediaImage';

export const UpcomingEvents: React.FC = () => {
  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4.5 h-4.5 text-[#E63946] shrink-0" />
          <h2 className="text-[15px] font-bold text-[#202124] truncate">
            Upcoming Events
          </h2>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:underline shrink-0"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {HOME_DEMO_EVENTS.map((event) => (
          <Link
            key={event.id}
            to="/events"
            className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] border border-[#EAE6E1] p-2.5 transition-colors group"
          >
            <SafeMediaImage
              src={event.thumbnail}
              alt={event.title}
              fallbackLabel={event.month}
              lazy
              className="w-16 h-14 rounded-xl object-cover shrink-0 border border-[#EAE6E1]"
            />

            <div className="w-10 h-12 rounded-xl bg-white border border-[#EAE6E1] flex flex-col items-center justify-center shrink-0">
              <span className="text-[9px] font-extrabold text-[#E63946] tracking-wider uppercase leading-none">
                {event.month}
              </span>
              <span className="text-base font-extrabold text-[#202124] leading-tight mt-0.5 tabular-nums">
                {event.day}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-[#202124] group-hover:text-[#E63946] transition-colors truncate">
                {event.title}
              </h3>
              <p className="text-[11px] text-[#777777] mt-0.5 truncate">
                {event.location} · {event.timeRange}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="w-8 h-8 rounded-full bg-white border border-[#EAE6E1] text-[#E63946] group-hover:bg-[#E63946] group-hover:text-white flex items-center justify-center shrink-0 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
