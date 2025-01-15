import { PrismaClient } from '@prisma/client';
import { uploadFile } from './uploadFile';
import { reauthorizeStrava } from './stravaTransactions';
import { User, DatabaseResponse } from '../types';

const prisma = new PrismaClient();

// Create a new user
export async function createUser(
  username: string, 
  email: string, 
  firstName: string,
  lastName: string, 
  pfp: string
): Promise<DatabaseResponse<User>> {
  try {
    const timestamp = new Date();
    const { fileUrl, error: uploadError } = await uploadFile(pfp, 'userProfiles', username, null, timestamp.toISOString());

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    let time = timestamp;

    if (pfp.length === 0) {
      time = timestamp;
    }

    const data = await prisma.users.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        pfp: fileUrl || "",
        lastpfpupdate: time,
        balance: 0,  // Set initial balance to 0
        tokens: [],  // Initialize empty tokens array
        timezone: null,
        lastlogin: null,
        stripeid: null,
        stravarefresh: null
      }
    }) as User;  // Cast to User type

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

// Read user details
export async function getUser(username: string): Promise<DatabaseResponse<User>> {
  try {
    const data = await prisma.users.findUnique({
      where: { username }
    }) as User | null;

    if (!data) {
      return { data: null, error: new Error('User not found') };
    }

    let res = data;

    if (data.stravarefresh) {
      const { data: reauthData, error: reauthError } = await reauthorizeStrava(data.stravarefresh, username);

      if (reauthError || !reauthData?.access_token) {
        res = await prisma.users.update({
          where: { username },
          data: { stravarefresh: null }
        }) as User;
      }
    }

    return { data: res, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function getUserByEmail(email: string): Promise<DatabaseResponse<User>> {
  try {
    const data = await prisma.users.findUnique({
      where: { email }
    }) as User | null;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

export async function getAllUsers(): Promise<DatabaseResponse<User[]>> {
  try {
    const data = await prisma.users.findMany() as User[];
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

// Update user details
export async function updateUser(
  username: string, 
  updateParams: Partial<User>
): Promise<DatabaseResponse<User>> {
  try {
    const newTimeStamp = new Date();
    let fileUrl = updateParams.pfp;

    if (updateParams.pfp) {
      const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(
        updateParams.pfp,
        'userProfiles',
        username,
        updateParams.lastpfpupdate?.toString() || null,
        newTimeStamp.toISOString()
      );

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      fileUrl = newFileUrl;
    }

    if (fileUrl === undefined) {
      fileUrl = "";
    }

    const data = await prisma.users.update({
      where: { username },
      data: { 
        ...updateParams, 
        pfp: fileUrl, 
        lastpfpupdate: newTimeStamp 
      }
    }) as User;

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

// Delete a user
export async function deleteUser(username: string): Promise<DatabaseResponse<User>> {
  try {
    const data = await prisma.users.delete({
      where: { username }
    }) as User;
    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}
