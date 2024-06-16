import { Link } from "@nextui-org/link"
import { Demo } from "./components/demo"
import { getDictionary } from "lib/dictionaries"

export default async function Page({ params: { lang } }) {
    const dictionary = await getDictionary(lang)

    return (
        <div className=" pt-6 grid gap-2">
            <div className="md:flex items-center">
                <section className="md:w-[200px] px-2">
                    <span className=" font-bold">Checkdown</span>{dictionary.HomePage.description}
                </section>
                <Demo />
            </div>
            <section>
                {dictionary.HomePage.uses} <Link href="https://nextjs.org/">Next.js</Link>, <Link href="https://socket.io/">Socket.IO</Link> {dictionary.HomePage.and} <Link href="https://mdxjs.com/">MDX</Link> {dictionary.HomePage.built}. {dictionary.HomePage.visit_src} <Link href="https://github.com/Yiipu/checkdown">Github</Link>.
            </section>
            <div className="md:flex">
                <section className="grid grid-cols-2 gap-2 pr-4 md:w-[600px]">
                    <label htmlFor="header-upload" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">upload</label>
                    <label htmlFor="header-search" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">search</label>
                    <label htmlFor="header-join" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">join</label>
                    <a href="/market" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">explore</a>
                </section>
                <section>
                    {dictionary.HomePage.start_with}
                </section>
            </div>
        </div>
    )
}