
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Activity } from "lucide-react";

// This function now fetches real, protected data from our API route.
async function getAdminStats() {
  try {
    // 1. Construct the full URL for server-side fetching
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/admin/stats`;

    // 2. Forward cookies to the API route for authentication
    const response = await fetch(url, {
      headers: {
        Cookie: cookies().toString(),
      },
      // Revalidate data every 5 minutes to keep it fresh but not overload the DB
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(`Failed to fetch admin stats: ${response.statusText}`);
      // Return zeroed stats on failure to prevent the page from crashing
      return { totalUsers: 0, totalPosts: 0, activeToday: 0 };
    }

    return await response.json();

  } catch (error) {
    console.error("Error in getAdminStats:", error);
    return { totalUsers: 0, totalPosts: 0, activeToday: 0 };
  }
};

export default async function AdminDashboardPage() {
  // The component fetches data on the server before rendering
  const stats = await getAdminStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All registered users in the system.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All posts created by users.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.activeToday.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Users who have logged in today.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}