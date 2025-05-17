export const saveAuthTokens = (response,src="") => {
  
  if(src ==="google"){
    const { accessToken, refreshToken, username, userId } = response;
    localStorage.setItem('user', JSON.stringify(accessToken));
    localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
    localStorage.setItem('userName', username);
    localStorage.setItem('userId', JSON.stringify(userId));
  }else{
    const { accessToken, refreshToken, username, userId } = response.data.data;
  localStorage.setItem('user', JSON.stringify(accessToken));
  localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
  localStorage.setItem('userName', username);
  localStorage.setItem('userId', JSON.stringify(userId));
  }
  
};
export const saveAuthTokensFromSignalR = (response) => {

  const { accessToken, refreshToken, userName, userId } = response;
  if(response.isNewUser)
    {
      localStorage.setItem('user', JSON.stringify(accessToken));
      localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
      localStorage.setItem('userName', userName);
      localStorage.setItem('userId', JSON.stringify(userId));
    }

};

export const validatePassword = (password) => {
  const minLength = 6;
  const hasNonAlphanumeric = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return password.length >= minLength && hasNonAlphanumeric && hasDigit;
};

export const getPasswordRequirements = (password) => {
  return {
    hasMinLength: password.length >= 6,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
};

export const handleAuthSuccess = (response, navigate, from) => {
  const { email, isInLine, userId, userName } = response.data.data;
  
  if (from) {
    window.location.href = from;
  } else {
    navigate('/', {
      state: { email, isInLine, userId, userName },
      replace: true,
    });
  }
}; 