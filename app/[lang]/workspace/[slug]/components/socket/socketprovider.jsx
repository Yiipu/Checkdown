"use client"
import { useEffect, createContext, useState, useContext, useRef } from 'react';
import { io } from "socket.io-client";

const SocketContext = createContext();

export function SocketProvider({ children, userID, workSpaceID, initProgress }) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [progress, setProgress] = useState(initProgress);
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io({
            auth: (cb) => {
                cb({ workSpaceID: workSpaceID, userID: userID });
            },
        });

        const socket = socketRef.current;

        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        function onTaskUpdated({ id, checked }) {
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
            socket.disconnect();
        };
    }, [userID, workSpaceID]);

    return (
        <SocketContext.Provider value={[socketRef.current, isConnected, transport, progress]}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
