import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Youtube } from "@tiptap/extension-youtube";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import imageCompression from "browser-image-compression";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Code,
  Quote,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Tulis di sini...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable link from StarterKit to avoid duplicate
        link: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 dark:border-gray-600",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 dark:border-gray-600 p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class:
            "border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-800 font-bold",
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4 min-h-[" +
          minHeight +
          "]",
      },
    },
  });

  // Sync content when prop changes (for AI generated content)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 5MB");
        return;
      }

      try {
        setUploading(true);

        // Compress image before upload
        const options = {
          maxSizeMB: 0.5, // Max 500KB
          maxWidthOrHeight: 1920, // Max dimension
          useWebWorker: true,
          fileType: file.type,
        };

        toast.info("Mengkompress gambar...");
        const compressedFile = await imageCompression(file, options);

        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
        console.log(
          `Image compressed: ${originalSize}MB → ${compressedSize}MB`
        );

        // Upload to Supabase Storage
        const fileExt = compressedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `questions/${fileName}`;

        toast.info("Mengupload gambar...");
        const { data, error } = await supabase.storage
          .from("tryout-assets")
          .upload(filePath, compressedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.error("Storage upload error:", error);
          throw new Error(`Upload gagal: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("tryout-assets")
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error("Gagal mendapatkan URL gambar");
        }

        // Insert image to editor
        editor?.chain().focus().setImage({ src: urlData.publicUrl }).run();

        toast.success(
          `Gambar berhasil diupload (${originalSize}MB → ${compressedSize}MB)`
        );
      } catch (error: any) {
        console.error("Error uploading image:", error);
        toast.error("Gagal upload gambar: " + error.message);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleYoutubeEmbed = () => {
    const url = prompt("Masukkan URL YouTube:");
    if (url) {
      editor?.commands.setYoutubeVideo({
        src: url,
      });
    }
  };

  const handleLinkAdd = () => {
    const url = prompt("Masukkan URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleTableInsert = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={
            editor.isActive({ textAlign: "left" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Code & Quote */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={
            editor.isActive("codeBlock") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={
            editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Media */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
          disabled={uploading}
          title="Upload Image (max 5MB)"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTableInsert}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleYoutubeEmbed}
          title="Embed YouTube Video"
        >
          <YoutubeIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLinkAdd}
          className={
            editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""
          }
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
