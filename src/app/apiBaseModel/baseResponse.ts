export interface IBaseResponse<T> {
    detail?: T;
    message?: string;
    count?: number;
    next?: any;
    previous?: any;
    results?: any[];
}
