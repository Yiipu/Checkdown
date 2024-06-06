"use client"
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from 'next/navigation';

export function FileDropZone({ userID }) {
    const [isPublic, setIsPublic] = React.useState(false);
    const router = useRouter();

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        const formdata = new FormData();
        formdata.append("file", file);
        formdata.append("isPublic", isPublic);
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formdata,
        });
        const resBody = await res.json();
        if (res.status === 201) {
            router.push(`/${userID}/${resBody.fileName}`);
        }
    }, [isPublic, router, userID]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div>
                    {isDragActive ? (
                        <p>drop_zone_drag_active</p>
                    ) : (
                        <p>drop_zone</p>
                    )}
                </div>
            </div>
            <input type="checkbox" checked={isPublic} onChange={() => setIsPublic(!isPublic)} /> make_public
        </div>
    );
}