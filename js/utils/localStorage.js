export default {
    set(name, value) {
        localStorage.setItem(name, value);
    },

    get(name) {
        return localStorage.getItem(name);
    },

    remove(name) {
        localStorage.removeItem(name);
    },

    toggle(name) {
        if (this.get(name) === null) {
            this.set(name, true);
        } else {
            this.remove(name);
        }
    }
}