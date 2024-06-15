import { Link } from "@nextui-org/link"
import { Demo } from "./components/demo"

export default function Page({ params: { lang } }) {
    return (
        <div className=" pt-6 grid gap-2">
            <div className="md:flex items-center">
                <section className="md:w-[200px]">
                    <span className=" font-bold">Checkdown</span> is a simple markdown previewer that allows you to work on a checklist with your team in real-time.
                </section>
                <Demo />
            </div>
            <section>
                It&apos;s built with <Link href="https://nextjs.org/">Next.js</Link>, <Link href="https://socket.io/">Socket.IO</Link> and <Link href="https://mdxjs.com/">MDX</Link>. Our <Link href="https://github.com/Yiipu/checkdown">Github</Link>.
            </section>
            <div className="md:flex">
                <section className="grid grid-cols-2 gap-2 pr-4 md:w-[600px]">
                    <label htmlFor="header-upload" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">upload</label>
                    <label htmlFor="header-search" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">search</label>
                    <label htmlFor="header-join" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">join</label>
                </section>
                <section>
                    You can start with a markdown file, search for a public one, or join an existing workspace with an invite code.
                </section>
            </div>

        </div>
    )
}