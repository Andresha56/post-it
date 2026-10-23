import { useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
} from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Post } from "../../types";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
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

const fallbackEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "Product launch",
    start: new Date(2026, 9, 5, 9),
    end: new Date(2026, 9, 5, 9, 30),
    resource: {
      id: "e1",
      title: "Product launch",
      platform: "Instagram",
      status: "Scheduled",
      scheduledAt: new Date(2026, 9, 5, 9).toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    },
  },
  {
    id: "e2",
    title: "Building in public",
    start: new Date(2026, 9, 7, 11),
    end: new Date(2026, 9, 7, 11, 30),
    resource: {
      id: "e2",
      title: "Building in public",
      platform: "X",
      status: "Scheduled",
      scheduledAt: new Date(2026, 9, 7, 11).toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    },
  },
  {
    id: "e3",
    title: "Weekly update",
    start: new Date(2026, 9, 10, 13),
    end: new Date(2026, 9, 10, 13, 30),
    resource: {
      id: "e3",
      title: "Weekly update",
      platform: "YouTube",
      status: "Needs Review",
      scheduledAt: new Date(2026, 9, 10, 13).toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    },
  },
  {
    id: "e4",
    title: "Career advice",
    start: new Date(2026, 9, 19, 10),
    end: new Date(2026, 9, 19, 10, 30),
    resource: {
      id: "e4",
      title: "Career advice",
      platform: "LinkedIn",
      status: "Scheduled",
      scheduledAt: new Date(2026, 9, 19, 10).toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    },
  },
  {
    id: "e5",
    title: "Behind the scenes",
    start: new Date(2026, 9, 16, 16),
    end: new Date(2026, 9, 16, 16, 30),
    resource: {
      id: "e5",
      title: "Behind the scenes",
      platform: "Instagram",
      status: "Draft",
      scheduledAt: new Date(2026, 9, 16, 16).toISOString(),
      views: 0,
      likes: 0,
      comments: 0,
    },
  },
];

const statusColors: Record<string, string> = {
  Published: "#10b981",
  Scheduled: "#3b82f6",
  Draft: "#94a3b8",
  "Needs Review": "#f97316",
  Failed: "#ef4444",
};

export function ContentCalendar({
  posts,
  onCreate,
}: {
  posts: Post[];
  onCreate: () => void;
}) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date(2026, 9, 21));
  const events = useMemo<CalendarEvent[]>(() => {
    const fromPosts = posts
      .filter((post) => post.scheduledAt || post.publishedAt)
      .map((post) => {
        const start = new Date(post.scheduledAt ?? post.publishedAt!);
        return {
          id: post.id,
          title: post.title,
          start,
          end: new Date(start.getTime() + 30 * 60 * 1000),
          resource: post,
        };
      });
    return [...fallbackEvents, ...fromPosts];
  }, [posts]);

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex-wrap items-center">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-brand-600 dark:bg-rose-950">
            <CalendarDaysIcon />
          </span>
          <div>
            <h2 className="font-bold text-[var(--text)]">Content Calendar</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              View and manage your upcoming posts
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="size-9"
            aria-label="Previous period"
            onClick={() => setDate((current) => subMonths(current, 1))}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="min-w-[110px] text-center text-xs font-semibold text-[var(--text)]">
            {format(date, "MMMM yyyy")}
          </span>
          <Button
            variant="secondary"
            size="icon"
            className="size-9"
            aria-label="Next period"
            onClick={() => setDate((current) => addMonths(current, 1))}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDate(new Date())}
          >
            Today
          </Button>
          <div className="flex rounded-xl bg-[var(--surface-muted)] p-1">
            {(["month", "week", "day", "agenda"] as View[]).map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={`rounded-lg px-2 py-1.5 text-[11px] capitalize ${view === item ? "bg-brand-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
              >
                {item === "agenda" ? "List" : item}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={onCreate}>
            <Plus size={14} /> Create
          </Button>
        </div>
      </CardHeader>
      <CardContent className="mt-4">
        <div className="calendar-shell h-[390px] sm:h-[450px]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
            onSelectEvent={(event) =>
              window.alert(
                `${event.title}\nStatus: ${event.resource.status}\nPlatform: ${event.resource.platform}`,
              )
            }
            eventPropGetter={(event) => ({
              style: {
                backgroundColor:
                  statusColors[event.resource.status] ?? "#e83f63",
                border: 0,
                borderRadius: 6,
                color: "#fff",
                fontSize: 11,
                padding: "2px 5px",
              },
            })}
            popup
            views={["month", "week", "day", "agenda"]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CalendarDaysIcon() {
  return (
    <span className="text-lg" aria-hidden="true">
      ▦
    </span>
  );
}
