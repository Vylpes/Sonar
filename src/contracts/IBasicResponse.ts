export interface IBasicResponse {
    IsSuccess: boolean,
    Message?: string,
};

export function GenerateResponse(isSuccess: boolean = true, message?: string): IBasicResponse {
    return {
        IsSuccess: isSuccess,
        Message: message
    }
}