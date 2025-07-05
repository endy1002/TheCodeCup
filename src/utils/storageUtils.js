// Utility function to safely execute storage operations
export const safeStorageOperation = async (operation, operationName = 'storage operation') => {
  try {
    const result = await operation();
    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
};

// Batch storage operations with partial success handling
export const safeBatchStorageOperation = async (operations) => {
  const results = [];
  let successCount = 0;
  
  for (const { name, operation } of operations) {
    const result = await safeStorageOperation(operation, `save ${name}`);
    results.push({ name, ...result });
    if (result.success) successCount++;
  }
  
  return {
    totalOperations: operations.length,
    successCount,
    failureCount: operations.length - successCount,
    results,
    partialSuccess: successCount > 0,
    allSuccess: successCount === operations.length
  };
};
