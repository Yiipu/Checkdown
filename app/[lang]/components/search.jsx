"use client"
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useCallback, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import Link from "next/link";
import { Tooltip } from "@nextui-org/tooltip";

export function Search({ dictionary, tip }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [fileResults, setFileResults] = useState([]);

    const search = useCallback(async () => {
        const res = await fetch(`/api/mdxfiles?file_name=${query}`);
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        const data = await res.json();
        setFileResults(data.data);
    }, [query]);

    return (
        <div className="flex justify-around">
            <Tooltip content={tip}>
                <button onClick={() => setOpen(true)} id="header-search">🍳</button>
            </Tooltip>
            <Modal isOpen={open} onOpenChange={setOpen}
                onClose={() => {
                    setFileResults([]);
                    setQuery("");
                }}
                classNames={{
                    body: "flex-col-reverse md:flex-col gap-0",
                }}
                hideCloseButton>
                <ModalContent>
                    <ModalBody>
                        <div className="flex">
                            <Input autoFocus type="text"
                                placeholder={dictionary.Search.placeholder} value={query}
                                onValueChange={setQuery}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') search();
                                    if (e.key === 'Escape') setOpen(false);
                                }}
                                classNames={{
                                    base: "mr-2",
                                }} />
                            <Button onClick={search} isIconOnly>🍳</Button>
                        </div>

                        <div>
                            {fileResults.map((result) => {
                                return (
                                    <div key={result.id} className="px-3 py-2 bg-default-200 my-2 rounded">
                                        <Link href={`/${result.user_id}/${result.name}?file_id=${result.id}`} className=" underline text-primary">
                                            <div>{result.user_id} / <br className="md:hidden" />{result.name}</div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}