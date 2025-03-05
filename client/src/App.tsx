import './App.css'
import LoginPage from './components/auth/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import TenantRegister from './components/auth/TenantRegister';
import EmailConformation from './components/auth/EmailConformation';

function App() {
  return (
    <Router>
      <Routes>
          <Route path='/org/register' Component={TenantRegister}/>
          <Route path='/login' Component={LoginPage} />
          <Route path="/activate" element={<EmailConformation />} />
      </Routes>
    </Router>
  );
}

export default App;
