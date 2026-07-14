//All functions are written so they would be compatible with both Manifest V2 and V3.
import StorageCache from "./cache";
import helpers from "./helpers";
import { decompress } from "../background/domainsListCompression";
import { isValidTimestampRange } from "../background/timestampRange";

const STORAGE_PREFIX = 'bring_';

const cache = new StorageCache();

const set = async (key: string, value: any, useCache: boolean = true) => {
    if (useCache) {
        cache.set(key, value);
    }

    return new Promise<void>((resolve, reject) => {
        if (helpers[key]?.set) {
            value = helpers[key].set(value);
        }
        chrome.storage.local.set({ [`${STORAGE_PREFIX}${key}`]: value }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

// ***** IMPORTANT BEGIN ***** //

/*
 We had a weird case reported by Bring when they received string "light"
 instead of an address in API calls.
 We have no understanding so far what is the root cause of this,
 but it seems like some users might have had that string
 stored in their local storage instead of a valid address.

 Best quick solution for now is to sanity check a value at least
 looks like an address when being stored or retrieved.

 And if no, it's just ignored as if no address been stored at all.
 */

function isLooksLikeCardanoAddressOrNull(s: any): boolean {
    return s == null ? true : /^addr(_test)?1\w+/.test(String(s));
}

const getAddress = async (useCache: boolean = true) => {
    const value = get('walletAddress', useCache);
    return isLooksLikeCardanoAddressOrNull(value) ? value : undefined;
}

const setAddress = async (addr: WalletAddress, useCache: boolean = true) => {
    const value = isLooksLikeCardanoAddressOrNull(addr) ? addr : undefined;
    return value == null
      ? remove('walletAddress')
      : set('walletAddress', value, useCache);
}

// ***** IMPORTANT END ***** //

const get = async (key: string, useCache: boolean = true) => {
    if (useCache) {
        const cachedValue = cache.get(key);
        if (cachedValue !== null) {
            return cachedValue;
        }
    }

    return new Promise<any>((resolve, reject) => {
        chrome.storage.local.get([`${STORAGE_PREFIX}${key}`], (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                let value = data[`${STORAGE_PREFIX}${key}`];

                if (value && helpers[key]?.get) {
                    value = helpers[key].get(value);
                }
                // If the value is undefined, we don't want to cache it
                if (useCache && value !== undefined) {
                    cache.set(key, value);
                }

                resolve(value);
            }
        });
    });
}

const remove = async (key: string) => {
    cache.delete(key);

    return new Promise<void>((resolve, reject) => {
        chrome.storage.local.remove([`${STORAGE_PREFIX}${key}`], () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

const clearCache = () => {
    cache.clear();
}

const invalidateCache = (key: string) => {
    cache.delete(key);
}

const getCacheStats = () => {
    return cache.getStats();
}

const initializeDebugCache = () => {
    if (typeof globalThis === 'undefined') return

    try {
        (globalThis as any).bringCache = {
            clear: () => cache.clear(),
            stats: () => cache.getStats(),
            get: async (key: string) => await get(key),
            getReadable: async (key: string) => {
                let value = await get(key)
                if (value instanceof Uint8Array) {
                    value = decompress(value)
                } else if (isValidTimestampRange(value)) {
                    value = `[${new Date(value[0]).toLocaleString('en-GB')} - ${new Date(value[1]).toLocaleString('en-GB')}] Total of ${(value[1] - value[0]) / 1000 / 60} minutes`
                }
                return value;
            },
            set: async (key: string, value: any) => await set(key, value),
            invalidate: (key: string) => cache.delete(key),
            delete: async (key: string) => await remove(key)
        };
    } catch (error) {
        console.warn('Failed to initialize debug cache:', error);
    }
}

export default {
    set,
    get,
    getAddress,
    setAddress,
    remove,
    clearCache,
    invalidateCache,
    getCacheStats,
    initializeDebugCache,
}
