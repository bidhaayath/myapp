"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, LogOut, User, Bell, Shield, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  const auth = useAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-[#FCFAFA] px-6 pt-12 pb-24">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-headline text-[#4A3F35]">Settings</h1>
        <div className="w-10" />
      </header>

      <div className="space-y-6">
        {/* User Info */}
        <Card className="p-6 rounded-[2.5rem] border-none shadow-sm bg-white flex items-center gap-4">
          <div className="bg-primary/20 p-4 rounded-full">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-headline text-muted-foreground uppercase tracking-widest">Logged in as</p>
            <p className="text-lg font-body text-[#4A3F35]">{user?.email || 'Guest'}</p>
          </div>
        </Card>

        {/* Setting Groups */}
        <div className="space-y-4">
          <h2 className="text-sm font-headline uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">Preferences</h2>
          
          <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100/50 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer">
              <Bell className="w-5 h-5 text-stone-400" />
              <span className="flex-1 font-body">Daily Reminders</span>
              <span className="text-xs text-muted-foreground uppercase font-headline">Off</span>
            </div>
            <div className="p-4 flex items-center gap-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer">
              <Shield className="w-5 h-5 text-stone-400" />
              <span className="flex-1 font-body">Privacy & Data</span>
            </div>
            <div className="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors cursor-pointer">
              <Heart className="w-5 h-5 text-stone-400" />
              <span className="flex-1 font-body">About BT Journal</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8">
          <Button 
            variant="outline" 
            className="w-full rounded-2xl py-6 border-stone-200 text-stone-500 hover:text-red-500 hover:bg-red-50 transition-all font-headline text-lg"
            onClick={() => signOut(auth)}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <p className="mt-12 text-center text-[10px] font-headline uppercase tracking-widest text-muted-foreground">
        Version 1.0.0 • Spark Edition
      </p>
    </div>
  );
}
