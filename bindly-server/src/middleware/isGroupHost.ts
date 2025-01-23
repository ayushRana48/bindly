import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

export async function isGroupHost(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("isGroupHost middleware");
    const prisma = new PrismaClient();
    const username = req.user?.username; // Extract username from req.user
    const groupId = req.body.groupId || req.body.groupid || req.params.groupId;

    if (!username || !groupId) {
        res.status(400).json({ error: 'Invalid request: username or groupId missing' });
        return;
    }

    try {
        // Query the `groups` table to check if the user is the host
        const group = await prisma.groups.findUnique({
            where: { groupid: groupId },
            select: { hostid: true }, // Only select the hostid for efficiency
        });

        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }

        if (group.hostid !== username) {
            res.status(403).json({ error: 'Forbidden: You are not the host of this group' });
            return;
        }

        // User is the host; proceed to the next middleware or controller
        next();
    } catch (error) {
        console.error('Error in isGroupHost middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
