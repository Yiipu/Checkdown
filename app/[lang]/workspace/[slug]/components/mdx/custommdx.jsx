import { CodeBlock } from "./codeblock";
import { CheckBox } from "./checkbox";

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

    return {firstString, children};
}

export function customMDX(components) {
    let idCounter = 0;
    return {
        li: (props) => {
            const { firstString, children } = extractTaskItemChildren(props);

            // convert task item to checkbox
            if (firstString.slice(0, 3) == "[ ]") {
                const id = `CheckID-${idCounter++}`;
                return (
                    <li className="task-list-item">
                        <CheckBox id={id} />
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
        ...components,
    };
}