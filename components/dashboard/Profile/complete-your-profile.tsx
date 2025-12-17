'use client';

import { useEffect, useState, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usersApi } from '@/lib/api/services/users/users';

export function CompleteYourProfileCard() {
  const [progressValue, setProgressValue] = useState<number>(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ⭐ Wrap fetch function in useCallback
  const fetchProfileCompleteness = useCallback(async () => {
    console.log('🔹 Running fetchProfileCompleteness...');
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('currentUser');

      console.log('🔹 Token:', authToken);
      console.log('🔹 User:', userData);

      if (!authToken || !userData) {
        console.warn('⚠️ Missing user or token — skipping API call.');
        setLoading(false);
        return;
      }

      const currentUser = JSON.parse(userData);
      console.log('🔹 Calling API for user ID:', currentUser._id);

      const response = await usersApi.getProfileCompleteness(currentUser, authToken);
      console.log('✅ API Response:', response);

      // ✅ Access the correct nested structure
      const completeness = response?.data?.data?.completeness ?? 0;
      const missing = response?.data?.data?.missingFields ?? [];

      setProgressValue(completeness);
      setMissingFields(missing);
    } catch (error) {
      console.error('❌ Error fetching profile completeness:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ Initial load
  useEffect(() => {
    fetchProfileCompleteness();
  }, [fetchProfileCompleteness]);

  // ⭐ Listen for user switch / auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('🔄 User switched, refreshing profile completeness...');
      fetchProfileCompleteness();
    };

    // Listen to auth-changed event
    window.addEventListener('auth-changed', handleAuthChange);
    
    // Also listen to storage event for cross-tab changes
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [fetchProfileCompleteness]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        {loading ? (
          <CardDescription>Loading progress...</CardDescription>
        ) : missingFields.length > 0 ? (
          <CardDescription>Missing: {missingFields.join(', ')}</CardDescription>
        ) : (
          // <CardDescription>Your profile is complete! 🎉</CardDescription>
          <></>
        )}
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        <Progress value={progressValue} />
        <div className="text-muted-foreground text-sm">%{progressValue}</div>
      </CardContent>
    </Card>
  );
}