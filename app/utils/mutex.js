const _ = require("lodash");
const EventEmitter = require("events").EventEmitter;
const { getChatId } = require("./messageManager");

const _queue = Symbol("queue");
const _done = Symbol("done");
const _callback = Symbol("callback");
const _dequeue = Symbol("dequeue");
const _broadcastNumbers = Symbol("broadcastNumbers");
const _checkExist = Symbol("checkExist");

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
            //this[_broadcastNumbers]();
            this.emit("dequeue");
        }, this.time);
    }

    enqueue(ctx, ...args) {
        // проверяем существование запроса от этого пользователя в очереди
        if (this[_checkExist](ctx) !== -1) return this.emit("already_in_queue", ctx);
        // добавляем данные в очередь
        this[_queue].push({ ctx, args });
        // оповещаем
        this.emit("number", ctx, this[_queue].length);
        // вызываем dequeue, если все очередь свободна
        if (this[_done]) this.emit("dequeue");
    }

    [_broadcastNumbers]() {
        this[_queue].forEach(({ ctx }, indx) => {
            this.emit("number", ctx, indx + 1);
        });
    }

    [_checkExist](ctx) {
        const userId = getChatId(ctx);
        return _.findIndex(this[_queue], function(o) { return getChatId(o.ctx) == userId; });
    }

    async [_dequeue]() {
        if (this[_queue].length && this[_done]) {
            this[_done] = false;
            let { ctx, args } = this[_queue].shift();
            try {
                await this[_callback](ctx, this.done.bind(this), ...args);
            } catch (err) {
                const userId = getChatId(ctx);
                ctx.telegram.sendMessage(userId, "Что-то пошло не так, попробуйте позднее");
                this.done();
                console.error(err);
            }

        }
    }
}

module.exports = Mutex;