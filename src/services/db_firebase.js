import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
  updateDoc,
  arrayUnion,
  deleteDoc
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

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      uid: cred.user.uid,
      name: cred.user.displayName || "User",
      email: cred.user.email,
      createdAt: Date.now(),
    },
    { merge: true }
  );

  return {
    id: cred.user.uid,
    name: cred.user.displayName || "User",
    email: cred.user.email,
  };
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

// GROUPS

export const createGroup = async (groupName, creatorUser, memberNames = []) => {
  const members = [
    { id: creatorUser.id, name: creatorUser.name, email: creatorUser.email }
  ];

  memberNames.forEach(name => {
    if (name.trim()) {
      members.push({
        id: 'friend-' + Math.random().toString(36).substring(2, 9),
        name: name.trim()
      });
    }
  });

  const memberIds = [creatorUser.id];

  const docRef = await addDoc(collection(db, "groups"), {
    name: groupName,
    members,
    memberIds,
    createdBy: creatorUser.id,
    timestamp: serverTimestamp()
  });

  return {
    id: docRef.id,
    name: groupName,
    members,
    memberIds,
    createdBy: creatorUser.id
  };
};

export const getGroups = async (userId) => {
  const q = query(
    collection(db, "groups"),
    where("memberIds", "array-contains", userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const addMemberToGroup = async (groupId, memberName) => {
  const groupRef = doc(db, "groups", groupId);
  const newMember = {
    id: 'friend-' + Math.random().toString(36).substring(2, 9),
    name: memberName.trim()
  };

  await updateDoc(groupRef, {
    members: arrayUnion(newMember)
  });

  return newMember;
};

export const deleteGroup = async (groupId) => {
  await deleteDoc(doc(db, "groups", groupId));
};

export const deleteExpense = async (expenseId) => {
  await deleteDoc(doc(db, "expenses", expenseId));
};
