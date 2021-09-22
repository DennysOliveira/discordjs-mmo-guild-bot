import { useAuth0 } from '@auth0/auth0-react';
import Link from 'next/link';
import DynamicAuthButton from '../authentication/DynamicAuthButton';






function Header() {
    const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
    
    return (
        <div className="headerContainer">
            <nav className="headerContent">
                <div className="imageContainer"><img src="/archeagelogo.jpg"  width="70px" height="60px" /></div>
                <div className="float-left">
                    
                    <ul>
                        
                        <li><h1 className="mainHeader">Breakfast Guild</h1></li>    
                        <li>
                            <Link href="/">
                                <a className="navListItemAnchor">Home</a>
                            </Link>
                        </li>
                        
                        <li>
                            <Link href="/about">
                                <a className="navListItemAnchor">About</a>
                            </Link>
                        </li>
                        {!isAuthenticated && 
                            <>
                                <li>
                                <Link href="/join">
                                    <a className="navListItemAnchor">Join</a>
                                </Link>
                                </li>
                            </>
                        }      
                        {isAuthenticated &&
                            <li>
                                <Link href="/strats">
                                    <a className="navListItemAnchor">Strategies Lookup</a>
                                </Link>
                            </li>
                        }
                        
                    </ul>
                </div>
                <div className="float-right">
                        <ul>
                            {isAuthenticated &&
                                <>  
                                    <li>
                                        <img className="profile-picture" src={user.picture} width="40px" height="40px"></img>
                                    </li>
                                    <li>
                                        Hello, {user.nickname}!                                        
                                    </li>
                                </>
                            }
                            
                            <li>
                                <DynamicAuthButton />
                            </li>
                        </ul>
                </div>
            </nav>
        </div>
    )
}

export default Header;