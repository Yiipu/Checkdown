"use client"
import { useEffect, useRef, useState } from 'react';

export function List() {
    const loader = useRef(null);
    const root = useRef(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            handleObserver,
            {
                root: root.current,
                rootMargin: "0px",
                threshold: [1.0]
            }
        );

        observer.observe(loader.current)

        function handleObserver(entities) {
            const target = entities[0];
            if (target.intersectionRatio <= 0) return;
            setItems(prevItems => {
                return [...prevItems, ...Array.from({ length: 3 })]
            });
            console.log("loading...");
        }

        return () => observer.disconnect();
    }, [])

    return (
        <div className="overflow-auto h-[calc(100vh-88px)]" ref={root}>
            {items.map((item, index) => (
                <div key={index} className="h-20 border-b border-gray-300">Item {index}</div>
            ))}
            <div className="loader" ref={loader}>
                <h2>More content loading...</h2>
            </div>
        </div>
    )
}