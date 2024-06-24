"use client"
import { Tab, Tabs } from "@nextui-org/tabs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

import { ManageBoard } from "./manage";
import { Home } from "./home";

export function ProfileTab({ selectedKey, pathUserID, pathUser, dictionary }) {
    const pathname = usePathname();
    const { user } = useUser();
    const isOwner = user?.sub === pathUserID;

    const disabledKeys = isOwner ? [] : ['manage'];

    return (
        <Tabs aria-label="Options" selectedKey={selectedKey} disabledKeys={disabledKeys}>
            <Tab key="home" title={<Link href={`${pathname}?tab=home`} >Home</Link>}>
                <Home pathUser={pathUser} />
            </Tab>
            <Tab key="manage" title={<Link href={`${pathname}?tab=manage`}>Manage Files</Link>}>
                <ManageBoard pathUserID={pathUserID} dictionary={dictionary} />
            </Tab>
        </Tabs>
    )
}