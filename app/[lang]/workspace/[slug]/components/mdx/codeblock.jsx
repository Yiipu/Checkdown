"use client";

import styles from "./mdx.module.css";
import { Snippet } from "@nextui-org/snippet";

// TODO: add code highlight
export function CodeBlock({ children }) {
    return (
        <Snippet hideSymbol>
            <code style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>{children}</code>
        </Snippet>
    );
}
