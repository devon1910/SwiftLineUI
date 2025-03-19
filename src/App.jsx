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
        <LoadingProvider>
          <Routes>         
            <Route path="/*" element={<LandingPage />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="search" element={<SearchEvents />} />
              <Route path="myevents" element={<MyEvents />} />
              <Route element={<ProtectedRoute />}>
                <Route path="eventForm" element={<EventForm />} />
              </Route>
              <Route path="myqueue" element={<MyQueue />} />
              <Route path="queueManagement" element={<ViewQueue />} />         
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
