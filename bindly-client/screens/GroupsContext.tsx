import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Group, GroupData, GroupsContextType,InternalGroupsContextType} from '../types';


function isValidGroupData(data: any): data is GroupData {

    
    return (
      typeof data === 'object' &&
      data !== null &&
      'group' in data &&
      'post' in data &&
      'usergroup' in data &&
      Array.isArray(data.post) &&
      Array.isArray(data.usergroup) &&
      typeof data.group === 'object' &&
      data.group !== null &&
      'groupid' in data.group &&
      'groupname' in data.group
    );
  }


export const GroupsContext = createContext<InternalGroupsContextType>({
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
        console.log(groupData, 'groupData\n\n')
        if (groupData && !isValidGroupData(groupData)) {
            console.error('Invalid group data:', groupData);
            throw new Error('Invalid group data structure');
        }
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
    return context as GroupsContextType;
};