'use client';

import { AuthGuard } from '@/lib/middleware/auth-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Activity, Calendar, Clock, Dumbbell, MessageSquare, Bell } from 'lucide-react';
import { useAuth } from '@/lib/api/services/auth/context';

function StaffDashboardContent() {
  const { user } = useAuth();

  // Mock data - replace with actual API calls
  const stats = {
    totalMembers: 120,
    todayCheckins: 45,
    upcomingSessions: 8,
    completedWorkouts: 25,
    messages: 12,
    notifications: 5
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
          <Badge variant="secondary" className="mt-2">Staff</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">View Schedule</Button>
          <Button>Add Member</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active members under your care
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCheckins}</div>
            <p className="text-xs text-muted-foreground">
              Members checked in today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions scheduled today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              Workouts completed this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Management
            </CardTitle>
            <CardDescription>
              Manage your assigned members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">View All Members</Button>
              <Button className="w-full" variant="outline">Add New Member</Button>
              <Button className="w-full" variant="outline">Member Check-ins</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Workout Management
            </CardTitle>
            <CardDescription>
              Create and manage workout plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">Create Workout Plan</Button>
              <Button className="w-full" variant="outline">Exercise Library</Button>
              <Button className="w-full" variant="outline">Personal Training</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduling
            </CardTitle>
            <CardDescription>
              Manage your schedule and sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">View Schedule</Button>
              <Button className="w-full" variant="outline">Book Session</Button>
              <Button className="w-full" variant="outline">Set Availability</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>
            Your upcoming sessions and tasks for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '09:00 AM', client: 'John Smith', type: 'Personal Training', status: 'upcoming' },
              { time: '10:30 AM', client: 'Sarah Johnson', type: 'Fitness Assessment', status: 'upcoming' },
              { time: '02:00 PM', client: 'Mike Davis', type: 'Group Class', status: 'upcoming' },
              { time: '04:00 PM', client: 'Lisa Wilson', type: 'Personal Training', status: 'completed' },
            ].map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">{session.time}</div>
                  <div>
                    <p className="font-medium">{session.client}</p>
                    <p className="text-sm text-muted-foreground">{session.type}</p>
                  </div>
                </div>
                <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Messages & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages ({stats.messages})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 border rounded">
                <p className="text-sm font-medium">New member inquiry</p>
                <p className="text-xs text-muted-foreground">From: Sarah M.</p>
              </div>
              <div className="p-2 border rounded">
                <p className="text-sm font-medium">Workout plan feedback</p>
                <p className="text-xs text-muted-foreground">From: John D.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications ({stats.notifications})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 border rounded">
                <p className="text-sm font-medium">New member assigned</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <div className="p-2 border rounded">
                <p className="text-sm font-medium">Schedule change</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <StaffDashboardContent />
  );
}
