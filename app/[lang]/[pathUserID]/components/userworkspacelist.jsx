"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function WorkSpaceList() {
    const [workSpace, setWorkSpace] = useState([]);

    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/workspaces`);
            const data = await res.json();
            setWorkSpace(data.data);
        }
        getData();
    }, []);

    return (
        <ul>
            {workSpace.map((ws, _) => {
                return (
                    <li key={_} className='flex'>
                        <Link href={`/workspace/${ws.id}`}>
                            ws.id: {ws.id} <br />
                            ws.time_created: {Date(ws.time_created)} <br />
                            ws.privilege: {ws.privilege} <br />
                        </Link>
                        <button onClick={async () => {
                            const formdata = new FormData();
                            formdata.append("workSpaceID", ws.id);
                            await fetch("/api/workspaces", {
                                method: "DELETE",
                                body: formdata,
                            }).then(res => {
                                if (res.ok) {
                                    setWorkSpace(workSpace.filter(w => w.id !== ws.id));
                                } else {
                                    throw new Error("failed to delete workspace");
                                }
                            }).catch(err => {
                                console.error(err);
                            });
                        }}>
                            delete_workspace
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}