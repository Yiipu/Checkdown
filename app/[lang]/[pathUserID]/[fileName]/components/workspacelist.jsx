"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function WorkSpaceList({ fileID }) {
    const [workSpace, setWorkSpace] = useState([]);

    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/workspaces?file_id=${fileID}`);
            const data = await res.json();
            setWorkSpace(data.data);
        }
        getData();
    }, [fileID]);

    return (
        <div>
            <button onClick={async () => {
                await fetch(`/api/workspaces?file_id=${fileID}`, {
                    method: "POST",
                }).then(res => {
                    if (res.ok) return res.json();
                    else throw new Error("failed to create workspace");
                }).then(data => {
                    setWorkSpace([...workSpace, { id: data.workSpaceID, time_created: new Date(), privilege: "manager" }]);
                }).catch(err => {
                    console.error(err);
                });
            }}>
                create_workspace
            </button>
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
                                await fetch(`/api/workspaces/${ws.id}`, { method: "DELETE", }).then(res => {
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
        </div>
    )
}