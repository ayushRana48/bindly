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
    buyin: number;
    week: Date | null;
    startdate: Date;
    timeleft: Date | null; // Match Prisma
    hostid: string;
    enddate: Date;
    pfp: string | null;
    tasksperweek: number; // Clarify BigInt
    lastpfpupdate: Date | null;
    archive: boolean;
    notification_time: Date | null;
  }
  
  export interface Post {
    postid: string;
    photolink: string | null;
    videolink: string | null;
    caption: string | null;
    valid: boolean | null; // Correct type
    username: string;
    groupid: string;
    timepost: Date;
    timecycle: Date | null;
    veto: string[];
    likes: string[];
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
    post_notification_time: Date | null;
    tokens: string[];
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
    postid: string ;
    username: string;
    groupid: string ;
  }
  
  export interface DatabaseResponse<T> {
    data: T | null;
    error: Error | null;
  }


export interface BalanceTransaction {
  id: string;
  time: Date;
  transactionType: string;
  username: string;
  amount: number;
  state: string; // Add missing field
  error?: string | null;
}


export interface BalanceStripeTransaction {
  id: string; 
  cardid: string;
  state: string;
  timeinitiated: Date; 
  timeconfirmed: Date | null; 
}

export interface BalanceGroupTransaction {
  id: string; // UUID (Foreign key to 'balance_transaction')
  groupid: string; // UUID (Foreign key to 'groups')
  type: string;
}
