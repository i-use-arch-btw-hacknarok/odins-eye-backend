export const awaitFunctionToBeTruthy = async (
  fn: () => unknown,
  attempts = 10,
  delay = 100,
): Promise<void> => {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const result = await fn();
      if (result) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Function did not return truthy value');
};
