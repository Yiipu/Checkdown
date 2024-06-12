"use client"
import { useSocket } from '../socket/socketprovider';
import { Checkbox } from '@nextui-org/checkbox';
import { Tooltip } from '@nextui-org/tooltip';
import { useEffect, useState } from 'react';
import { Link } from '@nextui-org/link';

export function CheckBox({ name }) {
    const [socket, isConnected, transport, progress] = useSocket();
    const [nickName, setNickName] = useState('');
    var checked = false;

    const index = name.split('-')[1];

    checked = progress[index]?.is_done || false;
    if (checked === undefined) {
        checked = false
    };

    useEffect(() => {
        async function fetchUser() {
            if (!progress[index]?.updated_by_user) return;
            const res = await fetch(`/api/users/${progress[index]?.updated_by_user}`);
            const data = await res.json();
            console.log(data);
            setNickName(data.email);
        }
        fetchUser();
    }, [index, progress]);

    return (
        <Tooltip
            placement='left' showArrow
            content={
                progress[index] ?
                    <div >
                        <span> updated_by <Link href={`/${progress[index].updated_by_user}`}>{nickName}</Link></span>
                        <br />
                        <span> at {progress[index].updated_at}</span>
                    </div>
                    : "never_updated"
            }>
            <Checkbox type="checkbox"
                isSelected={checked}
                className="task-list-item-checkbox"
                name={name}
                onChange={async () => {
                    await socket.emit("taskupdate", index, !checked);
                }} />
        </Tooltip>
    )
}
