import { dashboardSchema, type DashboardData } from '../types';

const delay = (ms = 260) => new Promise((resolve) => window.setTimeout(resolve, ms));

const mockDashboard: DashboardData = {
  metrics: [
    { id: 'followers', label: 'Total Followers', value: '128.4K', change: '12.5%', trend: 'up', icon: 'users' },
    { id: 'reach', label: 'Post Reach', value: '342.1K', change: '8.2%', trend: 'up', icon: 'reach' },
    { id: 'engagement', label: 'Engagement Rate', value: '6.8%', change: '2.4%', trend: 'up', icon: 'heart' },
    { id: 'published', label: 'Published Posts', value: '42', change: '16.7%', trend: 'up', icon: 'send' }
  ],
posts: [] 
};


export const mockApi = {
  async getDashboard(): Promise<DashboardData> {
    await delay();
    return dashboardSchema.parse({ ...mockDashboard });
  },
};
