import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { AllInterface } from '@/types/types';
import { apiRequest } from '../../../lib/api';
import { Action, Dialog, ui } from '../postarch-ui';
import CopyableError from '../copyable-error';
import { notifySaveChanged } from '@/shared/save-changes';

export interface DeleteSaveProps {
  saveToDelete: AllInterface | null;
  onDeleted: (id: string, withComments: boolean) => void;
  setErrorMessage: (message: string) => void;
  setAlert_deleteForeignKeys: (visible: boolean) => void;
}

export default function DeleteSaveDialog({ saveToDelete, onDeleted, setErrorMessage,
  setAlert_deleteForeignKeys, onClose, withComments = false }:
  DeleteSaveProps & { onClose: () => void; withComments?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const confirm = async () => {
    if (!saveToDelete || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await apiRequest<{ message: string }>('deleteSave', 'DELETE', {
        arg_SaveID: saveToDelete.id,
        arg_saveType: withComments || saveToDelete.title != null ? 'post' : 'comment',
        arg_withCommentsAlso: withComments ? 'true' : undefined,
      });
      if (response.message.includes('The post already has saved comments tied to it')) {
        onClose();
        setAlert_deleteForeignKeys(true);
      } else if (response.message.includes('FAILED')) {
        throw new Error(response.message);
      } else {
        onDeleted(saveToDelete.id, withComments);
        notifySaveChanged();
        onClose();
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Failed to delete save.';
      setError(message);
      setErrorMessage(message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <Dialog title={withComments ? 'The post already has saved comments tied to it.' : 'Delete Save'}
      onClose={() => { if (!busy) onClose(); }}>
      <Text style={ui.text}>{withComments ? 'Would you like to unsave those comments also?' : 'Are you sure you want to delete this save?'}</Text>
      {error ? <CopyableError message={error} /> : null}
      <View style={ui.row}>
        <Action label="Cancel" tone="neutral" disabled={busy} onPress={onClose} />
        <Action label={busy ? 'Deleting…' : 'Delete'} danger disabled={busy || !saveToDelete} onPress={() => void confirm()} />
      </View>
    </Dialog>
  );
}
