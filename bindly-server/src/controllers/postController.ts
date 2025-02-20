import { Request, Response } from 'express';
import { 
  createPost,
  postStatus, 
  getInvalidPosts,
  addVeto,
  removeVeto, 
  getAllPosts, 
  getPost, 
  getPostsByGroupId, 
  getPresignedUrl, 
  getPostsByUsername, 
  updatePost, 
  deletePost, 
  addLike,
  removeLike 
} from '../transactions/postTransactions';
import path from 'path';
import { supabase } from '../initSupabase';



// Example function to compress a video

async function getPresignedUrlController(req: Request, res: Response) {
  const { fileName, date, isImage } = req.body;
  
  try {
    const { data, error } = await getPresignedUrl(fileName, date, isImage);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(400).json({ error: 'Failed to generate URLs' });
    }

    const { presignedUrl, permanentUrl } = data;
    return res.status(200).json({ presignedUrl, permanentUrl });
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function postStatusController(req: Request, res: Response) {
  const { username, groupId } = req.body;

  try {
    const { data, startdate, error } = await postStatus(username, groupId);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ data, startdate });
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function createPostController(req: Request, res: Response) {
  const { username, groupId, photolink, videolink, caption, time, startdate, timecycle } = req.body;

  try {
    const { data, error } = await createPost({
      username,
      groupid: groupId, // map groupId to groupid
      photolink,
      videolink,
      caption,
      timepost: time, // map time to timepost
      timecycle
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// async function compressVideoController(req: Request, res: Response) {
//   const { videolink } = req.body;

//   try {
//     const { data, error } = await compressVideo(videolink);
    
//     if (error) {
//       return res.status(400).json({ error: error.message });
//     }
//     return res.status(200).json('successfully compressed');
//   } catch (error) {
//     return res.status(400).json({ 
//       error: error instanceof Error ? error.message : 'Unknown error' 
//     });
//   }
// }



async function getPostController(req: Request, res: Response) {
  const { postId } = req.params;

  try {
    const { data, error } = await getPost(postId);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getInvalidPostsController(req: Request, res: Response) {
  const { username } = req.params;

  try {
    const { data, error } = await getInvalidPosts(username);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function getPostsByGroupIdController(req: Request, res: Response) {
  const { groupId } = req.params;

  try {
    const { data, error } = await getPostsByGroupId(groupId);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function getPostsByUsernameController(req: Request, res: Response) {
  const { username } = req.params;

  try {
    const { data, error } = await getPostsByUsername(username);

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function getAllPostsController(req: Request, res: Response) {
  try {
    const { data, error } = await getAllPosts();

    if (error) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Controller for updating a user's details
async function updatePostController(req: Request, res: Response) {
  const { postId } = req.params;
  const updateParams = req.body;

  try {
    const { data, error } = await updatePost(postId, updateParams);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function addVetoController(req: Request, res: Response) {
  const { postid, username, groupid } = req.body;

  try {
    const { data, error } = await addVeto(postid, username, groupid);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function removeVetoController(req: Request, res: Response) {
  const { postid, username, groupid } = req.body;

  try {
    const { data, error } = await removeVeto(postid, username, groupid);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


async function addLikeController(req: Request, res: Response) {
  const { postid, username, groupid } = req.body;

  try {
    const { data, error } = await addLike(postid, username, groupid);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

async function removeLikeController(req: Request, res: Response) {
  const { postid, username, groupid } = req.body;

  try {
    const { data, error } = await removeLike(postid, username, groupid);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


// Controller for deleting a user
async function deletePostController(req: Request, res: Response) {
  const { postId } = req.params;
  const { groupid } = req.body;

  try {
    const { data, error } = await deletePost(postId, groupid);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


export { 
  createPostController,
  deletePostController,
  getAllPostsController,
  updatePostController,
  getPostController,
  getPostsByGroupIdController,
  getPostsByUsernameController,
  getPresignedUrlController,
  // compressVideoController,
  postStatusController,
  addVetoController,
  removeVetoController,
  addLikeController,
  removeLikeController,
  getInvalidPostsController
};
