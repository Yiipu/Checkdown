import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { NextUIProvider } from '@nextui-org/system'
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LayoutHeader } from "./components/header"
import { getDictionary } from "lib/dictionaries";

export async function generateStaticParams() {
  const locales = ["en", "zh"];

  return locales.map((lang) => ({
    lang: lang,
  }))
}

export async function generateMetadata({ params: { lang } }, parent) {
  const dictionary = await getDictionary(lang);

  return {
    generator: 'Next.js',
    title: "Checkdown",
    description: dictionary.MetaData.description,
    keywords: dictionary.MetaData.keywords,
    authors:[{
      name:"yiipu",
      url:"https://github.com/Yiipu"
    }],
    
  }
}

export default async function RootLayout({ children, params: { lang } }) {
  const dictionary = await getDictionary(lang);
  return (
    <html lang={lang}>
      <UserProvider>
        <body>
          <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
              <LayoutHeader dictionary={dictionary} />
              <div className="w-full mx-auto max-w-[1024px] px-6">
                {children}
              </div>
            </NextThemesProvider>
          </NextUIProvider>
        </body>
      </UserProvider>
    </html>
  );
}
