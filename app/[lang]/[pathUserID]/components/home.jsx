import { User } from "@nextui-org/user"
import { useEffect, useState, useRef } from "react"
import Link from "next/link";

export function Home({ pathUser }) {

    const [files, setFiles] = useState(null);

    useEffect(() => {
        fetch(`/api/mdxfiles?user_id=${pathUser.id}&is_public=${true}`)
            .then(res => res.json())
            .then(data => {
                setFiles(data.data);
            })
    }, [pathUser.id])

    return (
        <div>
            <User
                name={pathUser.nickname}
                description={pathUser.email}
                avatarProps={{
                    src: pathUser.picture
                }}
                classNames={
                    {
                        container: 'flex flex-col items-center',
                        avatar: 'w-32 h-32 rounded-full',
                        name: 'text-2xl font-bold',
                        description: 'text-gray-500'
                    }
                }
            />
            <hr className="my-2 h-0.5 border-t-0 bg-default" />
            {
                files && files.map(file => (
                    <div key={file.id} className="flex items-center justify-between">
                        <Link href={`/${pathUser.id}/${file.name}?file_id=${file.id}`}>
                            <span>{file.name}</span>
                        </Link>
                    </div>
                ))
            }
        </div>
    )
}