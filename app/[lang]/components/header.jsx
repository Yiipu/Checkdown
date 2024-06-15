"use client";
import Link from "next/link";
import { JoinWorkSpaceBtn } from "./joinworkspace";
import { HeaderUser } from "./user";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@nextui-org/button";
import { Skeleton } from "@nextui-org/skeleton";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import { Search } from "./search";
import { ThemeSwitcher } from "./darkmode";
import { FileDropZone } from "./upload";

export function LayoutHeader() {
    const { user, isLoading } = useUser();
    return (
        <Navbar isBordered>
            {/* LOGO */}
            <NavbarBrand><Link href="/">CheckDown</Link></NavbarBrand>
            <NavbarContent justify="center">
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem className="flex gap-2">
                    <ThemeSwitcher />
                    <Search />
                    <FileDropZone/>
                    {user && <JoinWorkSpaceBtn />}
                </NavbarItem>
                {/* user info */}
                <NavbarItem className="h-[40px]">
                    {isLoading ?
                        <Skeleton className="w-[173px] h-[40px] rounded-full" />
                        : user ? <HeaderUser user={user} />
                            : <Button>
                                <Link href="/api/auth/login">Login</Link>
                            </Button>}
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}
