"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";

export function JoinWorkSpaceBtn({dictionary}) {
    const [code, setCode] = useState();
    const router = useRouter()

    async function joinWorkSpace() {
        const res = await fetch(`/api/usecode?code=${code}`, { method: "POST" });
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        const data = await res.json();
        router.push(`/workspace/${data.id}`);
        return;
    }

    return (
        <Popover>
            <PopoverTrigger>
                <button id="header-join">➕</button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex">
                    <Input value={code} onValueChange={setCode} placeholder={dictionary.JoinByCode.code} />
                    <Button onClick={joinWorkSpace} className=" ml-1">{dictionary.JoinByCode.join}</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
