/**
 * @class HttpError
 */
export class HttpError extends Error {
    public statusCode = 400;
    /**
     * @constructor
     * @param {string} message HttpError message,
     */
    constructor(message: string) {
        super(message);
    }

    /**
     * Set http status code.
     * @param {number} code HttpError status code.
     * @return {HttpError}
     */
    setCode(code: number): HttpError {
        this.statusCode = code;
        return this;
    }
}
