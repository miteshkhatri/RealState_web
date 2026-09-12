// actions.js
import {PROJECTS , SET_PROJECTS_FETCHED } from './ActionType';

export const projects = (projectData) => {
    return {
        type: PROJECTS,
        payload: projectData,  
    };
};

export const setIsFetched = (status) => ({
    type: SET_PROJECTS_FETCHED,
    payload: status,
});
 
