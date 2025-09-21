
// "use client";

// import Link from "next/link";
// import { Home, User, Settings, LogOut, Users } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { NotificationBell } from "@/components/notifications/NotificationBell";
// import { useUser } from "@/hooks/use-user"; // The custom hook for fetching the current user
// import { Skeleton } from "@/components/ui/skeleton"; // For the loading state UX
// import RightPanel from "@/components/layout/RightPanel";
// import { useRouter, usePathname } from "next/navigation";
// import { useEffect } from "react";
// import Loader from "@/components/Global/Loader";
// import { cn } from "@/lib/utils"; // Utility function for conditional classes

// /**
//  * The main layout for the authenticated part of the application.
//  * 
//  * It uses the `useUser` hook to fetch the current user's data and provides it
//  * to the navigation and user profile dropdown. It also handles the logout functionality.
//  */
// export default function MainAppLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const { user, isLoading } = useUser();

//   // This effect handles the redirection logic.
//   useEffect(() => {
//     if (!isLoading && !user) {
//       router.push('/login');
//     }
//   }, [user, isLoading, router]);

//   if (isLoading) {
//     return <div className="min-h-screen flex flex-col justify-center items-center"><Loader /></div>;
//   }

//   // This function makes an API call to log the user out and then redirects them.
//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//       // Redirect to the login page. This will be caught by the middleware.
//       window.location.href = '/login';
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   // Helper function to check if a navigation item is active
//   const isActiveRoute = (route: string) => {
//     if (route === '/') {
//       return pathname === '/';
//     }
//     return pathname.startsWith(route);
//   };

//   return (
//     <div className="min-h-screen w-full bg-background">
//       <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px]">

//         {/* Left Sidebar for Navigation */}
//         <aside className="hidden md:flex flex-col border-r p-6 sticky top-0 h-screen">
//           <div className="flex items-center gap-2 mb-8">
//             <h1 className="text-2xl font-bold">SocialConnect</h1>
//           </div>
//           <nav className="flex flex-col items-start gap-1">
//             <Button
//               variant="ghost"
//               asChild
//               className={cn(
//                 "w-full justify-start gap-3 text-base",
//                 isActiveRoute('/') && "bg-primary text-white hover:bg-primary hover:text-white"
//               )}
//             >
//               <Link href="/">
//                 <Home className="h-5 w-5" />
//                 Home
//               </Link>
//             </Button>

//             <NotificationBell />

//             <Button
//               variant="ghost"
//               asChild
//               className={cn(
//                 "w-full justify-start gap-3 text-base",
//                 isActiveRoute('/profile') && "bg-primary text-white hover:bg-primary hover:text-white"
//               )}
//             >
//               <Link href="/profile/me">
//                 <User className="h-5 w-5" />
//                 Profile
//               </Link>
//             </Button>

//             {/* Conditionally render the Admin link based on the user's role */}
//             {user?.role === 'Admin' && (
//               <Button
//                 variant="ghost"
//                 asChild
//                 className={cn(
//                   "w-full justify-start gap-3 text-base",
//                   isActiveRoute('/admin') && "bg-primary text-white hover:bg-primary hover:text-white"
//                 )}
//               >
//                 <Link href="/admin">
//                   <Users className="h-5 w-5" />
//                   Admin
//                 </Link>
//               </Button>
//             )}
//           </nav>
//           <div className="mt-auto">
//             {/* User Profile Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild disabled={isLoading || !user}>
//                 {/* Show a skeleton loader while user data is being fetched */}
//                 {isLoading ? (
//                   <div className="flex items-center gap-3 p-2">
//                     <Skeleton className="h-10 w-10 rounded-full" />
//                     <div className="space-y-2">
//                       <Skeleton className="h-4 w-24" />
//                       <Skeleton className="h-3 w-20" />
//                     </div>
//                   </div>
//                 ) : user ? (
//                   <Button variant="ghost" className="justify-start w-full gap-3 h-auto text-left">
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage src={user.avatarUrl || ''} alt={`@${user.username}`} />
//                       <AvatarFallback>
//                         {user.firstName?.charAt(0)}
//                         {user.lastName?.charAt(0)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="font-semibold">{user.firstName} {user.lastName}</p>
//                       <p className="text-sm text-muted-foreground">@{user.username}</p>
//                     </div>
//                   </Button>
//                 ) : (
//                   // Optional: Show a placeholder if the user isn't loaded (e.g., error state)
//                   <div className="p-2">Login required</div>
//                 )}
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56" align="end" forceMount>
//                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 {/* The logout button is now functional */}
//                 <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
//                   <LogOut className="mr-2 h-4 w-4" />
//                   <span>Log out</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </aside>

