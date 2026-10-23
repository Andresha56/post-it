import { dashboardSchema, postSchema, type CreatePostInput, type DashboardData, type Post } from '../types';

const delay = (ms = 260) => new Promise((resolve) => window.setTimeout(resolve, ms));

const mockDashboard: DashboardData = {
  metrics: [
    { id: 'followers', label: 'Total Followers', value: '128.4K', change: '12.5%', trend: 'up', icon: 'users' },
    { id: 'reach', label: 'Post Reach', value: '342.1K', change: '8.2%', trend: 'up', icon: 'reach' },
    { id: 'engagement', label: 'Engagement Rate', value: '6.8%', change: '2.4%', trend: 'up', icon: 'heart' },
    { id: 'published', label: 'Published Posts', value: '42', change: '16.7%', trend: 'up', icon: 'send' }
  ],
  posts: [
    { id: 'p1', title: '5 Productivity Tips for Remote Work', platform: 'Instagram', status: 'Published', publishedAt: '2026-10-20T09:00:00.000Z', imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=240&q=80', views: 1200, likes: 89, comments: 14 },
    { id: 'p2', title: 'Building a Better Tomorrow', platform: 'LinkedIn', status: 'Published', publishedAt: '2026-10-21T08:00:00.000Z', imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=240&q=80', views: 2400, likes: 162, comments: 28 },
    { id: 'p3', title: 'The Power of Consistency', platform: 'X', status: 'Scheduled', scheduledAt: '2026-10-24T12:00:00.000Z', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=240&q=80', views: 0, likes: 0, comments: 0 },
    { id: 'p4', title: 'Our New Feature is Live!', platform: 'YouTube', status: 'Draft', imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=240&q=80', views: 0, likes: 0, comments: 0 },
    { id: 'p5', title: 'Behind the Scenes', platform: 'Instagram', status: 'Needs Review', scheduledAt: '2026-10-26T10:00:00.000Z', imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=240&q=80', views: 0, likes: 0, comments: 0 }
  ]
};

let posts = mockDashboard.posts.map((post) => postSchema.parse(post));

export const mockApi = {
  async getDashboard(): Promise<DashboardData> {
    await delay();
    return dashboardSchema.parse({ ...mockDashboard, posts });
  },
  async getPosts(): Promise<Post[]> {
    await delay(180);
    return posts.map((post) => postSchema.parse(post));
  },
  async createPost(input: CreatePostInput): Promise<Post> {
    await delay(320);
    const post = postSchema.parse({
      id: `p-${crypto.randomUUID()}`,
      title: input.title,
      platform: input.platform,
      status: input.status,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt).toISOString() : undefined,
      views: 0, likes: 0, comments: 0
    });
    posts = [post, ...posts];
    return post;
  }
};
