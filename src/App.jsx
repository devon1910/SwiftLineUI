import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthForm from "./components/AuthForm";
import LandingPage from "./components/user/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer";
import VerifyToken from "./components/VerifyToken";
import VerifyTokenPage from "./components/VerifyToken";
import { LoadingProvider } from "./components/LoadingContextProvider";

function App() {
  return (
    <> <BrowserRouter>
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <LoadingProvider>
      <Routes>
        <Route path="/" element={<AuthForm />}></Route>
        <Route path="/VerifyToken" element={<VerifyTokenPage />}></Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/LandingPage" element={<LandingPage />}></Route>
        </Route>
      </Routes>
    </LoadingProvider>
  </BrowserRouter>
  <Footer/></>
   
  );
}

export default App;
