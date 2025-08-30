import ky from "ky";

export const apiClient = ky.extend({
    referrerPolicy: 'same-origin',
    credentials: 'same-origin',
    priority: 'high',
    throwHttpErrors: false,
    cache: 'force-cache',
});
