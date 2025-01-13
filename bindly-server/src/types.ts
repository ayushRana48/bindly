export interface User {
    username: string;
    email: string;
    firstName: string;
    lastName: string | null;
    pfp: string | null;
    lastpfpupdate: Date | null;
    balance: number;
    stripeid: string | null;
    tokens: string[];
    lastlogin: Date | null;
    timezone: string | null;
    stravarefresh: string | null;
  }
  
  export interface Group {
    groupid: string;
    groupname: string;
    description: string | null;
    buyin: number | null;
    week: Date | null;
    startdate: Date | null;
    timeleft: string | null;
    hostid: string;
    enddate: Date | null;
    pfp: string | null;
    tasksperweek: number | null;
    lastpfpupdate: Date | null;
    archive: boolean;
    notification_time: Date | null;
  }
  
  export interface Post {
    postid: string;
    photolink: string | null;
    videolink: string | null;
    caption: string | null;
    valid: boolean | null;
    username: string;
    groupid: string;
    startdate: Date | null;
    timepost: Date;
    timecycle: Date | null;
    veto: string[];
    likes: string[] | null;
  }
  
  export interface Comment {
    commentid: string;
    created: Date;
    postid: string;
    username: string;
    message: string;
  }
  
  export interface UserGroup {
    usergroupid: string;
    username: string;
    groupid: string;
    strikes: number | null;
    moneypaid: number | null;
    moneyowed: number | null;
    post_notification_time: Date | null;
    tokens: string[] | null;
  }
  
  export interface Invite {
    inviteid: string;
    groupid: string;
    senderid: string;
    receiverid: string;
  }
  
  export interface Veto {
    vetoid: string;
    groupid: string | null;
    postid: string;
    reason: string;
    count: number | null;
    time: Date;
    timecycle: Date;
    username: string | null;
  }
  
  export interface NotifyVeto {
    notifyvetoid: string;
    postid: string | null;
    username: string | null;
    groupid: string | null;
  }
  
  export interface DatabaseResponse<T> {
    data: T | null;
    error: Error | null;
  }



export interface BalanceTransaction {
  id: string; // UUID
  time: string; // ISO timestamp (use Date if parsing the string)
  transactionType: string;
  username: string; // Foreign key to 'users' table
  amount: number; // Double precision
  status: string;
  error?: string | null; // Optional
}

export interface BalanceStripeTransaction {
  id: string; 
  cardid: string;
  state: string | null;
  timeinitiated: string | null; 
  timeconfirmed: string | null; 
}

export interface BalanceGroupTransaction {
  id: string; // UUID (Foreign key to 'balance_transaction')
  groupid: string; // UUID (Foreign key to 'groups')
  type: string | null;
}
