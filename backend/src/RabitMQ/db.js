import { getQueue } from "./connect.js";
function initializeQueue() {
    return getQueue();
}
class DB {
    constructor() {
        this.queue = initializeQueue();
    }
    static getInstance() {
        if (!DB.instance) {
            DB.instance = new DB();
        }
        return DB.instance;
    }
    getQueue() {
        return this.queue;
    }
}
export default DB.getInstance().getQueue;
