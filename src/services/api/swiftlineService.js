import API from "./APIService";

const apiUrl = import.meta.env.VITE_API_URL;

// Auth
export const validateToken = (token) => API.post(`${apiUrl}Auth/VerifyToken?token=${token}`);
export const refreshToken = (refreshTokenRequest) => API.post(`${apiUrl}Auth/RefreshToken`,refreshTokenRequest);
export const loginUser = (loginRequest) => API.post(`${apiUrl}Auth/Login`, loginRequest);
export const SignUpUser = (SignUpRequest) => API.post(`${apiUrl}Auth/SignUp`, SignUpRequest);
export const VerifyTurnstileToken = (TurnsTileRequest) => API.post(`${apiUrl}Auth/VerifyTurnstileToken`, TurnsTileRequest);
export const LogOut = () => API.post(`${apiUrl}Auth/Logout`);

// Events
export const eventsList = (page, eventsPerPage, search = "") => 
    API.get(`${apiUrl}Event/SearchEvents?Page=${page}&Size=${eventsPerPage}&Query=${search}`);
export const createEvent = (event) => API.post(`${apiUrl}Event/CreateEvent`, event);
export const getQueueHistory = (currentPage, historyPage, size, eventId) => 
    API.get(`${apiUrl}Event/GetEventQueue?CurrentMembersPage=${currentPage}&PastMembersPage=${historyPage}&Size=${size}&EventId=${eventId}`);
export const UserEvents = () => API.get(`${apiUrl}Event/GetUserEvents`);
export const updateEvent = (event) => API.put(`${apiUrl}Event/EditEvent`, event);
export const deleteEvent = (id) => API.delete(`${apiUrl}Event/DeleteEvent/${id}`);
export const fetchEventById = (eventId) => API.get(`${apiUrl}Event/GetEvent/${eventId}`);

// Lines
export const GetUserLineInfo = () => API.get(`${apiUrl}Line/GetUserLineInfo`);

//Feedback
export const createFeedback = (feedback) => API.post(`${apiUrl}Feedback/SubmitFeedback`, feedback);

//Subscribtion
export const subscribe = (subscription) => API.post(`${apiUrl}PushNotification/Subscribe?subscription=${subscription}`);