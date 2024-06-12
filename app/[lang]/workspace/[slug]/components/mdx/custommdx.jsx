import { CodeBlock } from "./codeblock";
import { CheckBox } from "./checkbox";
import { Link } from "@nextui-org/link";

function extractTaskItemChildren(props) {
    var firstString = "";
    var children = [];

    if (typeof props.children == "string") {
        firstString = String(props.children);
        children = [firstString.slice(3)];
    } else if (typeof props.children == "object") {
        firstString = String(Array.from(props.children)[0]);
        children = [firstString.slice(3), props.children.slice(1)];
    } else {
        return;
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
            return <li {...props} />;
        },
        code: ((props) => {
            const isInlineCode = !props.className;
            return isInlineCode ? <code {...props} /> : <CodeBlock {...props} />;
        }),
        a: (props) => <Link {...props} />,
        ...components,
    };
}