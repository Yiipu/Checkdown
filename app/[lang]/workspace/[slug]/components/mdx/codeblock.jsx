"use client";

import styles from "./mdx.module.css";

// TODO: animate cpybtn
function CopyButton({ text, className }) {
    const handleClick = () => {
        navigator.clipboard.writeText(text);
    };

    return <button onClick={handleClick} className={className}>Copy</button>;
}

// TODO: add code highlight
export function CodeBlock({ children }) {
    return (
        <div className={styles.codeblock}>
            <CopyButton text={children} className={styles.copybtn} />
            <code>{children}</code>
        </div>
    );
}
