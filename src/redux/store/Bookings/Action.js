// actions.js
import {BOOKINGS , SET_BOOKINGS_FETCHED } from './ActionType';

export const Bookings = (bookingData) => {
    return {
        type: BOOKINGS,
        payload: bookingData,  
    };
};

export const setIsFetched = (status) => ({
    type: SET_BOOKINGS_FETCHED,
    payload: status,
});
 
