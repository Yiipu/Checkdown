"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { Button } from "@nextui-org/button";
import { Snippet } from "@nextui-org/snippet";

export function ShareCodeBtn({ workspaceID, initCode }) {
    const [code, setCode] = useState(initCode);

    async function generateCode() {
        // generate code
        const res = await fetch(`/api/workspaces/${workspaceID}/invitecode`, { method: "PUT", });
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        const data = await res.json();
        setCode(data.code);
    }

    async function expireCode() {
        // expire code
        const res = await fetch(`/api/workspaces/${workspaceID}/invitecode`, { method: "DELETE", });
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        setCode(null);
    }

    return (
        <>
            {code ?
                <>
                    <Snippet size="sm" hideSymbol>{code}</Snippet>
                    <Button onClick={expireCode} color="danger" size="sm" isIconOnly>🗑️</Button>
                </>
                :
                <Button onClick={generateCode} size="sm">📤 generate_code</Button>
            }
        </>
    );
}

export function LeaveWorkspaceBtn({ workspaceID }) {
    const router = useRouter()

    async function leaveWorkspace() {
        // leave workspace
        // BUG: DELETE http://localhost:3000/zh 405 (Method Not Allowed)
        const res = await fetch(`/api/workspaces/${workspaceID}/members`, { method: "DELETE", });
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
    }

    return (
        <Button onClick={leaveWorkspace} className="h-[36px]" color="danger">❌ leave</Button>
    );
}