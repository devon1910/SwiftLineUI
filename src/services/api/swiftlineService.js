import API from "./APIService";

const apiUrl = import.meta.env.VITE_API_URL;

// Auth
export const validateToken = (token) => API.post(`${apiUrl}Auth/VerifyToken?token=${token}`);
export const loginUser = (loginRequest) => API.post(`${apiUrl}Auth/Login`, loginRequest);
export const SignUpUser = (SignUpRequest) => API.post(`${apiUrl}Auth/SignUp`, SignUpRequest);
export const LogOut = () => API.post(`${apiUrl}Auth/Revoke`);

// Events
export const eventsList = (page, eventsPerPage, search = "") => 
    API.get(`${apiUrl}Event/SearchEvents?Page=${page}&Size=${eventsPerPage}&Query=${search}`);
export const createEvent = (event) => API.post(`${apiUrl}Event/CreateEvent`, event);
export const eventQueueInfo = (page, size, eventId) => 
    API.get(`${apiUrl}Event/GetEventQueue?Page=${page}&Size=${size}&EventId=${eventId}`);
export const UserEvents = () => API.get(`${apiUrl}Event/GetUserEvents`);
export const updateEvent = (event) => API.put(`${apiUrl}Event/EditEvent`, event);
export const deleteEvent = (id) => API.delete(`${apiUrl}Event/DeleteEvent/${id}`);
export const fetchEventById = (eventId) => API.get(`${apiUrl}Event/GetEvent/${eventId}`);

// Lines
export const GetUserLineInfo = () => API.get(`${apiUrl}Line/GetUserLineInfo`);
