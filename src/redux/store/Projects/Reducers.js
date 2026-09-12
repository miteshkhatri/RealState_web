// reduces.js
import { PROJECTS  , SET_PROJECTS_FETCHED} from './ActionType';

const initialState = {
    projects: [],
    isFetched : false
};

const ProjectsReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROJECTS:
            return {
                ...state,
                projects: action.payload,  
                
            };
        case SET_PROJECTS_FETCHED:
            return {
                ...state,
                isFetched: action.payload,  
                
            };
        default:
            return state;
       
       
    }
};

export default ProjectsReducer;
