'use client';

import { useState, ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { SearchProvider } from '@/contexts/search-context';
import { Header } from './header';
import { Toaster } from '@/components/ui/toaster';
import { LoginModal } from '@/components/auth/login-modal';
import { RegisterModal } from '@/components/auth/register-modal';

export function AppLayout({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <AuthProvider>
      <SearchProvider>
        <div className="min-h-screen flex flex-col">
        <Header
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
        />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6">
          <div className="container text-center text-sm text-muted-foreground">
            FilmTipTop - Your Movie Discovery Platform
          </div>
        </footer>
      </div>
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
      <Toaster />
      </SearchProvider>
    </AuthProvider>
  );
}
