"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'

export function JoinWorkSpaceBtn() {
    const [code, setCode] = useState();
    const router = useRouter()

    function onChange(e) {
        setCode(e.target.value);
    }

    async function joinWorkSpace() {
        const res = await fetch(`/api/workspace/usecode/${code}`);
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        if (res.redirected) {
            router.push(res.url)
            return;
        }
        const data = await res.json();
        console.log(data);
    }

    return (
        <div>
            <input type="text" placeholder="join_workspace" value={code} onChange={onChange} className="min-w-28 text-black" />
            <button onClick={joinWorkSpace}>Q</button>
        </div>
    );
}
