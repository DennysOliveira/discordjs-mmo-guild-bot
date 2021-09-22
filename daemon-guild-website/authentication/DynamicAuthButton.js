import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import SignupButton from './SignupButton';


export default function DynamicAuthButton() {
    const { isAuthenticated, isLoading, error } = useAuth0();

    if (error) {
        return (<p>Error: {error.message}</p>)
    }

    if (isLoading) {
        return (<span></span>)
    }


    return (
        <>
            <div className="authButtonContainer">
                {!isAuthenticated && <LoginButton />}
                {isAuthenticated && <LogoutButton />}
            </div>
        </>
    )
}