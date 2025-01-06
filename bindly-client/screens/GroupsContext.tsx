import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Group, GroupsContextType } from '../types';

export const GroupsContext = createContext<GroupsContextType>({
  groups: [],
  setGroups: () => {},
  groupData: null,
  setGroupData: () => {}
});

interface GroupsProviderProps {
  children: ReactNode;
}

export const GroupsProvider = ({ children }: GroupsProviderProps) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [groupData, setGroupData] = useState<any>(null); // TODO: Define specific type for groupData

    useEffect(() => {
        console.log(groups, 'from groups context');
    }, [groups]);

    useEffect(() => {
        // console.log(groupData,'from groupData context')
    }, [groupData]);

    return (
        <GroupsContext.Provider 
            value={{ 
                groups, 
                setGroups, 
                groupData, 
                setGroupData 
            }}
        >
            {children}
        </GroupsContext.Provider>
    );
};

export const useGroupsContext = (): GroupsContextType => {
    const context = useContext(GroupsContext);
    if (!context) {
        throw new Error('useGroupsContext must be used within a GroupsProvider');
    }
    return context;
};