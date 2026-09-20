import { getQueue } from "./connect";

function initializeQueue() {
  return getQueue();
}

class DB {
    private static instance: DB;
    private queue: any;

    private constructor() {
        this.queue = initializeQueue();
    }

    public static getInstance(): DB {
        if (!DB.instance) {
            DB.instance = new DB();
        }

        return DB.instance;
    }

    public getQueue() {
        return this.queue;
    }
}


export default DB.getInstance().getQueue;