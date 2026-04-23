import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Note, NoteCategory } from "@/types";

const NOTES_COLLECTION = "notes";

function timestampToDate(ts: Timestamp | null): Date {
  return ts ? ts.toDate() : new Date();
}

export async function createNote(
  userId: string,
  text: string,
  category: NoteCategory,
  imageUrl?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    userId,
    text,
    category,
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateNote(
  noteId: string,
  data: Partial<Pick<Note, "text" | "category" | "imageUrl">>
): Promise<void> {
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  await deleteDoc(doc(db, NOTES_COLLECTION, noteId));
}

export async function getNotes(
  userId: string,
  category?: NoteCategory
): Promise<Note[]> {
  let q = query(
    collection(db, NOTES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  if (category) {
    q = query(
      collection(db, NOTES_COLLECTION),
      where("userId", "==", userId),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    userId: doc.data().userId,
    text: doc.data().text,
    category: doc.data().category,
    imageUrl: doc.data().imageUrl || undefined,
    createdAt: timestampToDate(doc.data().createdAt),
    updatedAt: timestampToDate(doc.data().updatedAt),
  }));
}

export function subscribeToNotes(
  userId: string,
  callback: (notes: Note[]) => void
): Unsubscribe {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notes: Note[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().userId,
      text: doc.data().text,
      category: doc.data().category,
      imageUrl: doc.data().imageUrl || undefined,
      createdAt: timestampToDate(doc.data().createdAt),
      updatedAt: timestampToDate(doc.data().updatedAt),
    }));
    callback(notes);
  });
}
