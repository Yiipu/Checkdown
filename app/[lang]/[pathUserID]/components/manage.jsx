"use client"
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CheckboxGroup, Checkbox } from '@nextui-org/checkbox';

import { cn } from '@nextui-org/theme';
import { Button, ButtonGroup } from '@nextui-org/button';

export function ManageBoard({ pathUserID }) {
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedAllFiles, setSelectedAllFiles] = useState(false);

    const [workSpaces, setWorkSpaces] = useState([]);
    const [filteredWorkSpaces, setFilterdWorkSpaces] = useState([]); // ws filtered by selectedFiles
    const [selectedWorkSpaces, setSelectedWorkSpaces] = useState([]); // selected & filtered
    const [selectedAllFilterdWS, setSelectedAllFilterdWS] = useState(false); // select all filtered

    // filter workspaces by selected files
    useEffect(() => {
        if (selectedFiles.length == 0) {
            setFilterdWorkSpaces(workSpaces);
            return;
        }
        setFilterdWorkSpaces(workSpaces.filter(ws => {
            return selectedFiles.some(fileID => ws.file_id == fileID);
        }));
    }, [selectedFiles, workSpaces]);

    // filteredWorkSpaces select all
    const selectAllFilterdWS = useCallback(() => {
        if (selectedAllFilterdWS) {
            setSelectedWorkSpaces([]);
        } else {
            setSelectedWorkSpaces(filteredWorkSpaces.map(ws => ws.id));
        }
        setSelectedAllFilterdWS(!selectedAllFilterdWS);
    }, [filteredWorkSpaces, selectedAllFilterdWS])

    // delete workspace
    const deleteWorkSpace = useCallback((id) => {
        async function _deleteWorkSpace() {
            const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
            if (res.status == 200) {
                setWorkSpaces(prevWS => prevWS.filter(ws => ws.id !== id));
            }
            else {
                console.error(await res.json());
            }
        }
        _deleteWorkSpace();
    }, [])

    // fetch workspaces
    useEffect(() => {
        async function getWorkSpaces() {
            const res = await fetch(`/api/workspaces`);
            const data = await res.json();
            setWorkSpaces(data.data);
        }
        getWorkSpaces();
    }, [pathUserID, userFiles]);

    // fetch files
    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/mdxfiles?user_id=${pathUserID}`);
            const data = await res.json();
            setUserFiles(data.data);
        }
        getData();
    }, [pathUserID])

    // action: file select all or none
    const selectAllFiles = useCallback(() => {
        if (selectedAllFiles) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(userFiles.map(file => file.id));
        }
        setSelectedAllFiles(!selectedAllFiles);
    }, [selectedAllFiles, userFiles])

    // sync file select all state
    useEffect(() => {
        if ((selectedFiles.length < userFiles.length) || userFiles.length == 0)
            setSelectedAllFiles(false);
        else
            setSelectedAllFiles(true);
    }, [selectedFiles.length, userFiles.length])

    // syne ws select all state
    useEffect(() => {
        if ((selectedWorkSpaces.length < filteredWorkSpaces.length) || filteredWorkSpaces.length == 0)
            setSelectedAllFilterdWS(false);
        else
            setSelectedAllFilterdWS(true);
    }, [selectedWorkSpaces.length, filteredWorkSpaces.length])

    // delete file
    const deleteFile = useCallback((id) => {
        async function _deleteFile() {
            const res = await fetch(`/api/mdxfiles/${id}`, { method: 'DELETE' });
            if (res.status == 200) {
                setUserFiles(prevFiles => prevFiles.filter(file => file.id !== id));
            }
            else {
                console.error(await res.json());
            }
        }
        _deleteFile();
    }, [])

    // patch file
    const setPublic = useCallback((id, isPublic) => {
        async function _setPublic() {
            const res = await fetch(`/api/mdxfiles/${id}?is_public=${isPublic}`, { method: 'PATCH' });
            if (res.status == 200) {
                setUserFiles(prevFiles => prevFiles.map(file => {
                    if (file.id === id) {
                        return { ...file, public: isPublic }
                    }
                    return file;
                }));
            }
            else {
                console.error(await res.json());
            }
        }
        _setPublic();
    }, [])

    return (
        <div className='flex flex-col md:flex-row'>
            <div className='flex flex-col'>
                <div className='flex items-center h-[32px] justify-between'>
                    {/* cheboxgroup actions */}
                    <Checkbox isSelected={selectedAllFiles} onValueChange={selectAllFiles}>All</Checkbox>
                    {/* file actions */}
                    {selectedFiles.length !== 0 &&
                        <ButtonGroup size='sm'>
                            <Button isIconOnly onClick={() => {
                                selectedFiles.forEach(id => deleteFile(id));
                                setSelectedFiles([]);
                                setSelectedAllFiles(false);
                            }}>🧺</Button>
                            <Button isIconOnly onClick={() => {
                                selectedFiles.forEach(id => setPublic(id, true));
                                setSelectedFiles([]);
                                setSelectedAllFiles(false);
                            }}>📢</Button>
                            <Button isIconOnly onClick={() => {
                                selectedFiles.forEach(id => setPublic(id, false));
                                setSelectedFiles([]);
                                setSelectedAllFiles(false);
                            }}>🙈</Button>
                        </ButtonGroup>
                    }
                </div>
                {/* user's uploaded files */}
                <FileList
                    userFiles={userFiles}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    pathUserID={pathUserID}
                />
            </div>
            <div className='flex flex-col'>
                <div className='flex items-center h-[32px] justify-between'>
                    {/* checkboxgroup actions */}
                    <Checkbox isSelected={selectedAllFilterdWS} onValueChange={selectAllFilterdWS}>All</Checkbox>
                    {/* filtered ws actions */}
                    {
                        selectedWorkSpaces.length !== 0 &&
                        <ButtonGroup size='sm'>
                            <Button isIconOnly onClick={() => {
                                selectedWorkSpaces.forEach(id => deleteWorkSpace(id));
                                setSelectedWorkSpaces([]);
                                setSelectedAllFilterdWS(false);
                            }}>
                                🧺
                            </Button>
                        </ButtonGroup>
                    }
                </div>
                {/* workspaces */}
                <WorkspaceList
                    filteredWorkSpaces={filteredWorkSpaces}
                    selectedWorkSpaces={selectedWorkSpaces}
                    setSelectedWorkSpaces={setSelectedWorkSpaces}
                />
            </div>
        </div>
    )
}

function FileList({ userFiles, selectedFiles, setSelectedFiles, pathUserID }) {
    return (
        <CheckboxGroup
            label="Select files"
            value={selectedFiles}
            onValueChange={setSelectedFiles}>
            {userFiles.map((file, _) => (
                <Checkbox value={file.id} key={_}
                    classNames={{
                        base: cn(
                            "inline-flex w-full bg-content1 m-0 max-w-full",
                            "hover:bg-content2 items-center justify-start",
                            "cursor-pointer rounded-lg md:gap-2 md:p-4 border-2 border-transparent",
                            "data-[selected=true]:border-primary"
                        ),
                        label: "w-full",
                    }}>
                    <div className='flex items-center overflow-hidden'>
                        <div className='truncate'>
                            <Link href={`/${pathUserID}/${file.name}?file_id=${file.id}`} className='text-primary'>
                                <span className='text-xs mr-2 bg-default-100 rounded'>#{file.id}</span>
                                <span className='underline truncate'>{file.name}</span>
                            </Link>
                        </div>
                        <div className="grow"></div>
                        <span className='min-w-fit'>
                            {!file.public && "🔒"}
                        </span>
                    </div>
                </Checkbox>
            ))
            }
        </CheckboxGroup >
    );
}

function WorkspaceList({
    filteredWorkSpaces,
    selectedWorkSpaces,
    setSelectedWorkSpaces,
}) {
    return (
        <CheckboxGroup
            label="Select Workspaces"
            value={selectedWorkSpaces}
            onValueChange={setSelectedWorkSpaces}>
            {filteredWorkSpaces.map((ws, _) => (
                <Checkbox value={ws.id} key={_}
                    classNames={{
                        base: cn(
                            "inline-flex w-full bg-content1 m-0 max-w-full",
                            "hover:bg-content2 items-center justify-start",
                            "cursor-pointer rounded-lg md:gap-2 md:p-4 border-2 border-transparent",
                            "data-[selected=true]:border-primary"
                        ),
                        label: "w-full",
                    }}>
                    <div className='flex items-center overflow-hidden'>
                        <div className='truncate'>
                            <Link href={`/workspace/${ws.id}`} className='text-primary'>
                                <span className='text-xs mr-2 bg-default-100 rounded'>#{ws.id}</span>
                                <span className='underline truncate'>{ws.file_name}</span>
                            </Link>
                        </div>
                        <div className="grow"></div>
                        <span className='min-w-fit'>
                            {ws.privilege == "manager" && "🦄"}
                        </span>
                    </div>
                </Checkbox>
            ))}
        </CheckboxGroup>
    );
}

export default WorkspaceList;