import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthForm from "./components/AuthForm";
import LandingPage from "./components/user/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />}></Route>
        <Route element= {<ProtectedRoute/>}>
          <Route path="/LandingPage" element={<LandingPage />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
