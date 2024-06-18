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
                    <label htmlFor="header-upload" className=" px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">
                        <svg t="1718611526549" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6563" width="40" height="40">
                            <path d="M324.6592 352.13312c7.1168 0 13.34272-2.66752 18.688-8.00768l141.50656-141.51168v443.2128c0 15.12448 11.5712 26.70592 26.7008 26.70592s26.7008-11.58144 26.7008-26.70592V202.61376l141.50656 141.51168c5.34528 5.34016 12.4672 8.00768 18.688 8.00768 6.23616 0 13.35296-2.66752 18.69312-8.00768 10.68032-10.68032 10.68032-27.59168 0-37.38112l-186.9056-186.89536c-0.88576-0.89088-2.66752-2.66752-4.44416-3.5584-0.88576 0-1.77664-0.89088-1.77664-0.89088-0.896-0.88576-1.78688-0.88576-2.67776-1.77664-0.89088 0-1.77664-0.89088-2.66752-0.89088-0.896 0-1.77664-0.89088-2.66752-0.89088a21.67296 21.67296 0 0 0-10.68032 0c-0.89088 0-1.77664 0.89088-2.66752 0.89088-0.89088 0-1.78176 0.89088-2.67264 0.89088-0.89088 0-1.77664 0.89088-2.66752 1.77664-0.89088 0-1.77664 0.89088-1.77664 0.89088-1.78176 0.89088-2.66752 1.78176-4.4544 3.5584L304.18944 306.74432c-10.68032 10.68032-10.68032 27.59168 0 37.38112 7.1168 5.34016 13.34784 8.00768 20.46976 8.00768z" fill="currentcolor" p-id="6564"></path>
                            <path d="M929.84832 556.83072c-15.1296 0-26.7008 11.5712-26.7008 26.7008v206.47936c0 38.272-31.15008 69.42208-69.41696 69.42208H189.37856c-38.26688 0-69.41696-31.15008-69.41696-69.42208v-206.47936c0-15.1296-11.5712-26.7008-26.7008-26.7008s-26.69568 11.5712-26.69568 26.7008v206.47936c0 67.6352 55.17824 122.81856 122.81856 122.81856h645.23776c67.64544 0 122.82368-55.18336 122.82368-122.81856v-206.47936c-0.896-15.1296-12.4672-26.7008-27.5968-26.7008z" fill="currentcolor" p-id="6565"></path>
                        </svg>
                    </label>
                    <label htmlFor="header-search" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">
                        <svg t="1718610604256" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2739" width="40" height="40">
                            <path d="M915.8 852.9L766.9 706.7c47.4-62.8 75.9-140.7 75.9-225.5 0-207-167.8-374.9-374.9-374.9-207.1 0.1-374.9 167.9-374.9 375s167.8 374.9 374.9 374.9c95.4 0 182.2-35.9 248.4-94.6L865.4 908c14.7 14.4 37.8 13.8 51.7-1.4 13.9-15.2 13.3-39.3-1.3-53.7zM467.9 790c-170.5 0-308.7-138.2-308.7-308.7s138.2-308.7 308.7-308.7 308.7 138.2 308.7 308.7S638.4 790 467.9 790z m0 0" fill="currentcolor" p-id="2740"></path></svg>
                    </label>
                    <label htmlFor="header-join" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">
                        <svg t="1718611088630" className="icon" viewBox="0 0 1084 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1500" width="40" height="40">
                            <path d="M707.764706 514.228706a255.337412 255.337412 0 1 1 0-510.674824 255.337412 255.337412 0 0 1 0 510.674824z m0-60.235294a195.102118 195.102118 0 1 0 0-390.204236 195.102118 195.102118 0 0 0 0 390.204236z" fill="currentcolor" p-id="1501"></path>
                            <path d="M566.633412 54.633412l-25.901177 54.39247a177.272471 177.272471 0 1 0 35.418353 298.164706l37.948236 46.742588a237.507765 237.507765 0 1 1-47.465412-399.36z" fill="currentcolor" p-id="1502"></path>
                            <path d="M921.238588 503.928471a30.117647 30.117647 0 1 1-26.804706 53.910588 420.321882 420.321882 0 0 0-606.991058 376.711529 30.117647 30.117647 0 0 1-60.235295 0 480.557176 480.557176 0 0 1 694.031059-430.682353z" fill="currentcolor" p-id="1503"></path>
                            <path d="M545.852235 464.956235a30.117647 30.117647 0 0 1-14.095059 58.548706 334.607059 334.607059 0 0 0-413.214117 325.330824 30.117647 30.117647 0 1 1-60.235294 0A394.842353 394.842353 0 0 1 545.792 465.016471z" fill="currentcolor" p-id="1504"></path>
                            <path d="M996.773647 785.347765a30.117647 30.117647 0 0 1 0 60.235294h-241.302588a30.117647 30.117647 0 1 1 0-60.235294h241.302588z" fill="currentcolor" p-id="1505"></path>
                            <path d="M906.24 936.056471a30.117647 30.117647 0 1 1-60.235294 0v-241.242353a30.117647 30.117647 0 1 1 60.235294 0v241.302588z" fill="currentcolor" p-id="1506"></path>
                        </svg>
                    </label>
                    <a href="/market" className="px-2 flex items-center justify-center bg-default rounded h-[50px] hover:cursor-pointer">
                        <svg t="1718611370214" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2475" width="40" height="40">
                            <path d="M761.6 489.6l-432-435.2c-9.6-9.6-25.6-9.6-35.2 0-9.6 9.6-9.6 25.6 0 35.2l416 416-416 425.6c-9.6 9.6-9.6 25.6 0 35.2s25.6 9.6 35.2 0l432-441.6C771.2 515.2 771.2 499.2 761.6 489.6z" p-id="2476" fill="currentcolor"></path>
                        </svg>
                    </a>
                </section>
                <section>
                    {dictionary.HomePage.start_with}
                </section>
            </div>
        </div>
    )
}