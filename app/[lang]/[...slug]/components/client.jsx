"use client"
import { useEffect, useState } from 'react';
import { createWorkSpace } from 'app/actions';
import Link from 'next/link';

export function WorkSpaceList({ workspace_init, fileID, userID }) {
    const [workSpace, setWorkSpace] = useState(workspace_init);
    const [formattedDates, setFormattedDates] = useState([]);

    useEffect(() => {
        // useEffect prevents hydration error
        const dates = workSpace.map(ws => `${ws.created.getUTCMonth() + 1}/${ws.created.getUTCDate()}`);
        setFormattedDates(dates);
    }, [workSpace]);

    return (
        <div>
            {/* TODO: ? use formdata ? */}
            <button onClick={async () => {
                const res = await createWorkSpace(fileID, userID.split('|')[1]);
                if (res.error) {
                    console.log(res.error);
                }
                else {
                    setWorkSpace([...workSpace, { id: res.workSpaceID, created: new Date(), privilege: "manager" }])
                }
            }}>
                create_workspace
            </button>
            <ul>
                {workSpace.map((ws, _) => {
                    return (
                        <li key={_}>
                            <Link href={`/workspace/${ws.id}`}>
                                ws.id: {ws.id} <br />
                                ws.created: {formattedDates[_]} <br />
                                ws.privilege: {ws.privilege} <br />
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}