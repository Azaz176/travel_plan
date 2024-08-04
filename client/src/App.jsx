import { Routes, Route} from 'react-router-dom';
import './App.css'
import Login from './components/Login';
import Layout from './components/Layout';
import Register from './components/Register';
import axios from 'axios';
import { UserContextProvider } from './context/UserContext';
import Account from './components/Account';
import Places from './components/Places';
import PlacesForm from './components/placesForm';

axios.defaults.baseURL = 'http://localhost:4000'
axios.defaults.withCredentials = true

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/places" element={<Places />} />
          <Route path="/account/places/new" element={<PlacesForm />} />
          <Route path="/account/places/:id" element={<PlacesForm />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App
