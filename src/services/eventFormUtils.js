export const getEventSaveErrorMessage = (error, isEditing = false) => {
  const responseBody = error?.response?.data;
  const message =
    (typeof responseBody?.message === "string" && responseBody.message) ||
    (typeof responseBody?.data?.message === "string" && responseBody.data.message);

  return message || `Unable to ${isEditing ? "update" : "create"} this event. Please check the form and try again.`;
};

