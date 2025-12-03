import { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/cookies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/actions/auth";
import { Camera, Search, Bell, User, LogOut, Settings, Handshake } from "lucide-react";


export default async function MainLayout({ children }: { children: ReactNode }) {
    const session = await getSession();

    return (
        <>
            <header className="sticky top-0 z-50 border-b bg-white">
                <nav className="mx-auto flex items-center justify-between gap-4 p-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-semibold text-xl shrink-0">
                        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                            <Handshake className="size-5" />
                        </div>
                        <span className="hidden sm:inline">KawanSewa</span>
                    </Link>

                    {/* Search Bar (Center) */}
                    {session && (
                        <div className="flex-1 max-w-md mx-4">
                            <form action="/items" method="GET" className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    name="q"
                                    placeholder="Search cameras, lenses..."
                                    className="pl-10 w-full"
                                />
                            </form>
                        </div>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {session ? (
                            <>
                                {/* Bell Icon - Notifications */}
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                                </Button>

                                {/* Profile Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative rounded-full">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" alt={session.email} />
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    {session.email.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">My Account</p>
                                                <p className="text-xs leading-none text-muted-foreground">
                                                    {session.email}
                                                </p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="cursor-pointer">
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/settings" className="cursor-pointer">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <form action={logout} className="w-full">
                                                <button type="submit" className="flex w-full items-center cursor-pointer">
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Sign out
                                                </button>
                                            </form>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="default" size="sm">
                                        Register
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>
            <main className="mx-auto max-w-7xl p-4">{children}</main>
        </>
    );
}
