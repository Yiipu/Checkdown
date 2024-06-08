"use client"
import { useSocket } from '../socket/socketprovider';

export function CheckBox({ id }) {
    const [socket, isConnected, transport, progress] = useSocket();
    var checked = false;

    const index = id.split('-')[1];

    checked = progress[index];
    if (checked === undefined) {
        checked = false
    };

    return (
        <input type="checkbox"
            checked={checked}
            className="task-list-item-checkbox"
            check-id={id}
            onChange={async () => {
                await socket.emit("taskupdate", index, !checked);
            }} />
    )
}
