import { CodeBlock } from "./codeblock";
import { CheckBox } from "./checkbox";
import { Link } from "@nextui-org/link";
import React from "react";

function extractTaskItemChildren(props) {
    var firstString = "";
    var children = React.Children.toArray(props.children);

    if (children.length > 0) {
        if (typeof children[0] === "string" && children[0].startsWith("[ ]")) {
            firstString = children[0].slice(0, 3);
            children[0] = children[0].slice(3);
        } else if (typeof children[0] === "object") {
            return extractTaskItemChildren(children[0].props);
        }
    }

    return { firstString, children };
}

export function customMDX(components) {
    let idCounter = 0;
    let headerIDCounter = 0;
    return {
        h1: (props) => <h1 id={headerIDCounter++} {...props} />,
        h2: (props) => <h2 id={headerIDCounter++} {...props} />,
        h3: (props) => <h3 id={headerIDCounter++} {...props} />,
        h4: (props) => <h4 id={headerIDCounter++} {...props} />,
        li: (props) => {
            const { firstString, children } = extractTaskItemChildren(props);

            // convert task item to checkbox
            if (firstString.slice(0, 3) == "[ ]") {
                const name = `CheckID-${idCounter++}`;
                return (
                    <li className="task-list-item">
                        <CheckBox name={name} />
                        {children}
                    </li>
                );
            }
            return <li className="task-list-item" {...props} />;
        },
        p: (props) => {
            const { firstString, children } = extractTaskItemChildren(props);

            // convert task item to checkbox
            if (firstString.slice(0, 3) == "[ ]") {
                const name = `CheckID-${idCounter++}`;
                return (
                    <p style={{ margin: "0.25rem 0 0 0" }} >
                        <CheckBox name={name} />
                        {children}
                    </p>
                );
            }
            return <p {...props} />;
        },
        code: ((props) => {
            const isInlineCode = !props.className;
            return isInlineCode ? <code {...props} /> : <CodeBlock {...props} />;
        }),
        a: (props) => <Link {...props} />,
        ...components,
    };
}