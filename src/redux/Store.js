// Store.js
import { createStore, combineReducers } from 'redux';
import authReducer from './store/auth/Reducers';
import preBookingReducer from './store/PreBookings/Reducers';
import BookingReducer from './store/Bookings/Reducers'
import ProjectsReducer from './store/Projects/Reducers'
const rootReducer = combineReducers({
    auth: authReducer, 
    prebooking:preBookingReducer ,
    bookings:BookingReducer,
    projects:ProjectsReducer
});

const store = createStore(rootReducer);

export default store;
