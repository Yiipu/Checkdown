"use client"
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

import { cn } from '@nextui-org/theme';
import { Button, ButtonGroup } from '@nextui-org/button';
import { Checkbox, CheckboxGroup } from '@nextui-org/checkbox';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@nextui-org/modal';

export function WorkSpaceList({ fileID }) {
    const [open, setOpen] = useState(false);
    const [shouldShowModal, setShouldShowModal] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setShouldShowModal(true);
            } else {
                setShouldShowModal(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return (
        <>
            {shouldShowModal ?
                <div>
                    <Button onClick={() => { setOpen(true) }} className=' fixed bottom-6 left-8'>Menu</Button>
                    <Modal isOpen={open} onOpenChange={setOpen}>
                        <ModalContent>
                            <ModalHeader>Menu</ModalHeader>
                            <ModalBody>
                                <Actions fileID={fileID} />
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </div> :
                <Actions fileID={fileID} />
            }
        </>

    )
}

function Actions({ fileID }) {
    const [workSpace, setWorkSpace] = useState([]);
    const [selectedWorkSpace, setSelectedWorkSpace] = useState([]);
    const [selectedAll, setSelectedAll] = useState(false);

    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/workspaces?file_id=${fileID}`);
            const data = await res.json();
            setWorkSpace(data.data);
        }
        getData();
    }, [fileID]);

    useEffect(() => {
        if ((selectedWorkSpace.length < workSpace.length) || workSpace.length == 0)
            setSelectedAll(false);
        else
            setSelectedAll(true);
    }, [selectedWorkSpace.length, workSpace.length])

    const selectAll = useCallback(() => {
        if (selectedAll) {
            setSelectedWorkSpace([]);
        } else {
            setSelectedWorkSpace(workSpace.map(ws => ws.id));
        }
        setSelectedAll(!selectAll);
    }, [selectedAll, workSpace])

    const createWorkSpace = useCallback(async () => {
        await fetch(`/api/workspaces?file_id=${fileID}`, {
            method: "POST",
        }).then(res => {
            if (res.ok) return res.json();
            else throw new Error("failed to create workspace");
        }).then(data => {
            setWorkSpace([...workSpace, { id: data.workSpaceID, time_created: new Date(), privilege: "manager" }]);
        }).catch(err => {
            console.error(err);
        });
    }, [fileID, workSpace]);

    const deleteWorkSpace = useCallback(async (wsID) => {
        await fetch(`/api/workspaces/${wsID}`, { method: "DELETE", }).then(res => {
            if (res.ok) {
                setWorkSpace(workSpace.filter(w => w.id !== wsID));
            } else {
                throw new Error("failed to delete workspace");
            }
        }).catch(err => {
            console.error(err);
        });
    }, [workSpace]);

    return (
        <div>
            <div className='flex items-center h-[32px] justify-between'>
                <Checkbox isSelected={selectedAll} onValueChange={selectAll}>All</Checkbox>
                <ButtonGroup size='sm'>
                    <Button isIconOnly
                        onClick={() => {
                            createWorkSpace();
                        }}>
                        ➕
                    </Button>
                    <Button isIconOnly
                        onClick={() => {
                            if (selectedWorkSpace) {
                                selectedWorkSpace.map(ws => {
                                    deleteWorkSpace(ws);
                                });
                                setWorkSpace(workSpace.filter(w => !selectedWorkSpace.includes(w.id)));
                            }
                        }}>
                        🧺
                    </Button>
                </ButtonGroup>
            </div>

            <CheckboxGroup
                label="Select Workspaces"
                value={selectedWorkSpace}
                onValueChange={setSelectedWorkSpace}>
                {workSpace.map((ws, _) => (
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
                                    <span>{JSON.stringify(ws.time_created)}</span>
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
        </div>
    )
}
