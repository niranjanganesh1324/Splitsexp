import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";

// AUTH

export const signup = async (
  name,
  email,
  password
) => {
  const cred =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await updateProfile(
    cred.user,
    {
      displayName: name,
    }
  );

  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      uid: cred.user.uid,
      name,
      email,
      createdAt: Date.now(),
    }
  );

  return {
    id: cred.user.uid,
    name,
    email,
  };
};

export const login = async (
  email,
  password
) => {
  const cred =
    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  return {
    id: cred.user.uid,
    name:
      cred.user.displayName ||
      "User",
    email: cred.user.email,
  };
};

export const logout = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (
  callback
) => {
  return onAuthStateChanged(
    auth,
    (user) => {
      if (!user) {
        callback(null);
        return;
      }

      callback({
        id: user.uid,
        name:
          user.displayName ||
          "User",
        email: user.email,
      });
    }
  );
};

// EXPENSES

export const getExpenses = async (
  userId
) => {
  const q = query(
    collection(db, "expenses"),
    where(
      "userIds",
      "array-contains",
      userId
    )
  );

  const snapshot =
    await getDocs(q);

  const expenses =
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

  return expenses.sort(
    (a, b) =>
      (b.timestamp?.seconds || 0) -
      (a.timestamp?.seconds || 0)
  );
};

export const addExpense = async (
  expenseData
) => {
  const userIds = [
    expenseData.paidBy,
    ...expenseData.participants.map(
      (p) => p.id
    ),
  ];

  const docRef =
    await addDoc(
      collection(db, "expenses"),
      {
        ...expenseData,
        userIds: [
          ...new Set(userIds),
        ],
        timestamp:
          serverTimestamp(),
      }
    );

  return {
    id: docRef.id,
    ...expenseData,
  };
};

export const getBalances =
  async (userId) => {
    const expenses =
      await getExpenses(userId);

    const balances = {};

    expenses.forEach((exp) => {
      if (
        exp.paidBy === userId
      ) {
        exp.participants.forEach(
          (p) => {
            if (
              p.id !== userId
            ) {
              balances[p.id] =
                (balances[
                  p.id
                ] || 0) +
                p.amount;
            }
          }
        );
      } else {
        const myShare =
          exp.participants.find(
            (p) =>
              p.id === userId
          )?.amount || 0;

        if (myShare > 0) {
          balances[
            exp.paidBy
          ] =
            (balances[
              exp.paidBy
            ] || 0) -
            myShare;
        }
      }
    });

    return balances;
  };