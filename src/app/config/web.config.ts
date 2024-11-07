const host = window.location.host;
const proto = window.location.protocol;
const wss = proto === 'http:' ? 'ws' : 'wss';
let baseUrl = '';
let socketUrl = '';

if (host && (host.match('localhost') )) {
    baseUrl = 'http:' + '//dev.localhost:8000/';
    socketUrl = wss + '://dev.localhost:8000/notifications/';
} else {
    baseUrl = proto + '//' + host + '/';
    socketUrl = wss + '://' + host + '/notifications/';
}

export const API_BASE_URL = baseUrl;
export const API_SOCKET_URL = socketUrl;
