import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

export async function isGroupMember(req: Request, res: Response, next: NextFunction) {
    console.log("isGroupMember middleware");
    const prisma = new PrismaClient();
    const username = req.user?.username; // Extract username from req.user
    const groupId = req.body.groupId || req.body.groupid || req.params.groupId;

    if (!username || !groupId) {
        res.status(400).json({ error: 'Invalid request: username or groupId missing' });
        return;
    }

    try {
        // Query the `usergroup` table using Prisma
        const membership = await prisma.usergroup.findFirst({
            where: {
                username,
                groupid: groupId,
            },
        });

        if (!membership) {
            res.status(403).json({ error: 'Forbidden: User is not a member of this group' });
            return;
        }

        // If user is a member, proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error in isGroupMember middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
