"use client";
import Link from "next/link";
import { JoinWorkSpaceBtn } from "./joinworkspace";
import { useUser } from "@auth0/nextjs-auth0/client";

export function LayoutHeader() {
    const { user } = useUser();
    return (
        <header className="flex p-8">
            {/* LOGO */}
            <h1><Link href="/">CheckDown</Link></h1>
            {/* gap */}
            <div className="flex-auto"></div>
            {/* user info */}
            {user ? (
                <div className="flex justify-between gap-2">
                    <JoinWorkSpaceBtn />
                    <p>{user.nickname}</p>
                    <Link href='/me'>my_profile</Link>
                    <a href="/api/auth/logout">Logout</a>
                </div>
            ) : (
                <Link href="/api/auth/login">Login</Link>
            )}
        </header>
    )
}
