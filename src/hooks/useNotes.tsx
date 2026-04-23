"use client";

import { useEffect, useState, useCallback } from "react";
import { subscribeToNotes, createNote, deleteNote as firestoreDeleteNote, updateNote as firestoreUpdateNote } from "@/lib/firestore";
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

  const updateNote = useCallback(
    async (noteId: string, data: Partial<Pick<Note, "text" | "category" | "imageUrl" | "pinned">>) => {
      try {
        await firestoreUpdateNote(noteId, data);
      } catch (err) {
        setError("ไม่สามารถอัปเดตโน้ตได้");
        throw err;
      }
    },
    []
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

  const togglePin = useCallback(
    async (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      try {
        await firestoreUpdateNote(noteId, { pinned: !note.pinned });
      } catch (err) {
        setError("ไม่สามารถปักหมุดโน้ตได้");
        throw err;
      }
    },
    [notes]
  );

  const filterByCategory = useCallback(
    (category: NoteCategory | "all") => {
      if (category === "all") return notes;
      return notes.filter((n) => n.category === category);
    },
    [notes]
  );

  // Sort: pinned first, then by updatedAt desc
  const sortedNotes = useCallback(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes]);

  return { notes: sortedNotes(), loading, error, addNote, updateNote, deleteNote, togglePin, filterByCategory };
}
