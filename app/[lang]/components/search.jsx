"use client"
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";

export function Search({ dictionary }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    async function search() {
        const res = await fetch(`/api/mdxfiles?file_name=${query}`);
        if (!res.ok) {
            console.error(res.statusText);
            return;
        }
        const data = await res.json();
        setResults(data.data);
    }

    return (
        <div className="flex justify-around">
            <button onClick={() => setOpen(true)} id="header-search">🍳</button>
            <Modal isOpen={open} onOpenChange={setOpen} onClose={() => setResults([])}>
                <ModalContent>
                    <ModalHeader>
                        <Input autoFocus type="text"
                            placeholder={dictionary.Search.placeholder} value={query}
                            onValueChange={setQuery}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') search();
                                if (e.key === 'Escape') setOpen(false);
                            }} />
                        <Button onClick={search}>🍳</Button>
                    </ModalHeader>
                    <ModalBody>
                        <div>
                            {results.map((result) => {
                                return (
                                    <div key={result.id}>
                                        <div>{result.name}</div>
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