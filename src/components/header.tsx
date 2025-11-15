
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
import { useEffect, useState } from 'react';
import Image from 'next/image';

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${query}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search perfumes..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
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
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center gap-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
           <img src="https://www.appsheet.com/fsimage.png?appid=520d6c78-d578-4f8d-b624-bcf5f410200a&datasource=google&filename=DocId%3D19N_zKCUdC-CdWuSuAqIZJSZu1ZSionEB&signature=b67bc4a36c7849fccc9ab5be4d965e0266e059d03ca5c60a52e5c1ebaf29a5e0&tableprovider=google&userid=1643435" alt="M Katalog Parfum Logo" width={40} height={40} />
           <span className="font-bold font-headline text-xl hidden sm:inline-block">M Katalog Parfum</span>
        </Link>
         
        <div className="flex w-full flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <SearchBar />
            <div className="ml-auto flex-shrink-0">
                 {isUserLoading ? (
                    <Skeleton className="h-10 w-10 rounded-full" />
                ) : user ? (
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                            <AvatarFallback>
                            <UserIcon />
                            </AvatarFallback>
                        </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
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
                        <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    null // Tombol Sign In / Sign Up dihapus
                )}
            </div>
        </div>
      </div>
    </header>
  );
}
