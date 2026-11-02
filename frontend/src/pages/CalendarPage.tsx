import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ContentCalendar } from "../components/dashboard/ContentCalendar";
import { PageHeading } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Plus } from "lucide-react";
import { graphqlRequest } from "../lib/graphqlClient";
import type { ContentListData } from "../constant/content";
import { GET_CONTENTS } from "../queries/content";

export function CalendarPage() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ["posts"],
   queryFn: async () => {
         const response = await graphqlRequest<ContentListData>(
           GET_CONTENTS,
           { page: 1, limit: 100 },
         );
   
         const result = response.getContents;
   
         if (!result.success) {
           throw new Error(result.message || 'Could not load content.');
         }
   
         return result.contents;
       },
  });
  console.log("data", data);
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
        <ContentCalendar posts={data as any} onCreate={() => navigate("/create")} />
      )}
    </div>
  );
}
