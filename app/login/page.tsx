'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User, Shield, Crown } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'user' | 'staff' | 'admin'>('user');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const login = useLogin();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await login.mutateAsync({ email, password });
            
            console.log('Login response:', response);
            
            // Get the actual user role from the API response
            const userRole = response.user?.role || role;
            console.log('User role from API:', userRole);
            
            // Redirect based on actual user role
            const dashboardUrl = getDashboardUrl(userRole);
            console.log('Redirecting to:', dashboardUrl);
            
            // Use router.replace for client-side navigation
            router.replace(redirect.startsWith('/dashboard') ? redirect : dashboardUrl);
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
        }
    };

    const getDashboardUrl = (userRole: string) => {
        switch (userRole) {
            case 'admin':
                return '/dashboard/admin';
            case 'staff':
                return '/dashboard/staff';
            case 'user':
                return '/dashboard/user';
            default:
                return '/dashboard/user';
        }
    };

    const getRoleIcon = (roleType: string) => {
        switch (roleType) {
            case 'admin':
                return <Crown className="h-4 w-4" />;
            case 'staff':
                return <Shield className="h-4 w-4" />;
            case 'user':
                return <User className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    const getRoleDescription = (roleType: string) => {
        switch (roleType) {
            case 'admin':
                return 'Full system access and management';
            case 'staff':
                return 'Member management and training';
            case 'user':
                return 'Personal fitness tracking';
            default:
                return 'Personal fitness tracking';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Gym Management System</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form  onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}


                        <div className="space-y-2">
                            <Label htmlFor="role">Account Type</Label>
                            <Select value={role} onValueChange={(value: 'user' | 'staff' | 'admin') => setRole(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">Member</div>
                                                <div className="text-xs text-muted-foreground">Personal fitness tracking</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="staff">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">Staff</div>
                                                <div className="text-xs text-muted-foreground">Member management and training</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <Crown className="h-4 w-4" />
                                            <div>
                                                <div className="font-medium">Admin</div>
                                                <div className="text-xs text-muted-foreground">Full system access</div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={login.isPending}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={login.isPending}
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                                {getRoleIcon(role)}
                                <span className="font-medium capitalize">{role} Account</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {getRoleDescription(role)}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={login.isPending}
                        >
                            {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Button variant="link" className="p-0 h-auto">
                                Contact your administrator
                            </Button>
                        </p>
                        
                        {/* Debug button - remove in production */}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                                console.log('Current localStorage:', {
                                    authToken: localStorage.getItem('authToken'),
                                    authUser: localStorage.getItem('auth-user'),
                                });
                            }}
                        >
                            Debug localStorage
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
