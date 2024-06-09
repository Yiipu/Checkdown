"use client"
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function FileList({ pathUserID }) {
    const [userFiles, setUserFiles] = useState([]);

    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/mdxfiles?user_id=${pathUserID}`);
            const data = await res.json();
            setUserFiles(data.data);
        }
        getData();
    }, [pathUserID])

    return (
        userFiles.error ?
            <div>{userFiles.error}</div>
            :
            <ul className='flex-row'>
                {/* user's uploaded files */}
                {userFiles.map((file, _) => (
                    <li key={_} className=''>
                        <Link href={`/${pathUserID}/${file.name}?file_id=${file.id}`}>{file.name}</Link>
                    </li>
                ))}
            </ul>
    )
}