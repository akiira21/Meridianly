"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { api, Note } from "@/lib/api";
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  Eye,
  Pencil,
} from "lucide-react";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import NotionEditor from "@/components/ui/notion-editor";
import MarkdownPreview from "@/components/ui/markdown-preview";
import NoteColorPicker, { getNoteColorClasses } from "@/components/ui/note-color-picker";

export default function NotesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rehydrated = useAuthStore((state) => state.rehydrated);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState("gray");
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, rehydrated, router]);

  async function loadNotes() {
    try {
      setLoading(true);
      const { data } = await api.getNotes(searchQuery.trim() || undefined);
      setNotes(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAuthenticated) loadNotes();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  function openCreate() {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setIsPinned(false);
    setColor("gray");
    setIsPreview(false);
    setShowModal(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || "");
    setIsPinned(note.is_pinned);
    setColor(note.color);
    setIsPreview(false);
    setShowModal(true);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (editingNote) {
        await api.updateNote(editingNote.id, {
          title: title.trim(),
          content: content.trim() || null,
          is_pinned: isPinned,
          color,
        });
      } else {
        await api.createNote({
          title: title.trim(),
          content: content.trim() || null,
          is_pinned: isPinned,
          color,
        });
      }
      setShowModal(false);
      loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteNote(id);
      loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  }

  async function handleTogglePin(id: number) {
    try {
      await api.togglePinNote(id);
      loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle pin");
    }
  }

  if (!rehydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-gentle-pulse text-sm text-muted-foreground font-body">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader title="Notes" icon={<FileText size={18} />} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1">
        {error && (
          <div className="text-sm text-destructive font-body text-center py-2">
            {error}
          </div>
        )}

        {/* Search + Create */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-muted rounded-full">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 bg-transparent font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-foreground text-background rounded-full font-body text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            New
          </button>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="text-sm text-muted-foreground font-body text-center py-12">
            <span className="animate-gentle-pulse">Loading notes...</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-body mb-1">
              {searchQuery ? "No notes found." : "No notes yet."}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {searchQuery
                ? "Try a different search."
                : "Tap New to capture your first thought."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {notes.map((note) => {
              const colorClasses = getNoteColorClasses(note.color);
              return (
                <div
                  key={note.id}
                  onClick={() => openEdit(note)}
                  className={`group p-5 border rounded-2xl hover:border-foreground/20 transition-colors cursor-pointer flex flex-col ${colorClasses.bg} ${colorClasses.border}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-heading text-base font-medium tracking-tight line-clamp-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePin(note.id);
                        }}
                        className={`p-1.5 rounded-full hover:bg-black/5 transition-colors ${
                          note.is_pinned ? "text-foreground" : "text-muted-foreground"
                        }`}
                        title={note.is_pinned ? "Unpin" : "Pin"}
                      >
                        <Pin size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                  {note.content && (
                    <div className="line-clamp-4 flex-1">
                      <MarkdownPreview content={note.content} />
                    </div>
                  )}
                  <p className="mt-auto pt-3 text-[10px] text-muted-foreground font-body">
                    {new Date(note.updated_at + "Z").toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-base font-medium tracking-tight">
                {editingNote ? "Edit note" : "New note"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  title={isPreview ? "Edit" : "Preview"}
                >
                  {isPreview ? <Pencil size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-transparent font-body text-lg text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
                autoFocus
              />

              {isPreview ? (
                <div className="min-h-[120px] border border-border rounded-xl p-4 bg-muted/30">
                  <MarkdownPreview content={content} />
                </div>
              ) : (
                <NotionEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Type / for commands..."
                />
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <NoteColorPicker value={color} onChange={setColor} />
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-medium transition-colors ${
                      isPinned
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Pin size={12} />
                    {isPinned ? "Pinned" : "Pin"}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-foreground text-background rounded-full font-body text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {saving ? (
                    <span className="animate-gentle-pulse">Saving...</span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
