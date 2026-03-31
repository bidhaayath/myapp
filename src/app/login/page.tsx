
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isLogin) {
      initiateEmailSignIn(auth, email, password);
    } else {
      initiateEmailSignUp(auth, email, password);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFA] flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 mb-4 inline-block">
          <Sparkles className="w-8 h-8 text-secondary-foreground" />
        </div>
        <h1 className="text-4xl font-headline text-[#4A3F35]">BT Journal</h1>
        <p className="text-muted-foreground font-body italic mt-1">Your daily self-care and reflection space</p>
      </div>

      <Card className="w-full max-w-md p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-headline text-muted-foreground ml-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@journal.com"
              required
              className="rounded-2xl py-6 bg-stone-50/50 border-stone-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-headline text-muted-foreground ml-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="rounded-2xl py-6 bg-stone-50/50 border-stone-100"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl py-6 font-headline text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-body text-muted-foreground hover:text-primary-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  );
}
