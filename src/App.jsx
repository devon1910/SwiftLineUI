
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthForm from './components/AuthForm';
import LandingPage from './components/user/LandingPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {  
  return (
    <BrowserRouter>
         <Routes>
           <Route path="/" element={<AuthForm />}></Route>
           <Route path="/LandingPage" element={<LandingPage />}></Route>
         </Routes>
    </BrowserRouter>
  );
}

export default App
