"use client"
import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { User } from '@nextui-org/user';

function generateRandomDescription(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function FileCard({ file }) {
    const [user, setUser] = useState({
        nickname: '',
        email: '',
        picture: ''
    });

    useEffect(() => {
        async function getUserInfo() {
            const data = await fetch(`/api/users/${file.user_id}`)
                .then(res => res.json())
                .catch(err => console.error(err));
            return data;
        }
        getUserInfo().then(data => setUser(data));
    }, [file.user_id])

    return (
        <Card className=" m-8">
            <CardHeader>
                <User
                    avatarProps={{
                        src: user.picture,
                        alt: user.nickname
                    }}
                    name={user.nickname}
                    description={user.email}
                />
            </CardHeader>
            <CardBody>
                <h3>{file.name}</h3>
                <p>{file.description}</p>
                <p>{generateRandomDescription(255) }</p>
            </CardBody>
        </Card>
    )
}

export function FileList() {
    const loader = useRef(null);
    const root = useRef(null);
    const [items, setItems] = useState([]);
    const offset = useRef(0); // Changed from useState to useRef
    const limit = 2;
    const [hasmore, setHasmore] = useState(true);

    const getData = useCallback(async () => {
        const { data } = await fetch(`/api/mdxfiles?offset=${offset.current}&limit=${limit}`)
            .then((res) => res.json())
            .catch((err) => {
                console.error(err);
                return { data: [] };
            });
        if (data.length < limit) {
            setHasmore(false);
        }
        return data;
    }, [limit]); // Removed offset from the dependency array

    const handleObserver = useCallback((entities) => {
        const target = entities[0];
        if (target.intersectionRatio <= 0) return;

        // load more content
        offset.current += limit; // Changed from setOffset to offset.current
        getData().then((data) => setItems((prevItems) => [...prevItems, ...data]));
    }, [getData, limit]); // Added limit to the dependency array

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: root.current,
            rootMargin: "0px",
            threshold: [1.0],
        });
        observer.observe(loader.current);

        return () => observer.disconnect();
    }, [handleObserver]);

    return (
        <div className="overflow-auto h-[calc(100vh-88px)]" ref={root}>
            {items.map((item, index) => (
                <FileCard key={index} file={item} />
            ))}
            {hasmore && <div className="loader" ref={loader}>
                <h2>More content loading...</h2>
            </div>}
        </div>
    )
}