import { ReactNode } from 'react';

// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  pfp?: string;
  lastpfpupdate?: Date;
  balance: number;
  stripeid?: string;
  tokens?: string[];
  lastlogin?: Date;
  timezone?: string;
  stravarefresh?: string;
}

// Group related types
export interface Group {
  groupid: string;
  groupname: string;
  description?: string;
  buyin?: number;
  week?: Date;
  startdate?: Date;
  timeleft?: string;
  hostid: string;
  enddate?: Date;
  pfp?: string;
  tasksperweek?: number;
  lastpfpupdate?: Date;
  archive: boolean;
  notification_time?: Date;
}

// Post related types
export interface Post {
  postid: string;
  photolink?: string;
  videolink?: string;
  caption?: string;
  valid?: boolean;
  username: string;
  groupid: string;
  startdate?: Date;
  timepost: Date;
  timecycle?: Date;
  veto: string[];
  likes?: string[];
}

// Comment related types
export interface Comment {
  commentid: string;
  created: Date;
  postid: string;
  username: string;
  message: string;
}

// Context Types
export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface GroupsContextType {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  groupData: any; // TODO: Define specific type
  setGroupData: React.Dispatch<React.SetStateAction<any>>;
}

// Navigation Types
export type RootStackParamList = {
  // Auth Stack
  SignIn: undefined;
  SignUp: undefined;
  ConfirmEmail: undefined;
  LoggedIn: undefined;
  
  // Profile Stack
  ProfileScreen: undefined;
  Wallet: undefined;
  Rules: undefined;
  Connection: undefined;

  // Groups Stack
  GroupsList: undefined;
  NewGroup: undefined;
  Group: { groupId: string };
  GroupEdit: { groupId: string };
  MembersList: { groupId: string };
  InviteMembers: { groupId: string };
  CreatePost: { groupId: string };
  EditPost: { postId: string };
  Info: { groupId: string };
  ArchiveGroup: { groupId: string };
  GroupSetting: { groupId: string };

  // Activity Stack
  Activity: undefined;
  Veto: { postId: string };
};

// Component Props Types
export interface UserProviderProps {
  children: ReactNode;
}

export interface GroupsProviderProps {
  children: ReactNode;
}

export interface LeaderboardItemProps {
  memberData: {
    username: string;
    place: number;
    netMoney: number;
    totalCountedPosts: number;
    totalUnCountedPosts: number;
  };
}

export interface ConnectExProps {
  text: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}