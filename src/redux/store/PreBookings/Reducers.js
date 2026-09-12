// reduces.js
import { PREE_BOOKINGS  , SET_IS_FETCHED} from './ActionType';

const initialState = {
    prebookings: [],
    isFetched : false
};

const preBookingReducer = (state = initialState, action) => {
    switch (action.type) {
        case PREE_BOOKINGS:
            return {
                ...state,
                prebookings: action.payload,  
                
            };
        case SET_IS_FETCHED:
            return {
                ...state,
                isFetched: action.payload,  
                
            };
        default:
            return state;
       
       
    }
};

export default preBookingReducer;
