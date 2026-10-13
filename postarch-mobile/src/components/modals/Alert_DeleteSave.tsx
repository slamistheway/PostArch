import DeleteSaveDialog, { type DeleteSaveProps } from './delete-save-dialog';

export default function Alert_DeleteSave({ setAlert_deleteSave, ...props }:
  DeleteSaveProps & { setAlert_deleteSave: (visible: boolean) => void }) {
  return <DeleteSaveDialog {...props} onClose={() => setAlert_deleteSave(false)} />;
}
