export class AIError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = "AIError";
    }
}