import type { Dispatch, SetStateAction } from 'react';
import { API_URL, apiRequest } from '../../lib/api';
import type { AllInterface, CommentInterface, PostInterface } from '@/types/types';

export const errorText = (error: unknown) => error instanceof Error ? error.message : 'Request failed.';

export async function initializePinnedIds(signal?: AbortSignal): Promise<string[]> {
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/scrapper/pinnedIDs`, { signal });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error((data as { message?: string })?.message ?? 'Failed to load pinned saves.');
  if (!Array.isArray(data)) throw new Error('Unexpected pinned IDs response.');
  return data.filter((id): id is string => typeof id === 'string');
}

export function truncate(text: string, length = 100) {
  return text?.length > length ? `${text.slice(0, length)}...` : text ?? '';
}

export async function pinSave(arg_SaveID: string, isPostOrComment: string) {
  const data = await apiRequest<{ message: string }>('pinSave', 'POST', { arg_SaveID, isPostOrComment });
  if (data.message.includes('Maximum')) throw new Error(data.message);
  return data.message;
}

export async function addSaveToList(arg_ListID: string, arg_SaveID: string, arg_postType: string) {
  return apiRequest('addSaveToList', 'POST', { arg_ListID, arg_SaveID, arg_postType });
}

export async function removeSaveFromList(arg_ListID: string, arg_SaveID: string, arg_postType: string) {
  return apiRequest('removeSaveFromList', 'DELETE', { arg_ListID, arg_SaveID, arg_postType });
}

export async function deleteSave(
  arg_SaveID: string,
  arg_saveType: 'post' | 'comment',
  setPosts: Dispatch<SetStateAction<PostInterface[]>>,
  setComments: Dispatch<SetStateAction<CommentInterface[]>>,
  setAlls: Dispatch<SetStateAction<AllInterface[]>>,
  setErrorMessage: (message: string) => void,
  setAlert_deleteForeignKeys: (visible: boolean) => void,
  arg_withCommentsAlso?: string,
) {
  try {
    const data = await apiRequest<{ message: string }>('deleteSave', 'DELETE', {
      arg_SaveID, arg_saveType, arg_withCommentsAlso,
    });
    if (data.message.includes('The post already has saved comments tied to it')) {
      setAlert_deleteForeignKeys(true);
      return false;
    }
    setAlls((items) => items.filter((item) => item.id !== arg_SaveID &&
      !(arg_withCommentsAlso === 'true' && item.post_id === arg_SaveID)));
    if (arg_saveType === 'post') setPosts((items) => items.filter((item) => item.id !== arg_SaveID));
    if (arg_saveType === 'comment' || arg_withCommentsAlso === 'true') {
      setComments((items) => items.filter((item) =>
        arg_saveType === 'comment' ? item.id !== arg_SaveID : item.post_id !== arg_SaveID));
    }
    return true;
  } catch (error) {
    setErrorMessage(errorText(error));
    return false;
  }
}
