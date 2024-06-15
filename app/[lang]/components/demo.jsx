"use client"
import { Skeleton } from "@nextui-org/skeleton"
import { Checkbox } from "@nextui-org/checkbox"
import { useState, useEffect } from "react"

function RandomCheckBox({ id, checked, setChecked }) {
    return <Checkbox isSelected={checked[id]} onValueChange={() => {
        setChecked(prevChecked => prevChecked.map((v, i) => i === id ? !v : v))
    }} />
}

export function Demo() {
    const [checked, setChecked] = useState(Array(5).fill(false));

    useEffect(() => {
        const timer = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * checked.length);
            setChecked(prevChecked => prevChecked.map((v, i) => i === randomIndex ? !v : v));
        }, 2000 + Math.random() * 500); // change state every 2 to 2.5 seconds

        return () => clearTimeout(timer); // clear timer on unmount
    }, [checked]);

    return (
        <div className="grid grid-cols-2 gap-2 my-8">
            <div className="grid gap-1 overflow-hidden">
                <Skeleton className="w-full h-1" disableAnimation />
                <Skeleton className="w-[50px] h-6 rounded" disableAnimation />
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={0} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={1} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <Skeleton className="w-[70px] h-6 rounded" disableAnimation />
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={2} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={3} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={4} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
            </div>
            <div className="grid gap-1 overflow-hidden">
                <Skeleton className="w-full h-1" disableAnimation />
                <Skeleton className="w-[50px] h-6 rounded" disableAnimation />
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={0} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={1} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <Skeleton className="w-[70px] h-6 rounded" disableAnimation />
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={2} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={3} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
                <div className="w-full flex items-center px-2">
                    <RandomCheckBox id={4} checked={checked} setChecked={setChecked} /> <Skeleton className="w-[300px] h-4 rounded" disableAnimation />
                </div>
            </div>
        </div>
    )
}