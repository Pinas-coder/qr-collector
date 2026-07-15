import type { Request, Response, NextFunction } from "express";

// UUID v4 generato da crypto.randomUUID() lato client
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

declare global {
namespace Express {
    interface Request {
    utenteId: string;
    }
}
}

export function utenteAnonimo(req: Request, res: Response, next: NextFunction) {
const header = req.header("X-User-Id");

if (!header || !UUID_REGEX.test(header)) {
    return res.status(400).json({ errore: "Header X-User-Id mancante o non valido" });
}

req.utenteId = header;
next();
}