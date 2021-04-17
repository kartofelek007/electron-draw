export default {
    subscribers : {},

    on(event, fn) {
        if (this.subscribers[event] === undefined) {
            this.subscribers[event] = [];
        }

        this.subscribers[event].push(fn);
    },

    off(event, fn) {
        if (this.subscribers[event] === undefined) return;

        this.subscribers[event] = this.subscribers[event].filter(el => el !== fn);
    },

    emit(event, data = {}) {
        if (this.subscribers[event] === undefined) return;
        this.subscribers[event].forEach(fn => fn(data));
    }
}