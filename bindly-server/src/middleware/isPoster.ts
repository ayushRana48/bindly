import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

export async function isPoster(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("isPoster middleware");
    const prisma = new PrismaClient();
    const username = req.user?.username; // Extract username from req.user
    const { postId } = req.params; // Extract postId from route params

    if (!username || !postId) {
        res.status(400).json({ error: 'Invalid request: username or postId missing' });
        return;
    }

    try {
        // Query the `posts` table to check if the user is the poster
        const post = await prisma.post.findUnique({
            where: { postid: postId },
            select: { username: true }, // Only select the username for efficiency
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if (post.username !== username) {
            res.status(403).json({ error: 'Forbidden: You are not the creator of this post' });
            return;
        }

        // User is the poster; proceed to the next middleware or controller
        next();
    } catch (error) {
        console.error('Error in isPoster middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
