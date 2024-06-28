import React, { createContext, useContext, useEffect, useState } from 'react';

const GroupsContext = createContext(null);

export const GroupsProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [groupData,setGroupData]=useState()

    useEffect(()=>{
        console.log(groups,'from groups context')
    },[groups])



    useEffect(()=>{
        // console.log(groupData,'from groupData context')
    },[groupData])



    return (
        <GroupsContext.Provider value={{ groups, setGroups,groupData,setGroupData }}>
            {children}
        </GroupsContext.Provider>
    );
};

export const useGroupsContext = () => useContext(GroupsContext);
