import '../styles/globals.css'
import '../styles/stackededit.css'
import '../styles/headerStyles.css'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';


function MyApp({ Component, pageProps }) {
    const { isLoading, error } = useAuth0();
    
        
    return (
        <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}            
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENTID}
            redirectUri={process.env.NEXT_PUBLIC_AUTH0_REDIRECTURI}
            audience={process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}
            scope="read:current_user update:current_user_metadata read:current_user_metadata create:current_user_metadata"
        >
            <Component {...pageProps} />
        </Auth0Provider>
    )
}

export default MyApp
