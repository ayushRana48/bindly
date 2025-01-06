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
  post?: Post[];
  usergroup?: UserGroup[];
  invite?: any[];
  timecycle?: Date;
}


export interface UserGroup {
  groupid: string;
  username: string;
  usergroupid: string;
  moneyowed?: number;
  moneypaid?: number;
  strikes?: number;
  tokens?: string[];
  post_notification_time?: Date;
  users?: {
    pfp?: string;
  };
}


// Post related types
export interface Post {
  postid: string;
  caption?: string;
  comment: Comment[];
  groupid: string;
  likes: string[];
  photolink?: string;
  startdate?: Date | null;
  timecycle: string;
  timepost: string;
  username: string;
  valid?: boolean | null;
  veto: string[];
  videolink?: string;
}

// Comment related types
export interface Comment {
  id: string;
  created: Date;
  postid: string;
  username: string;
  message: string;
  users: {
    pfp?: string;
  };
}



//component types
export interface LeaderboardMember {
  username: string;
  place: number;
  netMoney: number;
  totalCountedPosts: number;
  totalUnCountedPosts: number;
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
  Group: { groupData: any };
  GroupEdit: undefined;
  MembersList: undefined;
  InviteMembers: undefined;
  CreatePost: undefined;
  EditPost: undefined;
  Info: undefined;
  ArchiveGroup: { groupData: any };;
  GroupSetting: undefined;

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