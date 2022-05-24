class Connector {
    constructor(baseUrl) {
        this._baseUrl = baseUrl || "";
        this._successHandler = null;
        this._onRequestStart = null;
        this._onRequestEnd = null;
        this._headers = null;
        this._fetch = fetch || (window && window.fetch);
        this.Connector = this;
        this.joinWithBase = this.joinWithBase.bind(this);
        this._onRequestStartDelay = 0;
        this._runningRequest = false;
    }

    set fetch(fn) {
        this._fetch = fn;
        this._onRequestStartDelay = 0;
        this._runningRequest = false;
    }

    set onRequestStartDelay(time) {
        this._onRequestStartDelay = time
    }

    set baseUrl(url) {
        this._baseUrl = url
    }

    get baseUrl() {
        return this._baseUrl
    }

    set headers(obj) {
        this._headers = obj;
    }

    get header() {
        return this._headers;
    }

    async _handle404(response, options) {
        if (this._handleBadReq) return await this._handleBadReq(response, options);
        return response;
    }

    set handle404(fn) {
        this._handle404 = fn;
    }

    async _handle403(response, options) {
        if (this._handleBadReq) return await this._handleBadReq(response, options);
        return response;
    }

    set handle403(fn) {
        this._handle403 = fn;
    }
    async _handle400(response, options) {
        if (this._handleBadReq) return await this._handleBadReq(response, options);
        return response
    }

    set handle400(fn) {
        this._handle400 = fn;
    }

    async _handleBadReq(response, options) {
        let errorResponse = await response.json();
        console.log(Object.values(errorResponse).join(", "))
    }

    set handleBadReq(fn) {
        this._handleBadReq = fn;
    }

    async _handle500() {
        console.log("Internal Server Error");
    }

    set handle500(fn) {
        this._handle500 = fn;
    }

    async _onNetworkError() {
        console.log("Network Error");

    }

    set onNetworkError(fn) {
        this._onNetworkError = fn;
    }

    async _handleNetworkError(options = {}) {
        if (options.onNetworkError) {
            return await options.onNetworkError();
        } else if (this._onNetworkError) {
            return await this._onNetworkError(options);
        }
    }

    async _errorHandler(response, options) {

        if (response.status === 404) {
            if (options.handle404) {
                return await options.handle404(response, options);
            } else if (options.handleBadReq) {
                return await options.handleBadReq(response, options);
            } else {
                return await this._handle404(response, options);
            }
        }
        if (response.status === 403) {
            if (options.handle403) {
                return await options.handle403(response, options);
            } else if (options.handleBadReq) {
                return await options.handleBadReq(response, options);
            } else {
                return await this._handle403(response, options);
            }
        }
        if (response.status === 400) {
            if (options.handle400) {
                return await options.handle400(response, options);
            } else if (options.handleBadReq) {
                return await options.handleBadReq(response, options);
            } else {
                return await this._handle400(response, options);
            }
        }
        else if (response.status >= 400 && response.status < 500) {
            if (options.handleBadReq) {
                return await options.handleBadReq(response, options);
            } else if (options.handleBadReq) {
                return await options.handleBadReq(response, options);
            } else {
                return await this._handleBadReq(response, options);
            }
        }

        else if (response.status >= 500) {
            if (options.handle500) {
                return await options.handle500(response, options);
            } else if (options.handleBadReq) {
                return await options.handleBadReq(response, options);
            } else {
                return await this._handle500(response, options);
            }
        }
    }
    set errorHandler(fn) {
        this._errorHandler = fn;
    }

    async _successHandler(response, options) {
        return await response.json()
    }
    set successHandler(fn) {
        this._successHandler = fn;
    }

    async handleRequestStart(options) {
        this._runningRequest = true;

        setTimeout(async () => {
            if (this._runningRequest) {
                if (options.onRequestStart) {
                    return await options.onRequestStart();
                } else if (this._onRequestStart) {
                    return await this._onRequestStart();
                }
            }
        }, this._onRequestStartDelay)
    }

    set onRequestStart(fn) {
        this._onRequestStart = fn;
    }

    async handleRequestEnd(options) {
        this._runningRequest = false;
        if (options.onRequestEnd) {
            return await options.onRequestEnd();
        } else if (this._onRequestEnd) {
            return await this._onRequestEnd();
        }
    }

    set onRequestEnd(fn) {
        this._onRequestEnd = fn;
    }

    async handleResponse(response, options) {
        await this.handleRequestEnd(options);
        if (response.ok) {
            if (options.successHandler) {
                return await options.successHandler(response, options)
            }
            else if (this._successHandler) {
                return await this._successHandler(response, options)
            }
        } else {

            if (options.errorHandler && typeof options.errorHandler == "function") {
                return await options.errorHandler(response, options)
            }
            else if (this._errorHandler) {
                return await this._errorHandler(response, options);
            }
        }
    }

    async get(url, options = {}) {
        await this.handleRequestStart(options);
        try {
            const response = await fetch(this.joinWithBase(url), {
                headers: {
                    ...this._headers,
                    ...{
                        "content-type": "application/json"
                    },
                    ...options.headers,
                }
            });
            return this.handleResponse(response, options);
        } catch (err) {
            this._handleNetworkError(options)
        }
    }

    async post(url, payload, options = {}) {
        await this.handleRequestStart(options);
        const response = await fetch(this.joinWithBase(url), {
            method: "POST",
            body: (options.encoder && options.encoder(payload)) || JSON.stringify(payload),
            mode: 'cors',
            headers: {
                ...this._headers,
                ...{
                    "content-type": "application/json"
                },
                ...options.headers,
            }
        });
        return this.handleResponse(response, options)
    }
    async put(url, payload, options = {}) {
        await this.handleRequestStart(options);
        const reqOptions = {
            method: "PUT",
            body: (options.encoder && options.encoder(payload)) || JSON.stringify(payload),
            mode: 'cors',
            headers: {
                ...this._headers,
                ...{
                    "content-type": "application/json"
                },
                ...options.headers,
            }
        }

        if (options.removeContentType) delete reqOptions.headers["content-type"]

        const response = await fetch(this.joinWithBase(url), reqOptions);
        return this.handleResponse(response, options)
    }
    async delete(url, options = {}) {
        await this.handleRequestStart(options);
        const response = await fetch(this.joinWithBase(url), {
            method: "DELETE",
            headers: {
                ...this._headers,
                ...{
                    "content-type": "application/json"
                },
                ...options.headers,
            }
        });
        return this.handleResponse(response, options)
    }

    joinWithBase(url) {
        return Connector.joinUrl(this._baseUrl, url);
    }

    static joinUrl(baseUrl, relativeUrl) {
        return concatAndResolveUrl(baseUrl, relativeUrl); //TODO fix / 
    }

}

