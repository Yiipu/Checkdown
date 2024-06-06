"use client"
export function CheckBox({id}){
    return (
        <input type="checkbox" className="task-list-item-checkbox" check-id={id} />
    )
}