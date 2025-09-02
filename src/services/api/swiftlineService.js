import API from "./APIService";

const apiUrl = import.meta.env.VITE_API_URL;

// Auth
export const validateToken = (token) => API.post(`${apiUrl}Auth/VerifyToken?token=${token}`);
export const refreshToken = (refreshTokenRequest) => API.post(`${apiUrl}Auth/RefreshToken`,refreshTokenRequest);
export const loginUser = (loginRequest) => API.post(`${apiUrl}Auth/Login`, loginRequest);
export const SignUpUser = (SignUpRequest) => API.post(`${apiUrl}Auth/SignUp`, SignUpRequest);
export const VerifyTurnstileToken = (TurnsTileRequest) => API.post(`${apiUrl}Auth/VerifyTurnstileToken`, TurnsTileRequest);
export const LogOut = () => API.post(`${apiUrl}Auth/Logout`);
export const GetUserInfo = (authData) => API.get(`${apiUrl}Auth/GetAuthData?authCode=${authData}`);

// Events
export const eventsList = (page, eventsPerPage, search = "")=> {
  const params = new URLSearchParams();
  params.append('Page', page);
  params.append('Size', eventsPerPage);
  params.append('Query', search);
  return API.get(`${apiUrl}Event/SearchEvents?${params.toString()}`);
}
    
export const createEvent = (event) => API.post(`${apiUrl}Event/CreateEvent`, event);
export const getQueueHistory = (currentPage, historyPage, size, eventId) => {

  const params = new URLSearchParams();
  params.append('CurrentMembersPage', currentPage);
  params.append('PastMembersPage', historyPage);
  params.append('Size', size);
  params.append('EventId', eventId);

  return API.get(`${apiUrl}Event/GetEventQueue?${params.toString()}`);
}
    
export const UserEvents = () => API.get(`${apiUrl}Event/GetUserEvents`);
export const updateEvent = (event) => API.put(`${apiUrl}Event/EditEvent`, event);
export const deleteEvent = (id) => API.delete(`${apiUrl}Event/DeleteEvent/${id}`);
export const fetchEventById = (eventId) => API.get(`${apiUrl}Event/GetEvent/${eventId}`);

// Lines
export const GetUserLineInfo = () => API.get(`${apiUrl}Line/GetUserLineInfo`);
export const GetWordLengthLeaderboard = () => API.get(`${apiUrl}Line/Top10players`);
export const UpdateUserScore = ({score, level}) => API.put(`${apiUrl}Line/UpdateUserScore`, {score, level}); 

//Feedback
export const createFeedback = (feedback) => API.post(`${apiUrl}Feedback/SubmitFeedback`, feedback);

//Subscribtion
export const subscribe = (subscription) => API.post(`${apiUrl}PushNotification/Subscribe?subscription=${subscription}`);