/**
 * remove trailing slash from url
 * @param {string | Array<string>} url 
 * @returns {string | Array<string>} if array supplied as param will return array otherwise string
 */
function removeTrailingSlash(url) {
    let urlParts = Array.isArray(url) ? url : url.split("/");

    if (urlParts[urlParts.length - 1] !== "") return Array.isArray(url) ? urlParts : urlParts.join("/");

    urlParts.pop();

    let recResult = removeTrailingSlash(urlParts)
    return Array.isArray(url) ? recResult : recResult.join("/");
}

/**
 * remove leading slash from url
 * @param {string | Array<string>} url 
 * @returns {string | Array<string>} if array supplied as param will return array otherwise string
 */
function removeLeadingSlash(url) {
    let urlParts = Array.isArray(url) ? url : url.split("/");

    if (urlParts[0] !== "") return Array.isArray(url) ? urlParts : urlParts.join("/");

    urlParts.shift();

    let recResult = removeTrailingSlash(urlParts)
    return Array.isArray(url) ? recResult : recResult.join("/");
}

function concatAndResolveUrl(base, relative) {
    let baseParts = removeTrailingSlash(base.split("/"));
    let relativeParts = removeLeadingSlash(relative.split("/"));

    let url = [...baseParts, ...relativeParts];

    url.forEach((item, index) => {

        if (item === "..") { // abcd/efgh/../ijkl
            url.splice(index - 1, 1);
            url.splice(index - 1, 1)
        } else if (item === ".") { // abcd/efgh/./ijkl
            url.splice(index, 1)
        }
    })
    return url.join('/');
}

module.exports = new Connector();
