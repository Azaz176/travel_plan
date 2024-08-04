import { useContext, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../context/UserContext'
import { Navigate, useParams } from 'react-router-dom'
import Places from './Places'
import AccountNav from './AccountNav'

const Account = () => {
  const [redirect, setRedirect] = useState(null)
  const { ready, user, setUser } = useContext(UserContext)

  let { subpage } = useParams();
  if (!subpage) {
    subpage = "profile";
  }

  const logout = async () => {
    await axios.post('/logout')
    setRedirect('/')
    setUser(null);
  }
  
  if (!ready) {
    return 'Loading...'
  }
  if (ready && !user && !redirect) {
    return <Navigate to={'/login'} />
  }

  if (redirect) {
    return <Navigate to={redirect} />
  }
  
  return (
    <div>
      <AccountNav />
      {subpage === "profile" && user && (
        <div className="text-center max-w-lg mx-auto">
          Logged in as {user.name} ({user.email}) <br />
          <button onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>
      )}
      {subpage === "places" && <Places />}
    </div>
  );
}

export default Account
