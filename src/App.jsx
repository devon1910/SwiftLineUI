import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthForm from "./components/AuthForm";
import LandingPage from "./components/user/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import Footer from "./components/Footer";
import VerifyToken from "./components/VerifyToken";
import { LoadingProvider } from "./components/LoadingContextProvider";
import MyEvents from "./components/user/MyEvents";
import SearchEvents from "./components/user/SearchEvents";
import MyQueue from "./components/user/MyQueue";
import ViewQueue from "./components/user/ViewQueue";
import Dashboard from "./components/user/Dashboard";
import EventForm from "./components/user/EventForm";
import ViewEvent from "./components/user/ViewEvent";
import { CustomCursor } from "./components/CustomCursor";
import ParticlesBackground from "./components/ParticlesComponent";

function App() {
  return (
    <>
      <BrowserRouter>
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
        <CustomCursor/>
        <LoadingProvider>
          <Routes>         
            <Route path="/*" element={<LandingPage />}>
              <Route index element={<Dashboard />} />
              <Route path="search" element={<SearchEvents />} />
              <Route path="myevents" element={<MyEvents />} />
              <Route element={<ProtectedRoute />}>
                <Route path="newEvent" element={<EventForm />} />
              </Route>
              <Route path="myqueue" element={<MyQueue />} />
              <Route path="queueManagement" element={<ViewQueue />} />   
              <Route path="events/:eventId" element={<ViewEvent />} />      
            </Route>
            <Route path="/login" element={<AuthForm />} />
            <Route path="/VerifyToken" element={<VerifyToken />} />
          </Routes>
        </LoadingProvider>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
