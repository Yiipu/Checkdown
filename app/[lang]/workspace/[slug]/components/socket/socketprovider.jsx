"use client"
import { useEffect, createContext, useState, useContext } from 'react';
import { socket } from 'lib/socket';

const SocketContext = createContext();

export function SocketProvider({ children, room, initProgress }) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [progress, setProgress] = useState(initProgress);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });

            // join the workspace room
            socket.emit("join", room);
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        function onTaskUpdated({ id, checked }) {
            // TODO: BUG: this log appears twice in the console
            // console.log(`task updated: ${id} ${checked}`);
            setProgress((prev) => {
                const newProgress = [...prev];
                newProgress[id] = checked;
                return newProgress;
            });
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("taskupdated", onTaskUpdated);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [room]);

    return (
        <SocketContext.Provider value={[socket, isConnected, transport, progress]}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
