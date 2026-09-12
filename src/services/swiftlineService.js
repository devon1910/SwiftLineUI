import API from "./APIService";

const normalizeBaseUrl = (value) => `${String(value ?? "").replace(/\/+$/, "")}/`;
const publicEventApiUrl = normalizeBaseUrl(
  import.meta.env.VITE_NEXT_API_URL || import.meta.env.VITE_API_URL,
);
const organizerEventsUrl = `${publicEventApiUrl}organizer/events`;
const queueApiUrl = `${publicEventApiUrl}`;

export const validateToken = (token) => API.post("Auth/VerifyToken", null, { params: { token } });
export const loginUser = (request) => API.post(`${publicEventApiUrl}Auth/Login`, request);
export const SignUpUser = (request) => API.post("Auth/Signup", request);
export const LogOut = () => API.post(`${publicEventApiUrl}Auth/Logout`);

export const eventsList = (page, eventsPerPage, search = "") =>
  API.get(`${publicEventApiUrl}Event/SearchEvents`, {
    params: { Page: page, Size: eventsPerPage, Query: search },
  });
export const createEvent = (event) => API.post(organizerEventsUrl, event);
export const eventQueueInfo = (eventId, currentMembersPage = 1, pastMembersPage = 1, size = 25) =>
  API.get("Event/GetEventQueue", {
    params: { EventId: eventId, CurrentMembersPage: currentMembersPage, PastMembersPage: pastMembersPage, Size: size },
  });
export const UserEvents = () => API.get(organizerEventsUrl);
export const updateEvent = (event) => API.put(`${organizerEventsUrl}/${event.eventId}`, event);
export const deleteEvent = (id) => API.delete(`${organizerEventsUrl}/${id}`);
export const fetchEventById = (eventId) =>
  API.get(`${publicEventApiUrl}Event/GetEvent`, { params: { eventId } });

export const GetUserLineInfo = () => API.get("Line/GetUserLineInfo");
export const joinEventQueue = (eventId, displayName) => API.post(`${queueApiUrl}events/${eventId}/join`, displayName ? { displayName } : {});
export const getMyQueue = () => API.get(`${queueApiUrl}me/queue`);
export const leaveMyQueue = () => API.post(`${queueApiUrl}me/queue/leave`);
export const getOrganizerQueue = (eventId) => API.get(`${queueApiUrl}organizer/events/${eventId}/queue`);
export const setOrganizerQueueActivity = (eventId, isActive) => API.patch(`${queueApiUrl}organizer/events/${eventId}/queue`, { isActive });
export const serveOrganizerQueueMember = (eventId, lineId) => API.post(`${queueApiUrl}organizer/events/${eventId}/queue/${lineId}/serve`);
