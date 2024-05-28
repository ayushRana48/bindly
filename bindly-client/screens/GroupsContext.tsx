import React, { createContext, useContext, useEffect, useState } from 'react';

const GroupsContext = createContext(null);

export const GroupsProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [currentGroup,setCurrentGroup]=useState()

    useEffect(()=>{
        console.log(groups,'from groups context')
    },[groups])



    return (
        <GroupsContext.Provider value={{ groups, setGroups }}>
            {children}
        </GroupsContext.Provider>
    );
};

export const useGroupsContext = () => useContext(GroupsContext);
