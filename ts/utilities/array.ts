// Will need to add polyfill to old browsers
interface Array<T> {
    find(predicate: (value: T, index: number, obj: Array<T>) => boolean, thisArg?: any): T | undefined;
}
