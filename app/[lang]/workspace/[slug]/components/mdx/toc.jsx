"use client"
import { useEffect, useState } from "react";

export function TableOfContents() {
    const [headers, setHeaders] = useState([]);

    useEffect(() => {
        const mdx = document.querySelector(".markdown-body");
        if (!mdx) return;
        const headers = Array.from(mdx.querySelectorAll("h1, h2, h3, h4, h5, h6"));
        setHeaders(headers);
    }, []);

    return (
        <ol dir="ltr" className="text-sm h-1/2 overflow-auto">
            {headers.map((header) => (
                <li key={header.id} className=" p-1">
                    <a onClick={() => {
                        header.scrollIntoView({ behavior: "smooth" });
                    }}
                        className=" cursor-pointer">
                        {parseInt(header.tagName[1]) == 2 ?
                            <span className="ps-2">{header.innerText}</span> :
                            parseInt(header.tagName[1]) == 3 ?
                                <span className="ps-4">{header.innerText}</span> :
                                parseInt(header.tagName[1]) == 4 ?
                                    <span className="ps-6">{header.innerText}</span> :
                                    parseInt(header.tagName[1]) == 5 ?
                                        <span className="ps-8">{header.innerText}</span> :
                                        parseInt(header.tagName[1]) == 6 ?
                                            <span className="ps-10">{header.innerText}</span> :
                                            <span>{header.innerText}</span>}
                    </a>
                </li>
            ))}
        </ol>
    );
}