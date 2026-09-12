// reduces.js
import { LOGIN_SUCCESS,  LOGOUT } from './ActionType';

const initialState = {
    user: null,
    error: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,  
                error: null,
            };
       
        case LOGOUT:
            return {
                ...state,
                user: null,
                error: null,
            };
        default:
            return state;
    }
};

export default authReducer;
