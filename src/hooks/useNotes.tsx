"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToNotes, createNote, deleteNote as firestoreDeleteNote } from "@/lib/firestore";
import type { Note, NoteCategory } from "@/types";

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotes(userId, (updatedNotes) => {
      setNotes(updatedNotes);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [userId]);

  const addNote = useCallback(
    async (text: string, category: NoteCategory, imageUrl?: string) => {
      if (!userId) return;
      try {
        await createNote(userId, text, category, imageUrl);
      } catch (err) {
        setError("ไม่สามารถบันทึกโน้ตได้");
        throw err;
      }
    },
    [userId]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      try {
        await firestoreDeleteNote(noteId);
      } catch (err) {
        setError("ไม่สามารถลบโน้ตได้");
        throw err;
      }
    },
    []
  );

  const filterByCategory = useCallback(
    (category: NoteCategory | "all") => {
      if (category === "all") return notes;
      return notes.filter((n) => n.category === category);
    },
    [notes]
  );

  return { notes, loading, error, addNote, deleteNote, filterByCategory };
}
