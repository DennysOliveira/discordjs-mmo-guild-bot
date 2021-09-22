import Link from 'next/link'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ children, title = "<Breakfast>" })
{
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <link rel="icon" href="/unchained.png" />
            </Head>
            <Header/>
            <div className="navbarMargin"></div>
            {children}
            <Footer />
        </>
    )

}