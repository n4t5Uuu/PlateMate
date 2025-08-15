import Auth from './auth';
import Head from 'next/head';

export default function Home() {
  return (

    <>
      {/**Not working and needs fixing*/}
      <Head>
        <title>PlateMate Portal</title>
      </Head>

      <Auth />
    </>
  )
    
}
