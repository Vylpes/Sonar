import { GenerateResponse } from "../../src/contracts/IBasicResponse";

describe('GenerateResponse', () => {
    test('Given both parameters are defined, expect response with these generated', () => {
        const result = GenerateResponse(false, 'message');

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Message).toBe('message');
    });

    test('Given message is not supplied, expect only isSuccess to be generated', () => {
        const result = GenerateResponse(false);

        expect(result.IsSuccess).toBeFalsy();
        expect(result.Message).toBeUndefined();
    });

    test('Given isSuccess is not supplied, expect to be defined as true', () => {
        const result = GenerateResponse();

        expect(result.IsSuccess).toBeTruthy();
        expect(result.Message).toBeUndefined();
    });
});