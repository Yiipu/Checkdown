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
        <div className="h-[36px]">
            {code ?
                <div className="flex ">
                    <Snippet size="sm" hideSymbol>{code}</Snippet>
                    <button onClick={expireCode} color="danger" size="sm">🗑️</button>
                </div>
                :
                <button onClick={generateCode} size="sm">📤 generate_code</button>
            }
        </div>
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
        <button onClick={leaveWorkspace} className="h-[36px]" color="danger">❌ leave</button>
    );
}