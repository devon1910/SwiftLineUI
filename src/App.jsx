import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthForm from "./components/auth/AuthForm";
import LandingPage from "./components/user/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import VerifyToken from "./components/auth/VerifyToken";
import { LoadingProvider } from "./components/common/LoadingContextProvider";
import MyEvents from "./components/user/MyEvents";
import SearchEvents from "./components/user/SearchEvents";
import MyQueue from "./components/user/MyQueue";
import ViewQueue from "./components/user/ViewQueue";
import Dashboard from "./components/user/Dashboard";
import EventForm from "./components/user/EventForm";
import ViewEvent from "./components/user/ViewEvent";
import CustomToast from "./components/common/CustomToast";
import { ThemeProvider } from "./services/context/ThemeProvider";
import FeedbackForm from "./components/user/FeedbackForm";
import { FeedbackProvider } from "./services/context/FeedbackProvider";

function App() {
  return (
    <>
      <BrowserRouter>
        <ThemeProvider>
          <LoadingProvider>
            <FeedbackProvider>        
              <Routes>
                <Route path="/*" element={<LandingPage />}>
                  <Route index element={<Dashboard />} />
                  <Route path="search" element={<SearchEvents />} />
                  <Route path="myEvents" element={<MyEvents />} />
                  <Route path="newEvent" element={<EventForm />} />
                  <Route path="myQueue" element={<MyQueue />} />
                  <Route path="queueManagement" element={<ViewQueue />} />
                  <Route path="events/:eventId" element={<ViewEvent />} />
                </Route>
                <Route path="/auth" element={<AuthForm />} />
                <Route path="/VerifyToken" element={<VerifyToken />} />
              </Routes>
              <CustomToast />
              <Footer />
              <FeedbackForm />
            </FeedbackProvider>
          </LoadingProvider>
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