//         {/* Main Content Area */}
//         <main className="border-r min-w-0">
//           {children}
//         </main>

//         {/* Right Panel for Search/Trends */}
//         <RightPanel />

//       </div>
//     </div>
//   );
// }







"use client";

import Link from "next/link";
import { Home, User, Settings, LogOut, Users, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import RightPanel from "@/components/layout/RightPanel";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/Global/Loader";
import { cn } from "@/lib/utils";

/**
 * The main layout for the authenticated part of the application.
 * Now fully responsive with mobile navigation support.
 */
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // This effect handles the redirection logic.
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader />
      </div>
    );
  }

  // This function makes an API call to log the user out and then redirects them.
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Helper function to check if a navigation item is active
  const isActiveRoute = (route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  // Navigation items component for reuse
  const NavigationItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav className="flex flex-col items-start gap-1">
      <Button
        variant="ghost"
        asChild
        onClick={onItemClick}
        className={cn(
          "w-full justify-start gap-3 text-base",
          isActiveRoute('/') && "bg-primary text-white hover:bg-primary hover:text-white"
        )}
      >
        <Link href="/">
          <Home className="h-5 w-5" />
          Home
        </Link>
      </Button>

      <div onClick={onItemClick}>
        <NotificationBell />
      </div>

      <Button
        variant="ghost"
        asChild
        onClick={onItemClick}
        className={cn(
          "w-full justify-start gap-3 text-base",
          isActiveRoute('/profile') && "bg-primary text-white hover:bg-primary hover:text-white"
        )}
      >
        <Link href="/profile/me">
          <User className="h-5 w-5" />
          Profile
        </Link>
      </Button>

      {/* Conditionally render the Admin link based on the user's role */}
      {user?.role === 'Admin' && (
        <Button
          variant="ghost"
          asChild
          onClick={onItemClick}
          className={cn(
            "w-full justify-start gap-3 text-base",
            isActiveRoute('/admin') && "bg-primary text-white hover:bg-primary hover:text-white"
          )}
        >
          <Link href="/admin">
            <Users className="h-5 w-5" />
            Admin
          </Link>
        </Button>
      )}
    </nav>
  );

  // User Profile Component for reuse
  const UserProfile = ({ onLogout }: { onLogout: () => void }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isLoading || !user}>
        {isLoading ? (
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ) : user ? (
          <Button variant="ghost" className="justify-start w-full gap-3 h-auto text-left p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl || ''} alt={`@${user.username}`} />
              <AvatarFallback>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
            </div>
          </Button>
        ) : (
          <div className="p-2">Login required</div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onLogout} 
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="text-left">SocialConnect</SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 p-6">
                    <NavigationItems onItemClick={() => setIsMobileMenuOpen(false)} />
                  </div>
                  
                  <div className="p-6 border-t">
                    <UserProfile onLogout={handleLogout} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-xl font-bold">SocialConnect</h1>
          </div>
          
          {/* Mobile User Avatar */}
          <div className="flex items-center gap-2">
            {user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl || ''} alt={`@${user.username}`} />
                <AvatarFallback>
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_320px]">
        {/* Desktop Left Sidebar */}
        <aside className="hidden md:flex flex-col border-r p-6 sticky top-0 h-screen">
          <div className="flex items-center gap-2 mb-8">
            <h1 className="text-2xl font-bold">SocialConnect</h1>
          </div>
          
          <div className="flex-1">
            <NavigationItems />
          </div>
          
          <div className="mt-auto">
            <UserProfile onLogout={handleLogout} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="border-r min-w-0 min-h-[calc(100vh-73px)] md:min-h-screen">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Right Panel for Search/Trends - Hidden on mobile and small tablets */}
        <div className="hidden lg:block">
          <RightPanel />
        </div>
      </div>

      {/* Mobile Bottom Navigation (Alternative approach - uncomment if preferred) */}
      {/*
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
        <div className="flex items-center justify-around py-2 px-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "flex-col gap-1 h-auto py-2",
              isActiveRoute('/') && "text-primary"
            )}
          >
            <Link href="/">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </Link>
          </Button>
          
          <div className={cn("flex-col gap-1 h-auto py-2")}>
            <NotificationBell />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "flex-col gap-1 h-auto py-2",
              isActiveRoute('/profile') && "text-primary"
            )}
          >
            <Link href="/profile/me">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Link>
          </Button>
          
          {user?.role === 'Admin' && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex-col gap-1 h-auto py-2",
                isActiveRoute('/admin') && "text-primary"
              )}
            >
              <Link href="/admin">
                <Users className="h-5 w-5" />
                <span className="text-xs">Admin</span>
              </Link>
            </Button>
          )}
        </div>
      </nav>
      */}
    </div>
  );
}