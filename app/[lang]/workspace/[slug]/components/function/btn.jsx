"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation'

export function ShareCodeBtn({ workspaceID, initCode }) {
    const [code, setCode] = useState(initCode);

    async function generateCode() {
        // generate code
        const res = await fetch(`/api/workspace/${workspaceID}/invitecode`,
            {
                method: "POST",
            });
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        const data = await res.json();
        setCode(data.code);
    }

    async function expireCode() {
        // expire code
        const res = await fetch(`/api/workspace/${workspaceID}/invitecode`,
            {
                method: "DELETE",
            });
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        setCode(null);
    }

    return (
        <div>
            {code ?
                <div>
                    <p>{code}</p>
                    <button onClick={expireCode}>expire_code</button>
                </div>
                :
                <button onClick={generateCode}>generate_code</button>
            }
        </div>
    );
}

export function LeaveWorkspaceBtn({ workspaceID }) {
    const router = useRouter()
    
    async function leaveWorkspace() {
        // leave workspace
        const res = await fetch(`/api/workspace/${workspaceID}/members`,
            {
                method: "DELETE",
            });
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
        <button onClick={leaveWorkspace}>leave_workspace</button>
    );
}