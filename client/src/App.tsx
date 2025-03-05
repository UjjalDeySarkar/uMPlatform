import './App.css'
import LoginPage from './components/auth/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import TenantRegister from './components/auth/TenantRegister';
import RegisterPage from './components/auth/Register';

function App() {
  return (
    <Router>
      <Routes>
          <Route path='/org/register' Component={TenantRegister}/>
          <Route path='/register' Component={RegisterPage}/>
          <Route path='/login' Component={LoginPage} />
      </Routes>
    </Router>
  );
}

export default App;
