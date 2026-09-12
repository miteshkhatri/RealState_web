// actions.js
import {PREE_BOOKINGS , SET_IS_FETCHED } from './ActionType';

export const preeBookings = (bookingData) => {
    return {
        type: PREE_BOOKINGS,
        payload: bookingData,  
    };
};

export const setIsFetched = (status) => ({
    type: SET_IS_FETCHED,
    payload: status,
});
 
