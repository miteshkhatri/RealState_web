// actions.js
import { LOGIN_SUCCESS,  LOGOUT } from './ActionType';

export const loginSuccess = (userData) => {
    return {
        type: LOGIN_SUCCESS,
        payload: userData,  
    };
};


export const logout = () => {
    return {
        type: LOGOUT,
    };
};
