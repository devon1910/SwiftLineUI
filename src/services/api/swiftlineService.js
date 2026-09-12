import API from "./APIService";

const apiUrl = import.meta.env.VITE_API_URL;
const publicEventApiUrl = `${String(
  import.meta.env.VITE_NEXT_API_URL || apiUrl || "",
).replace(/\/+$/, "")}/`;
const nextAuthApiUrl = publicEventApiUrl;
const organizerEventsUrl = `${publicEventApiUrl}organizer/events`;

// Auth
export const validateToken = (token) => API.post(`${nextAuthApiUrl}Auth/VerifyToken`, { token });
export const refreshToken = (refreshTokenRequest) => API.post(`${nextAuthApiUrl}Auth/RefreshToken`,refreshTokenRequest);
export const loginUser = (loginRequest) => API.post(`${nextAuthApiUrl}Auth/Login`, loginRequest);
export const SignUpUser = (SignUpRequest) => API.post(`${nextAuthApiUrl}Auth/Signup`, SignUpRequest);
export const LogOut = () => API.post(`${nextAuthApiUrl}Auth/Logout`);
export const GetUserInfo = (authData) => API.get(`${apiUrl}Auth/GetAuthData?authCode=${authData}`);

// Events
export const eventsList = (page, eventsPerPage, search = "")=> {
  const params = new URLSearchParams();
  params.append('Page', page);
  params.append('Size', eventsPerPage);
  params.append('Query', search);
  return API.get(`${publicEventApiUrl}Event/SearchEvents?${params.toString()}`);
}
    
export const createEvent = (event) => API.post(organizerEventsUrl, event);
export const getQueueHistory = (currentPage, historyPage, size, eventId) => {

  const params = new URLSearchParams();
  params.append('CurrentMembersPage', currentPage);
  params.append('PastMembersPage', historyPage);
  params.append('Size', size);
  params.append('EventId', eventId);

  return API.get(`${apiUrl}Event/GetEventQueue?${params.toString()}`);
}
    
export const UserEvents = () => API.get(organizerEventsUrl);
export const updateEvent = (event) => API.put(`${organizerEventsUrl}/${event.eventId}`, event);
export const deleteEvent = (id) => API.delete(`${organizerEventsUrl}/${id}`);
export const fetchEventById = (eventId) =>
  API.get(`${publicEventApiUrl}Event/GetEvent`, { params: { eventId } });

// Lines
export const GetUserLineInfo = () => API.get(`${apiUrl}Line/GetUserLineInfo`);
export const GetWordLengthLeaderboard = () => API.get(`${apiUrl}Line/Top10players`);
export const UpdateUserScore = ({score, level}) => API.put(`${apiUrl}Line/UpdateUserScore`, {score, level}); 

//Feedback
export const createFeedback = (feedback) => API.post(`${apiUrl}Feedback/SubmitFeedback`, feedback);

//Subscribtion
export const subscribe = (subscription) => API.post(`${apiUrl}PushNotification/Subscribe?subscription=${subscription}`);
