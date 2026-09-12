// reduces.js
import { BOOKINGS  , SET_BOOKINGS_FETCHED} from './ActionType';

const initialState = {
    bookings: [],
    isFetched : false
};

const BookingReducer = (state = initialState, action) => {
    switch (action.type) {
        case BOOKINGS:
            return {
                ...state,
                bookings: action.payload,  
                
            };
        case SET_BOOKINGS_FETCHED:
            return {
                ...state,
                isFetched: action.payload,  
                
            };
        default:
            return state;
       
       
    }
};

export default BookingReducer;
