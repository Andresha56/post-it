
import { useMemo, useState } from 'react';
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
} from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

import type { Post } from '../../types';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlatformIcon } from '../orbit-landing/Platforms';
import { normalizeValue, statusColors } from '../../constant/content';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Post;
};

const parseDate = (value: string | number | Date | null | undefined) => {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : new Date(
          typeof value === 'string' && /^\d+$/.test(value)
            ? Number(value)
            : value,
        );

  return Number.isNaN(date.getTime()) ? null : date;
};


function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const platforms = event.resource.platforms ?? [];

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <div className="flex shrink-0 items-center gap-0.5">
        {platforms.slice(0, 3).map((platform, index) => (
          <span
            key={`${platform}-${index}`}
            className="flex size-4 items-center justify-center rounded-full bg-white"
            title={platform}
          >
            <PlatformIcon platform={platform} />
          </span>
        ))}
      </div>

      <span className="truncate">{event.title}</span>
    </div>
  );
}

export function ContentCalendar({
  posts,
  onCreate,
  onSelectPost,
}: {
  posts: Post[];
  onCreate: () => void;
  // Opens the post's view / edit / delete actions; without it a summary is shown.
  onSelectPost?: (id: string) => void;
}) {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const events = useMemo<CalendarEvent[]>(
    () =>
      posts.flatMap((post) => {
        const start = parseDate(post.scheduledAt ?? post.publishedAt);

        if (!start) return [];

        return [
          {
            id: post.id,
            title: post.title || 'Untitled post',
            start,
            end: new Date(start.getTime() + 30 * 60 * 1000),
            resource: post,
          },
        ];
      }),
    [posts],
  );

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex-wrap items-center">
        <CardTitle
          title="Content calendar"
          description="View and manage your upcoming posts"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            aria-label="Previous period"
            onClick={() => setDate((current) => subMonths(current, 1))}
          >
            <ChevronLeft size={15} />
          </Button>

          <span className="min-w-[104px] text-center text-sm font-medium tabular-nums text-[var(--text)]">
            {format(date, 'MMMM yyyy')}
          </span>

          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            aria-label="Next period"
            onClick={() => setDate((current) => addMonths(current, 1))}
          >
            <ChevronRight size={15} />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8"
            onClick={() => setDate(new Date())}
          >
            Today
          </Button>

          <div
            role="tablist"
            aria-label="Calendar view"
            className="flex rounded-lg bg-[var(--surface-muted)] p-0.5"
          >
            {(['month', 'week', 'day', 'agenda'] as View[]).map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={view === item}
                onClick={() => setView(item)}
                className={`h-7 rounded-md px-2.5 text-xs font-medium capitalize transition-colors ${
                  view === item
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {item === 'agenda' ? 'List' : item}
              </button>
            ))}
          </div>

          <Button size="sm" className="h-8" onClick={onCreate}>
            <Plus size={14} />
            Create
          </Button>
        </div>
      </CardHeader>

      <CardContent className="mt-3">
        <div className="calendar-shell h-[390px] sm:h-[450px]">
          <BigCalendar<CalendarEvent>
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
            components={{
              event: CalendarEventItem,
            }}
            onSelectEvent={(event) => {
              if (onSelectPost) return onSelectPost(event.resource.id);
              window.alert(
                `${event.title}\nStatus: ${event.resource.status}\nPlatforms: ${event.resource.platforms?.join(', ') || 'None'}`,
              );
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor:
                  statusColors[normalizeValue(event.resource.status)] ??
                  'rgb(var(--primary))',
                border: 0,
                borderRadius: 4,
                color: 'rgb(var(--primary-foreground))',
                fontSize: 11,
                padding: '2px 5px',
              },
            })}
            popup
            views={['month', 'week', 'day', 'agenda']}
          />
        </div>
      </CardContent>
    </Card>
  );
}
