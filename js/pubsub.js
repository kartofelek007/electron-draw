export default {
    events : {},

    subscribe(event, id, callback) {
        let self = this;

        if (!self.events.hasOwnProperty(event)) {
            self.events[event] = new Map();
        }

        return this.events[event].set(id, callback);
    },

    unsubscribe(event, id) {
        let self = this;

        if (!self.events.hasOwnProperty(event)) {
            return false;
        }

        return this.events[event].delete(id);
    },

    publish(event, data = {}) {
        let self = this;

        if (!self.events.hasOwnProperty(event)) {
            return [];
        }

        for (const [key, value] of this.events[event].entries()) {
            value(data);
        }
    }
}