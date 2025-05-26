import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Generic CRUD operations
export const firestoreService = {
  // Get all documents from a collection
  getAll: async (collectionName, orderField = 'createdAt', orderDirection = 'desc') => {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy(orderField, orderDirection)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Get documents with pagination
  getPaginated: async (collectionName, pageSize = 25, lastDoc = null, filters = {}) => {
    try {
      let q = query(collection(db, collectionName));

      // Apply filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value && value !== '') {
          q = query(q, where(field, '==', value));
        }
      });

      // Add ordering
      q = query(q, orderBy('createdAt', 'desc'));

      // Add pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(pageSize));

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        docs,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === pageSize
      };
    } catch (error) {
      throw error;
    }
  },

  // Get a single document
  getById: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      throw error;
    }
  },

  // Create a new document
  create: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Update a document
  update: async (collectionName, id, data) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete a document
  delete: async (collectionName, id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    }
  },

  // Batch operations
  batchUpdate: async (operations) => {
    try {
      const batch = writeBatch(db);
      
      operations.forEach(({ type, collectionName, id, data }) => {
        const docRef = doc(db, collectionName, id);
        
        switch (type) {
          case 'update':
            batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            break;
        }
      });
      
      await batch.commit();
    } catch (error) {
      throw error;
    }
  },

  // Listen to real-time updates
  onSnapshot: (collectionName, callback, filters = {}) => {
    let q = query(collection(db, collectionName));

    // Apply filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value && value !== '') {
        q = query(q, where(field, '==', value));
      }
    });

    q = query(q, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(docs);
    });
  }
};

export default firestoreService;
