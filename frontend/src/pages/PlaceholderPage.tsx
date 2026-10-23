import { useState } from "react";
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
  CheckCircle2,
  Plus,
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
  const [connected, setConnected] = useState<string[]>([]);
  return (
    <div>
      <PageHeading title={page.title} description={page.description} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {page.items.map((item, index) => (
          <Card key={item}>
            <CardHeader>
              <span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-brand-600 dark:bg-rose-950">
                <Icon size={19} />
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                0{index + 1}
              </span>
            </CardHeader>
            <CardContent className="pt-3">
              <h2 className="font-semibold text-[var(--text)]">{item}</h2>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                {page.title === "Social accounts"
                  ? "Connection status and publishing permissions will be managed here."
                  : "This section is scaffolded and ready for backend integration."}
              </p>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => {
                  if (page.title === "Social accounts") {
                    setConnected((current) =>
                      current.includes(item)
                        ? current.filter((entry) => entry !== item)
                        : [...current, item],
                    );
                    toast.success(
                      connected.includes(item)
                        ? `${item} disconnected in mock UI`
                        : `${item} connected in mock UI`,
                    );
                  } else if (page.title === "Agent & API") {
                    void navigator.clipboard?.writeText(
                      "POSTFLOW_MOCK_API_KEY",
                    );
                    toast.success("Mock API key copied");
                  } else
                    toast(`${item}: backend integration will be added later.`);
                }}
              >
                {page.title === "Social accounts" ? (
                  connected.includes(item) ? (
                    <>
                      <CheckCircle2 size={15} /> Connected (mock)
                    </>
                  ) : (
                    <>
                      <Plus size={15} /> Connect account
                    </>
                  )
                ) : page.title === "Agent & API" ? (
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
