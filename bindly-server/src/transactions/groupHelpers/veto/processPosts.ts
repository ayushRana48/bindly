
  import e from 'express';
import { supabase } from '../../../initSupabase';
  import { v4 as uuidv4 } from 'uuid';
import exp from 'constants';



// Adjust according to your actual DB schema
interface PostRecord {
    postid: string;
    username: string;
    timecycle: string;  // or Date, depending on your Supabase column type
    veto: string[];     // array of usernames who vetoed the post
    valid: boolean | null;
  }

async function processPosts(
    postData: PostRecord[],
    memberCount: number,
    groupid: string
  ): Promise<void> {
    // 48-hour cutoff
    const currentTime = new Date();
    const cutoffTime = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000);
  
    // Filter posts older than 48 hours
    const latePosts = postData.filter(
      (post) => new Date(post.timecycle) < cutoffTime
    );
  
    if (latePosts.length === 0) {
      return; // Nothing to do
    }
  
    // Partition into "to invalidate" vs. "to validate"
    const threshold = Math.ceil(memberCount / 2);
    const postIdsToInvalidate = latePosts
      .filter((post) => post.veto.length >= threshold)
      .map((post) => post.postid);
  
    const postIdsToValidate = latePosts
      .filter((post) => post.veto.length < threshold)
      .map((post) => post.postid);
  
    // Validate posts
    if (postIdsToValidate.length > 0) {
      const { error: updateError } = await supabase
        .from("post")
        .update({ valid: true })
        .in("postid", postIdsToValidate);
  
      if (updateError) throw updateError;
    }
  
    // Invalidate posts
    if (postIdsToInvalidate.length > 0) {
      const { error: invalidateError } = await supabase
        .from("post")
        .update({ valid: false })
        .in("postid", postIdsToInvalidate);
  
      if (invalidateError) throw invalidateError;
  
      // Build notifications for invalidated posts
      const notifications = latePosts
        .filter((post) => postIdsToInvalidate.includes(post.postid))
        .map((post) => ({
          notifyvetoid: uuidv4(),
          postid: post.postid,
          username: post.username,
          groupid: groupid,
        }));
  
      if (notifications.length > 0) {
        const { error: notifyError } = await supabase
          .from("notifyveto")
          .insert(notifications);
  
        if (notifyError) throw notifyError;
      }
    }
  }
  
export {processPosts}