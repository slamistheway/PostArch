import DeleteSaveDialog, { type DeleteSaveProps } from './delete-save-dialog';

export default function Alert_DeleteSaveForeignKey(props: DeleteSaveProps) {
  return <DeleteSaveDialog {...props} withComments onClose={() => props.setAlert_deleteForeignKeys(false)} />;
}
