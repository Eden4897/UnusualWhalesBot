"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.JSONScheduler = exports.JSONMap = exports.JSONArray = exports.JSONDatabase = void 0;
const fs_1 = require("fs");
const https_1 = require("https");
const index_1 = require("../index");
class JSONDatabase {
    constructor(path) {
        this.path = path;
    }
    read() {
        return JSON.parse((0, fs_1.readFileSync)(this.path).toString());
    }
    write(data) {
        (0, fs_1.writeFileSync)(this.path, JSON.stringify(data, null, 4));
        return this.read();
    }
}
exports.JSONDatabase = JSONDatabase;
class JSONArray extends JSONDatabase {
    constructor(path, readOnly = false) {
        super(path);
        if (readOnly) {
            this.write = () => {
                throw new Error(`This JSONArray of ${this.path} is readonly.`);
            };
            if (!(0, fs_1.existsSync)(path)) {
                throw new Error(`This JSONArray of ${this.path} is readonly yet is not found`);
            }
        }
        if (!(0, fs_1.existsSync)(path)) {
            (0, fs_1.writeFileSync)(path, "[]");
        }
        return this;
    }
    at(index) {
        return this.read()[index];
    }
    writeAt(index, item) {
        const _ = this.read();
        _[index] = item;
        this.write(_);
        return _;
    }
    concat(other) {
        return this.write(this.read().concat(other));
    }
    entries() {
        return this.read().entries();
    }
    every(condition) {
        return this.read().every(condition);
    }
    filter(condition) {
        return this.read().filter(condition);
    }
    find(condition) {
        return this.read().find(condition);
    }
    findIndex(condition) {
        return this.read().findIndex(condition);
    }
    flat() {
        return this.read().flat();
    }
    forEach(callbackfn) {
        return this.read().forEach(callbackfn);
    }
    includes(element) {
        return this.read().includes(element);
    }
    indexOf(element) {
        return this.read().indexOf(element);
    }
    join(seperator) {
        return this.read().join(seperator);
    }
    keys() {
        return this.read().keys;
    }
    lastIndexOf(element) {
        return this.read().lastIndexOf(element);
    }
    map(callback) {
        return this.read().map(callback);
    }
    pop(write = true) {
        const _ = this.read();
        _.pop();
        if (write) {
            this.write(_);
        }
        return _;
    }
    push(element, write = true) {
        const _ = this.read();
        _.push(element);
        if (write) {
            this.write(_);
        }
        return _;
    }
    remove(condition, write = true) {
        const _ = this.read();
        if (_.findIndex(condition) != -1)
            _.splice(_.findIndex(condition), 1);
        if (write) {
            this.write(_);
        }
        return _;
    }
    removeAll(condition, write = true) {
        const _ = this.read();
        while (_.findIndex(condition) != -1) {
            _.splice(_.findIndex(condition), 1);
        }
        if (write) {
            this.write(_);
        }
        return _;
    }
    reduce(callback, initialValue = null) {
        return this.read().reduce(callback, initialValue);
    }
    reduceRight(callback, initialValue = null) {
        return this.read().reduceRight(callback, initialValue);
    }
    reverse(write = true) {
        const _ = this.read().reverse();
        if (write) {
            this.write(_);
        }
        return _;
    }
    shift(write = true) {
        const _ = this.read();
        _.shift();
        if (write) {
            this.write(_);
        }
        return _;
    }
    slice(start = undefined, end = undefined, write = true) {
        const _ = this.read().slice(start, end);
        if (write) {
            this.write(_);
        }
        return _;
    }
    some(condition) {
        return this.read().some(condition);
    }
    sort(compareFn, write = true) {
        const _ = this.read().sort(compareFn);
        if (write) {
            this.write(_);
        }
        return _;
    }
    splice(start, deleteCount = 0, ...items) {
        return this.read().splice(start, deleteCount, ...items);
    }
    toString() {
        return this.read().toString();
    }
    unshift(items, write = true) {
        const _ = this.read();
        _.unshift(...items);
        if (write) {
            this.write(_);
        }
        return _;
    }
    values() {
        return this.read().values();
    }
}
exports.JSONArray = JSONArray;
class JSONMap extends JSONDatabase {
    constructor(path, readOnly = false) {
        super(path);
        if (readOnly) {
            this.write = () => {
                throw new Error(`This JSONMap of ${this.path} is readonly.`);
            };
            if (!(0, fs_1.existsSync)(path)) {
                throw new Error(`This JSONMap of ${this.path} is readonly yet is not found`);
            }
        }
        if (!(0, fs_1.existsSync)(path)) {
            (0, fs_1.writeFileSync)(path, "{}");
        }
        return this;
    }
    set(key, value) {
        const _ = this.read();
        _[key] = value;
        return this.write(_);
    }
    unset(key) {
        const _ = this.read();
        delete _[key];
        return this.write(_);
    }
    get(key) {
        return this.read()[key];
    }
    getKey(value) {
        return Object.keys(this.read()).find((key) => this.read()[key] === value);
    }
    increment(key, amount) {
        if (!(key in this.read())) {
            this.set(key, 0);
        }
        if (isNaN(this.read()[key])) {
            throw new Error("Not a number");
        }
        this.set(key, this.get(key) + amount);
    }
    keys() {
        return Object.keys(this.read());
    }
    values() {
        return Object.values(this.read());
    }
    entries() {
        return Object.entries(this.read());
    }
}
exports.JSONMap = JSONMap;
class JSONScheduler extends JSONArray {
    constructor(eventHandler, path = "schedule.json") {
        super(path);
        this.eventHandler = eventHandler;
        index_1.bot.on("ready", async () => {
            await new Promise((_) => setTimeout(_, 1000));
            this.checkEvents();
            setInterval(() => this.checkEvents(), 60 * 1000);
        });
    }
    checkEvents() {
        this.filter((event) => Date.now() >= new Date(event.date).getTime()).forEach((event) => {
            this.eventHandler(index_1.bot, ...event.args);
        });
        this.removeAll((event) => Date.now() >= new Date(event.date).getTime());
    }
    schedule(date, ...args) {
        this.push({
            date: date.toString(),
            args,
        });
    }
}
exports.JSONScheduler = JSONScheduler;
async function download(url, dest = url.split("/").pop()) {
    //destination defaulted to the file name in the url
    return new Promise((res, rej) => {
        let file = (0, fs_1.createWriteStream)(dest);
        (0, https_1.get)(url, function (response) {
            response.pipe(file);
            file.on("finish", function () {
                res(file.path);
            });
        }).on("error", function (err) {
            (0, fs_1.unlink)(dest, () => rej(err));
        });
    });
}
exports.download = download;
//# sourceMappingURL=file.js.map