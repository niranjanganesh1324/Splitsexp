import * as firebaseDb from './db_firebase';
import * as customDb from './db_custom';

// Read the database type from Vite's environment variables (default to 'firebase' if not specified)
const useCustom = import.meta.env.VITE_DATABASE_TYPE === 'custom';
const activeDb = useCustom ? customDb : firebaseDb;

// Export all Auth services
export const signup = activeDb.signup;
export const login = activeDb.login;
export const logout = activeDb.logout;
export const subscribeToAuthChanges = activeDb.subscribeToAuthChanges;
export const loginWithGoogle = activeDb.loginWithGoogle;

// Export all Expenses services
export const getExpenses = activeDb.getExpenses;
export const addExpense = activeDb.addExpense;
export const getBalances = activeDb.getBalances;
export const deleteExpense = activeDb.deleteExpense;

// Export all Groups services
export const createGroup = activeDb.createGroup;
export const getGroups = activeDb.getGroups;
export const addMemberToGroup = activeDb.addMemberToGroup;
export const deleteGroup = activeDb.deleteGroup;
