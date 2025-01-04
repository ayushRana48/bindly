import { supabase } from '../initSupabase';
import { Expo } from 'expo-server-sdk';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseResponse, Invite, Group } from '../types';

const expo = new Expo();

interface ExpoNotification {
  to: string;
  sound: string;
  title: string;
  body: string;
}

async function createInvite(
  senderid: string, 
  receiverid: string, 
  groupid: string
): Promise<DatabaseResponse<Invite>> {
  const inviteid = uuidv4();

  const { data, error } = await supabase
    .from('invite')
    .insert([{ inviteid, senderid, receiverid, groupid }])
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  const { data: receiverData, error: receiverError } = await supabase
    .from('users')
    .select('username, tokens')
    .eq('username', receiverid)
    .single();

  if (receiverError) {
    return { data, error: new Error(receiverError.message) };
  }

  const tokens = receiverData.tokens.filter((token: unknown) => Expo.isExpoPushToken(token));

  if (tokens.length === 0) {
    return { data, error: null };
  }

  const notifications: ExpoNotification[] = tokens.map((token: any) => ({
    to: token,
    sound: 'default',
    title: 'Bindly',
    body: `You received an invite from ${senderid}`,
  }));

  await sendBatchNotifications(notifications);
  return { data, error: null };
}

async function sendBatchNotifications(notifications: ExpoNotification[]): Promise<void> {
  const chunks = expo.chunkPushNotifications(notifications.map(notification => ({
    ...notification,
    sound: 'default' as const
  })));
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  }
}

async function getAllInvites(): Promise<DatabaseResponse<Invite[]>> {
  const { data, error } = await supabase
    .from('invite')
    .select('*');

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getInvite(inviteId: string): Promise<DatabaseResponse<Invite>> {
  const { data, error } = await supabase
    .from('invite')
    .select('*')
    .eq('inviteid', inviteId)
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getInvitesBySender(username: string): Promise<DatabaseResponse<Invite[]>> {
  const { data, error } = await supabase
    .from('invite')
    .select('*')
    .eq('senderid', username);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getInvitesByReciever(username: string): Promise<DatabaseResponse<Array<Invite & { groups: Group }>>> {
  const { data, error } = await supabase
    .from('invite')
    .select(`
      *,
      groups:groups!inner(*)
    `)
    .eq('receiverid', username);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function getInvitesByGroupId(groupid: string): Promise<DatabaseResponse<Invite[]>> {
  const { data, error } = await supabase
    .from('invite')
    .select('*')
    .eq('groupid', groupid);

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

type InviteUpdateParams = Partial<Omit<Invite, 'inviteid'>>;

async function updateInvite(
  inviteid: string, 
  updateParams: InviteUpdateParams
): Promise<DatabaseResponse<Invite>> {
  const { data, error } = await supabase
    .from('invite')
    .update(updateParams)
    .eq('inviteid', inviteid)
    .select()
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

async function deleteInvite(inviteid: string): Promise<DatabaseResponse<Invite>> {
  const { data, error } = await supabase
    .from('invite')
    .delete()
    .eq('inviteid', inviteid)
    .select()
    .single();

  return { 
    data, 
    error: error ? new Error(error.message) : null 
  };
}

export { 
  createInvite, 
  getAllInvites, 
  getInvite, 
  getInvitesByGroupId, 
  getInvitesBySender, 
  getInvitesByReciever, 
  updateInvite, 
  deleteInvite 
};