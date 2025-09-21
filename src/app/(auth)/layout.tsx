import React from 'react';

/**
 * The shared layout for all authentication pages (login, register, etc.).
 * It provides a consistent, centered container for the form cards.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // A main tag is semantically correct here.
    // The background color provides a nice contrast for the auth cards.
    // p-4 adds padding on small screens.
    <main className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
      {children}
    </main>
  );
}