import { redis } from '../initRedis';

const getGroupCacheKey = (groupid: string) => `group:${groupid}`;

async function deleteGroupCache(groupid: string) {
  try {
    const cacheKey = getGroupCacheKey(groupid);
    await redis.del(cacheKey);
    console.log(`Cache deleted for groupid: ${groupid}`);
  } catch (error) {
    console.error(`Error deleting cache for groupid: ${groupid}`, error);
  }
}


const getGroupMemberCacheKey = (groupid: string) => `groupMember:${groupid}`;

async function deleteGroupMemberCache(groupid: string) {
  try {
    const cacheKey = getGroupMemberCacheKey(groupid);
    await redis.del(cacheKey);
    console.log(`Cache deleted for groupid: ${groupid}`);
  } catch (error) {
    console.error(`Error deleting cache for groupid: ${groupid}`, error);
  }
}

export { deleteGroupCache, getGroupCacheKey,getGroupMemberCacheKey,deleteGroupMemberCache };