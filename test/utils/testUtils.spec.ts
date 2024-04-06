import { awaitFunctionToBeTruthy } from './testUtils';

describe('awaitFunctionToBeTruthy', () => {
  it('should resolve if the function returns a truthy value', async () => {
    const mockFn = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const promise = awaitFunctionToBeTruthy(mockFn, 10, 1);
    await expect(promise).resolves.toBeUndefined();
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should reject if the function never returns a truthy value', async () => {
    const mockFn = jest.fn().mockResolvedValue(false);

    const promise = awaitFunctionToBeTruthy(mockFn, 3, 1);
    await expect(promise).rejects.toThrow('Function did not return truthy value');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should reject with the last caught error if the function throws', async () => {
    const mockError = new Error('Test error');
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Another error'))
      .mockRejectedValueOnce(mockError);

    const promise = awaitFunctionToBeTruthy(mockFn, 3, 1);
    await expect(promise).rejects.toThrow(mockError);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
