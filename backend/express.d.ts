declare namespace Express {
    export interface Request {
        user?: {
            id: Int
        },
        isAdmin?: Boolean
    }
}