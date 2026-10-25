import { useLocation } from "react-router-dom";
import {
  Activity,
  ChartNoAxesCombined,
  Code2,
  Image,
  Link2,
  Settings,
  Sparkles,
  Users,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeading } from "../components/layout/AppLayout";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const content: Record<
  string,
  { title: string; description: string; icon: typeof Activity; items: string[] }
> = {
  "/media": {
    title: "Media library",
    description: "Keep your creative assets organized in one place.",
    icon: Image,
    items: ["Brand images", "Product photos", "Campaign creatives"],
  },
  "/analytics": {
    title: "Analytics",
    description:
      "Understand your reach, engagement, and publishing performance.",
    icon: ChartNoAxesCombined,
    items: ["Audience growth", "Engagement trends", "Top-performing posts"],
  },
  "/ai-studio": {
    title: "AI Studio",
    description: "Plan campaigns and develop platform-ready content.",
    icon: Sparkles,
    items: ["Campaign planner", "Caption assistant", "Content repurposing"],
  },
  "/social-accounts": {
    title: "Social accounts",
    description: "Manage the social channels connected to your workspace.",
    icon: Link2,
    items: ["Instagram", "LinkedIn", "X", "TikTok", "YouTube"],
  },
  "/team": {
    title: "Team & approvals",
    description:
      "Collaborate with your team and review posts before publishing.",
    icon: Users,
    items: ["Workspace members", "Pending approvals", "Roles and permissions"],
  },
  "/agent-api": {
    title: "Agent & API",
    description: "Connect tools and build controlled AI-powered workflows.",
    icon: Code2,
    items: ["REST API", "MCP tools", "API keys and webhooks"],
  },
  "/settings": {
    title: "Settings",
    description: "Manage workspace preferences and account settings.",
    icon: Settings,
    items: ["Workspace profile", "Notifications", "Security and preferences"],
  },
};

export function PlaceholderPage() {
  const location = useLocation();
  const page = content[location.pathname] ?? content["/settings"];
  const Icon = page.icon;
  return (
    <div>
      <PageHeading title={page.title} description={page.description} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {page.items.map((item) => (
          <Card key={item}>
            <CardHeader>
              <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                <Icon size={16} />
              </span>
            </CardHeader>
            <CardContent className="pt-3">
              <h2 className="text-sm font-semibold text-[var(--text)]">{item}</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                This section is scaffolded and ready for backend integration.
              </p>
              <Button
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => {
                  if (page.title === "Agent & API") {
                    void navigator.clipboard?.writeText(
                      "POSTFLOW_MOCK_API_KEY",
                    );
                    toast.success("Mock API key copied");
                  } else
                    toast(`${item}: backend integration will be added later.`);
                }}
              >
                {page.title === "Agent & API" ? (
                  <>
                    <Copy size={15} /> Copy mock key
                  </>
                ) : (
                  "Open section"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
