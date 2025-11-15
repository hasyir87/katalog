
'use client';

import Link from 'next/link';
import { LogOut, LayoutDashboard, User as UserIcon, Search } from 'lucide-react';
import { useUser, useAuth as useFirebaseAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { useState } from 'react';
import Image from 'next/image';

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    router.push(`/search?q=${trimmedQuery}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari parfum..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="mr-auto flex items-center gap-2 sm:mr-6">
           <img src="https://www.appsheet.com/fsimage.png?appid=520d6c78-d578-4f8d-b624-bcf5f410200a&datasource=google&filename=DocId%3D19N_zKCUdC-CdWuSuAqIZJSZu1ZSionEB&signature=b67bc4a36c7849fccc9ab5be4d965e0266e059d03ca5c60a52e5c1ebaf29a5e0&tableprovider=google&userid=1643435" alt="M Katalog Parfum Logo" width={32} height={32} />
           <span className="font-bold font-headline text-lg hidden sm:inline-block">M Katalog Parfum</span>
        </Link>
         
        <div className="flex items-center gap-2">
            <SearchBar />
            {isUserLoading ? (
              <Skeleton className="h-9 w-9 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>
                        <UserIcon className="h-5 w-5"/>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName ?? 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              null // No sign-in button as requested
            )}
        </div>
      </div>
    </header>
  );
}
