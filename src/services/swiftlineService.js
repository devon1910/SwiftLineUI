import API from "./APIService";

export const validateToken = (token) => API.post("Auth/VerifyToken", null, { params: { token } });
export const loginUser = (request) => API.post("Auth/Login", request);
export const SignUpUser = (request) => API.post("Auth/Signup", request);
export const LogOut = () => API.post("Auth/Logout");

export const eventsList = (page, eventsPerPage, search = "") =>
  API.get("Event/SearchEvents", { params: { Page: page, Size: eventsPerPage, Query: search } });
export const createEvent = (event) => API.post("Event/CreateEvent", event);
export const eventQueueInfo = (eventId, currentMembersPage = 1, pastMembersPage = 1, size = 25) =>
  API.get("Event/GetEventQueue", {
    params: { EventId: eventId, CurrentMembersPage: currentMembersPage, PastMembersPage: pastMembersPage, Size: size },
  });
export const UserEvents = () => API.get("Event/GetUserEvents");
export const updateEvent = (event) => API.put("Event/EditEvent", event);
export const deleteEvent = (id) => API.delete(`Event/DeleteEvent/${id}`);
export const fetchEventById = (eventId) => API.get("Event/GetEvent", { params: { eventId } });

export const GetUserLineInfo = () => API.get("Line/GetUserLineInfo");
