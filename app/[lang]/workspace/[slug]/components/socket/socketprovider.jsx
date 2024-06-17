"use client"
import { useEffect, createContext, useState, useContext, useRef } from 'react';
import { io } from "socket.io-client";

const SocketContext = createContext();

export function SocketProvider({ children, userID, workSpaceID }) {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [progress, setProgress] = useState([]);
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
            socket.emit("ready");

            socket.io.engine.on("upgrade", (transport) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        function onTaskUpdated({ id, taskInfo }) {
            setProgress((prev) => {
                const newProgress = [...prev];
                newProgress[id] = taskInfo;
                return newProgress;
            });
        }

        function onInitProgress(progress) {
            const newProgress = Array();
            progress.map((item) => {
                newProgress[item.task_id] = item;
            })
            setProgress(newProgress);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("taskupdated", onTaskUpdated);
        socket.on("progress", onInitProgress);

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
