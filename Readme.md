# connector  

Fetch request simplified. Configure once use anywhere.

Designed for applications with complex `fetch` requests to make error handling easier on application level.

## Usage

Set up configuration options on application startup file.

`app.js`

```js
    import connector from "@imtiazChowdhury/connector"

    connector.baseUrl = "https://api.example.com" // api host
    
    connector.handleBadReq = async function(response, options){
        console.log(await response.text())
    }
```

`some_other_file.js`

```js
    import connector from "@imtiazChowdhury/connector"


    async function loadData(){
        const response = await connector.get("/api/data"); //returns json response (await response.json()) by default
    }
```

## configurable properties

set default behavior of `connector`  using the following properties. configurations remains the same across the whole application.  And can be overridden by passing `options` parameter while calling request functions.


* `fetch = function()` defaults to `window.fetch`
* `baseUrl = {string}` base url string. Added to urls as host for making requests.
* `headers={string}` request headers. Added to requests.  
* `onRequestStart = function(options)` runs before sending request, can be used to show loaders and indicators
* `onRequestStartDelay = {number}` time (in ms) to wait before running `onRequestStart`. Can be used to skip loaders for fast loading requests.
* `onRequestEnd = function(options)` function to run when request ends. Can be used to remove loaders/indicators added using `onRequestStart`
* `handle404 = function(response, options)` function to call if response status is 404. Falls back to `handleBadReq` if not specified.
* `handle403 = function(response, options)` function to call if response status is 403. Falls back to `handleBadReq` if not specified.
* `handle402 = function(response, options)` function to call if response status is 402. Falls back to `handleBadReq` if not specified.
* `handle401 = function(response, options)` function to call if response status is 401. Falls back to `handleBadReq` if not specified.
* `handle400 = function(response, options)` function to call if response status is 400. Falls back to `handleBadReq` if not specified.
* `handle500 = function(response, options)` function to call if response status is greater than 500. Falls back to `handleBadReq` if not specified.
* `handleBadReq = function(response, options)` function to call if response status is 4\*\* or 5\*\*. Not called if specified handler is set for that given status.
* `_onNetworkError = function(options)` function to call if network error occurs.
* `successHandler = function(response, options)` called and returned on successful request. If set, whatever this function returns will be returned from the main request function. defaults to `await response.json()`

## API

`connector.get(url, options)`
`connector.post(url, payload options)`
`connector.put(url, payload options)`
`connector.delete(url, options)`

* `url`: URL string
* `payload`: request payload
* `options`: configuration options for this particular request only. **Overrides configurations specified by setting properties**. used if a request needs different handling than the default options set.
  
  * `headers={string}` request headers. Added to requests.  
  * `onRequestStart = function(options)` runs before sending request, can be used to show loaders and indicators
  * `onRequestStartDelay = {number}` time (in ms) to wait before running `onRequestStart`. Can be used to skip loaders for fast loading requests.
  * `onRequestEnd = function(options)` function to run when request ends. Can be used to remove loaders/indicators added using `onRequestStart`
  * `handle404 = function(response, options)` function to call if response status is 404. Falls back to `handleBadReq` if not specified.
  * `handle403 = function(response, options)` function to call if response status is 403. Falls back to `handleBadReq` if not specified.
  * `handle402 = function(response, options)` function to call if response status is 402. Falls back to `handleBadReq` if not specified.
  * `handle401 = function(response, options)` function to call if response status is 401. Falls back to `handleBadReq` if not specified.
  * `handle400 = function(response, options)` function to call if response status is 400. Falls back to `handleBadReq` if not specified.
  * `handle500 = function(response, options)` function to call if response status is greater than 500. Falls back to `handleBadReq` if not specified.
  * `handleBadReq = function(response, options)` function to call if response status is 4\*\* or 5\*\*. Not called if specified handler is set for that given status.
  * `_onNetworkError = function(options)` function to call if network error occurs.
  * `successHandler = function(response, options)` called and returned on successful request. If set, whatever this function returns will be returned from the main request function. defaults to `await response.json()`
