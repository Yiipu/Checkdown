"use client"
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

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

    const deleteFile = useCallback((id) => {
        async function deleteFile() {
            const res = await fetch(`/api/mdxfiles/${id}`, { method: 'DELETE' });
            if (res.status == 200) {
                setUserFiles(userFiles.filter(file => file.id !== id));
            }
            else {
                console.error(await res.json());
            }
        }
        deleteFile();
    }, [userFiles])


    return (
        userFiles.error ?
            <div>{userFiles.error}</div>
            :
            <ul className='flex-row'>
                {/* user's uploaded files */}
                {userFiles.map((file, _) => (
                    <li key={_} className=''>
                        <Link href={`/${pathUserID}/${file.name}?file_id=${file.id}`}>{file.name}</Link>
                        <button onClick={() => deleteFile(file.id)}>delete_file</button>
                    </li>
                ))}
            </ul>
    )
}