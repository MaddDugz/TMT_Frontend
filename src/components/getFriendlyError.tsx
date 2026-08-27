import { UserRejectedRequestError, ContractFunctionExecutionError, TransactionExecutionError } from 'viem' //error when user rejects transactions

export function getFriendlyErrorMessage(error: any): string { //handle error
  if (!error) return "";

  const message = error.message || "";

  if (message.includes("You can only claim once every 24 hours")) {
    return "You've already claimed today — come back later!";
  }
  
  if (error instanceof ContractFunctionExecutionError) {    // errors from metamask
     if(error.walk((e) => e instanceof UserRejectedRequestError)) return "User rejected request"; // when user cancels import or mint request
     if(error.walk((e) => e instanceof TransactionExecutionError)) return "Insufficeint Balance";
     return "Metamask error"; 
  } 

  return "Something went wrong. Please try again.";
}