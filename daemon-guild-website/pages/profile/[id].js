import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Layout from "../../components/Layout"

export async function getServerSideProps(context) {
    const requestedProfile = context.params.id;
      
    var requestInit = {
        method: 'GET',
        headers: {
            Authorization: "Bearer " + process.env.NEXT_PUBLIC_AUTH0_TOKEN,
        }
    }

    var requestUri = `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/users?q=username:"${requestedProfile}"`
    var encodedUri = encodeURI(requestUri);

    // Fetch user data from endpoint
    const res = await fetch(encodedUri, requestInit);
        
    // Parse body data
    const data = await res.json();
    
    // Take data out of the one-element array
    const dataObj = data[0];

    if(dataObj){
        return {
            props: {
                profile: dataObj,
                statusCode: res.status,
                requestedProfile: requestedProfile
            }
        }
    } else {
        return {
            props: {
                profile: null,
                statusCode: res.status, 
                requestedProfile: requestedProfile
            }
        }
    }
}

function Profile({ requestedProfile, statusCode, profile }) {
    
    const { withAuthenticationRequired } = useAuth0();
    
    const title = `${requestedProfile} - Breakfast Guild`
    
    return (
        <Layout title={title}>
            {!profile && 
                <div className="profile-container">
                    <div className="profile-content">
                        <p>User <strong>{requestedProfile}</strong> not found.</p>
                    </div>
                </div>
            }
            {profile && 
                <>
                    <div className="profile-container">
                        <div className="profile-content">
                            <div className="profile-header">
                                <div className="float-left">
                                    <ul>
                                        <li>
                                            <img src={profile.picture} alt="profile picture" width="50px" height="50px"/>
                                        </li>
                                        <li>
                                            <h3>{profile.username}</h3>
                                        </li>
                                        
                                    </ul>
                                </div>
                                <div className="float-right">
                                    <ul>
                                        {drawRoles(profile)}                  
                                    </ul>
                                </div>
                            </div>
                            <div className="profile-meta">

                            </div>
                            <div className="profile-body">
                                
                            </div>                            
                        </div>
                    </div>
                </>
            }
            
        </Layout>
    )
}

function drawRoles(profile){
    let string = new String;
    string = profile.user_metadata.discordRank;
    console.log(string)

    if (string.includes("meal")) {
        console.log('includes meal')
        return (
            <li>
                <div className="profile-role-meal">
                    <p>Meal</p>
                </div>
            </li>
        )
    } else if (string.includes("side course")) {        
        return (<>
            <li>
                <div className="profile-role-side">
                    <p>Side Course</p>
                </div>
            </li>
        </>)
    }
}

export default Profile;
// export default withAuthenticationRequired(Profile, {
//     onRedirecting: () => <p>Loading...</p>,
// });