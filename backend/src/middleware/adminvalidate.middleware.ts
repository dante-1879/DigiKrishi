import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/base.utils';


interface TokenPayload {
    role: string;
    id: string;
}

export function validateAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decode = verifyJwt(token) as TokenPayload | null;
        if (!decode) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json({ isAdmin: true });
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.status(401).json({ isAdmin: false });
    }
}

