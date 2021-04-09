export default {
    events : {},

    on(event, id, callback) {
        let self = this;

        if (!self.events.hasOwnProperty(event)) {
            self.events[event] = new Map();
        }

        return this.events[event].set(id, callback);
    },

    off(event, id) {
        let self = this;

        if (!self.events.hasOwnProperty(event)) {
            return false;
        }

        return this.events[event].delete(id);
    },

    emit(event, data = {}) {
        let self = this;

        if (!self.events.hasOwnProperty(event)) {
            return [];
        }

        for (const [key, value] of this.events[event].entries()) {
            value(data);
        }
    }
}