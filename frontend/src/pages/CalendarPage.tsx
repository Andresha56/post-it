import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../lib/mockApi";
import { ContentCalendar } from "../components/dashboard/ContentCalendar";
import { PageHeading } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";

export function CalendarPage() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: mockApi.getPosts,
  });
  return (
    <div>
      <PageHeading
        title="Content calendar"
        description="
      Plan and manage your publishing schedule."
        actions={
          <Button onClick={() => navigate("/create")}>
            <Plus size={16} />
            Create post
          </Button>
        }
      />
      {isLoading ? (
        <p className="py-10 text-sm text-[var(--text-muted)]">
          Loading calendar…
        </p>
      ) : (
        <ContentCalendar posts={data} onCreate={() => navigate("/create")} />
      )}
    </div>
  );
}
