'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/auth/actions';
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
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const urlError = searchParams.get('error');

    const handleLogin = async () => {
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            await loginAction({ email, password });
            // Server action will handle redirect
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin();
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
                    <div className="space-y-4">
                        {(error || urlError) && (
                            <Alert variant="destructive">
                                <AlertDescription>{error || urlError}</AlertDescription>
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
                                onKeyDown={handleKeyDown}
                                required
                                disabled={isLoading}
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
                                onKeyDown={handleKeyDown}
                                required
                                disabled={isLoading}
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
                            type="button"
                            className="w-full"
                            disabled={isLoading}
                            onClick={handleLogin}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    </div>

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
