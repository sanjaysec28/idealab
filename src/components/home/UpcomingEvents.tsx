import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Calendar } from 'lucide-react';
import {
  PublishedEvent,
  subscribeToUpcomingEvents,
} from '../../services/homeDataService';
import { SafeMediaImage } from './SafeMediaImage';

export const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<PublishedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = subscribeToUpcomingEvents(
      (items) => {
        setEvents(items.slice(0, 3));
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Unable to load upcoming events.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

      {error ? (
        <div
          role="alert"
          className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-3.5 flex items-start gap-2 text-xs text-[#E63946]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-[11px]">{error}</span>
        </div>
      ) : isLoading ? (
        <div className="space-y-2.5 animate-pulse" aria-busy="true">
          <div className="h-18 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1]" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 text-center space-y-2">
          <p className="text-xs font-bold text-[#202124]">No upcoming events scheduled</p>
          <p className="text-[11px] text-[#777777]">
            Published IDEA LAB workshops and hackathons will appear here.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:underline"
          >
            <span>Browse Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((event) => (
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
                {typeof event.registeredCount === 'number' && typeof event.capacity === 'number' && (
                  <p className="text-[10px] font-medium text-[#555555] mt-0.5 tabular-nums">
                    {event.registeredCount}/{event.capacity} registered
                  </p>
                )}
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
      )}
    </section>
  );
};
