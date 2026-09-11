import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthForm from "./components/auth/AuthForm";
import { AppShell, MarketingShell } from "./components/user/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

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
import FAQPage from "./components/user/FAQ";
import AboutUsPage from "./components/user/AboutUsPage";
import HowItWorks from "./components/user/HowItWorks";
import EventDetails from "./components/user/EventDetails";

function App() {
  return (
    <>
      <BrowserRouter>
        <LoadingProvider>
          <Routes>         
            <Route path="/" element={<MarketingShell />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route element={<AppShell />}>
              <Route path="search" element={<SearchEvents />} />
              <Route element={<ProtectedRoute />}>
                <Route path="myEvents" element={<MyEvents />} />
                <Route path="newEvent" element={<EventForm />} />
                <Route path="events/:eventId/edit" element={<EventForm />} />
                <Route path="events/:eventId/manage" element={<ViewQueue />} />
                <Route path="myQueue" element={<MyQueue />} />
              </Route>
              <Route path="events/:eventId" element={<ViewEvent />} />      
            </Route>
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/VerifyToken" element={<VerifyToken />} />
          </Routes>
        </LoadingProvider>
      </BrowserRouter>
      <CustomToast/>
    </>
  );
}

export default App;
