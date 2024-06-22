'use client' // Error components must be Client Components

import { useEffect, useState } from 'react'
import { Button, ButtonGroup } from '@nextui-org/button'
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/modal';


export default function Error({ error, reset }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <div className='m-2 '>
                <h2 className='text-lg'>Something went wrong!</h2>
                <p className='text-sm'>
                    The markdown file may contain tags that are not supported by MDX, such as tags that are self-closed. For example, <code>&lt;br&gt;</code>.
                </p>
            </div>
            <ButtonGroup>
                <Button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    Try again
                </Button>
                <Button onClick={() => { setOpen(true) }}>
                    Show Info
                </Button>
            </ButtonGroup>
            <Modal isOpen={open} onOpenChange={setOpen}>
                <ModalContent>
                    <ModalHeader>Info</ModalHeader>
                    <ModalBody>
                        {error.message}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    )
}