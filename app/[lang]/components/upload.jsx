"use client"
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from 'next/navigation';
import { useUser } from "@auth0/nextjs-auth0/client";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/modal";
import { Checkbox } from "@nextui-org/checkbox";
import { Button } from "@nextui-org/button";
import { Progress } from "@nextui-org/progress";
import { canDrag } from "lib/client-utils";

export function FileDropZone({ dictionary }) {

    const isDraggable = useMemo(() => canDrag(), []);

    const [isPublic, setIsPublic] = useState(false);
    const [files, setFiles] = useState([]);
    const [progresses, setProgresses] = useState({});
    const [uploading, setUploading] = useState(false);
    const { user, error, isLoading } = useUser();
    const userID = user?.sub;

    const [open, setOpen] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
        setProgresses(prevProgresses => ({
            ...prevProgresses,
            ...Object.fromEntries(acceptedFiles.map((file) => [file.name, { progress: 0, error: null }]))
        }));
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/markdown": [".md", ".mdx"]
        }
    });

    const uploadFile = useCallback((file) => new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userID", userID);

        xhr.open("POST", `/api/mdxfiles?is_public=${isPublic}`);
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = event.loaded / event.total * 100;
                setProgresses((prev) => ({ ...prev, [file.name]: progress }));
            }
        };
        xhr.onload = () => {
            if (xhr.status !== 200) {
                setProgresses((prev) => ({ ...prev, [file.name]: { error: xhr.statusText } }));
                reject(`Error uploading file ${file.name}: ${xhr.statusText}`);
            } else {
                resolve();
            }
        };
        xhr.onerror = () => {
            setProgresses((prev) => ({ ...prev, [file.name]: { error: xhr.statusText } }));
            reject(`Error uploading file ${file.name}: ${xhr.statusText}`);
        };

        xhr.send(formData);
    }), [isPublic, userID]);

    useEffect(() => {
        if (uploading) {
            const promises = files.map(uploadFile);

            Promise.all(promises)
                .catch(console.error)
                .finally(() => setUploading(false));
        }
    }, [uploading, files, uploadFile]);

    return (
        user &&
        <div className="flex justify-around">
            <button onClick={() => { setOpen(true) }} id="header-upload">🎈</button>
            <Modal isOpen={open} onOpenChange={setOpen} onClose={() => {
                //setFiles([]); setProgresses({}); setUploading(false) 
            }}>
                <ModalContent>
                    <ModalHeader>{dictionary.FileDrop.title}</ModalHeader>
                    <ModalBody>
                        {isDraggable ?
                            <div className=" border-dashed border-2">
                                <div {...getRootProps()} className="h-72">
                                    <input {...getInputProps()} type="file" accept=".md, .mdx" />
                                    <div className="h-full flex justify-center items-center">
                                        {isDragActive ? (
                                            <p>{dictionary.FileDrop.drop_zone_drag_active}</p>
                                        ) : (
                                            <p>{dictionary.FileDrop.drop_zone_drag_inactive}</p>
                                        )}
                                    </div>
                                </div>
                            </div> :
                            <div>
                                <label htmlFor="clickupload" className="flex bg-default rounded h-10 justify-center items-center">
                                    select_files
                                </label>
                                <input type="file" className="hidden" id="clickupload" accept=".md, .mdx" multiple onChange={(event) => onDrop(Array.from(event.target.files))} />
                            </div>
                        }
                        <div>
                            {files && <ul className=" pt-2" >
                                {files.map((file) => (
                                    <li key={file.name}>
                                        <div className="grid grid-flow-col grid-cols-10 items-center">
                                            <span className="inline-block text-ellipsis overflow-hidden col-span-3 text-nowrap">{file.name}</span>
                                            <span className="justify-self-end px-2 w-fit text-center text-sm bg-content3 rounded-lg col-span-4 text-nowrap">{progresses[file.name].error && `⚠ ${progresses[file.name].error}`}</span>
                                            <span className="font-mono text-sm inline-block justify-self-end col-span-2">{Math.floor(file.size / 1024)} KB</span>
                                            <span className="justify-self-end">
                                                <button onClick={
                                                    () => setFiles(files.filter((f) => f.name !== file.name))
                                                }>❌</button>
                                            </span>
                                        </div>
                                        <Progress isIndeterminate={uploading && progresses[file.name].progress == 0} value={progresses[file.name]} size="sm" />
                                    </li>
                                ))}
                            </ul>}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Checkbox checked={isPublic} onChange={() => setIsPublic(!isPublic)} >{dictionary.FileDrop.public} </Checkbox>
                        <Button onClick={() => setUploading(true)} color="primary">{dictionary.FileDrop.primary}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};
