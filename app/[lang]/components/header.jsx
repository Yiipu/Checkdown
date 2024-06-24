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
import { Tooltip } from "@nextui-org/tooltip";

export function LayoutHeader({ dictionary }) {
    const { user, isLoading } = useUser();
    return (
        <Navbar isBordered>
            {/* LOGO */}
            <NavbarBrand><Link href="/">CheckDown</Link></NavbarBrand>
            <NavbarContent justify="center">
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem className="flex gap-2">
                    <ThemeSwitcher tip={dictionary.Tooltip.darkMode} />
                    <Search dictionary={dictionary} tip={dictionary.Tooltip.search} />
                    <FileDropZone dictionary={dictionary} tip={dictionary.Tooltip.fileDrop} />
                    {user && <JoinWorkSpaceBtn dictionary={dictionary} tip={dictionary.Tooltip.joinByCode}/>}
                </NavbarItem>
                {/* user info */}
                <NavbarItem className="h-[40px]">
                    {isLoading ?
                        <Skeleton className="w-[173px] h-[40px] rounded-full" />
                        : user ? <HeaderUser user={user} dictionary={dictionary} />
                            : <Button>
                                <Link href="/api/auth/login">Login</Link>
                            </Button>}
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    )
}
