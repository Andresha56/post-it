import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostDetailsModal } from '../components/post/PostDetailsModal';
import { DeletePostModal } from '../components/post/DeletePostModal';

// View / Edit / Delete for a post, shared by the content list and the calendar.
export function usePostActions() {
  const navigate = useNavigate();
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const edit = (id: string) => navigate(`/content/${id}/edit`);

  const dialogs = (
    <>
      <PostDetailsModal
        postId={viewId}
        onClose={() => setViewId(null)}
        onEdit={(id) => {
          setViewId(null);
          edit(id);
        }}
        onDelete={(id) => {
          setViewId(null);
          setDeleteId(id);
        }}
      />
      <DeletePostModal postId={deleteId} onClose={() => setDeleteId(null)} />
    </>
  );

  return { view: setViewId, edit, remove: setDeleteId, dialogs };
}
