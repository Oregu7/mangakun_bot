const EventEmitter = require("events").EventEmitter;

const _queue = Symbol("queue");
const _done = Symbol("done");
const _callback = Symbol("callback");
const _dequeue = Symbol("dequeue");
const _broadcastNumbers = Symbol("broadcastNumbers");

class Mutex extends EventEmitter {
    constructor(callback, time = 3000) {
        super();
        this.time = time;
        this[_queue] = [];
        this[_done] = true;
        this[_callback] = callback;
        this.on("dequeue", this[_dequeue].bind(this));
    }

    done() {
        setTimeout(() => {
            this[_done] = true;
            this[_broadcastNumbers]();
            this.emit("dequeue");
        }, this.time);
    }

    enqueue(ctx, ...args) {
        // добавляем данные в очередь
        this[_queue].push([ctx, ...args]);
        // оповещаем
        this.emit("start", ctx);
        this[_broadcastNumbers]();
        // вызываем dequeue, если все очередь свободна
        if (this[_done]) this.emit("dequeue");
    }

    [_broadcastNumbers]() {
        this[_queue].forEach(([ctx], indx) => {
            this.emit("number", ctx, indx + 1);
        });
    }

    async [_dequeue]() {
        if (this[_queue].length && this[_done]) {
            this[_done] = false;
            let [ctx, ...args] = this[_queue].shift();
            this[_callback](ctx, this.done.bind(this), ...args);
        }
    }
}

module.exports = Mutex;