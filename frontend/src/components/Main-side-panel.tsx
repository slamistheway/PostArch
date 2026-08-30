'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AddPostResponse {
  status?: string;
  message?: string;
  comment_id?: string;
  post_id?: string;
}


export default function MainSidePanel() {
  // panel visibility
  const [isVisiblePostPanel, setIsVisiblePostPanel] = useState(false);
  const [isVisibleInfoPanel, setIsVisibleInfoPanel] = useState(false);
  const [isVisibleSuccessPanel, setIsVisibleSuccessPanel] = useState(false);

  // ids (replacing BehaviorSubjects)
  const [commentId, setCommentId] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);

  // messages (replacing BehaviorSubjects)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // form state
  let [postOrCommentLink, setPostOrCommentLink] = useState('');
  const [typeOfSave, setTypeOfSave] = useState('');

  const openOrCloseAddSavePanel = () => {
    setIsVisiblePostPanel((prev) => !prev);
  };

  const onOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      openOrCloseAddSavePanel();
    }
  };

  const saveHTMLToFile = async () => {
    try {
      const res = await fetch(`http://localhost:3001/scrapper/saveHTMLToFile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arg_URL: postOrCommentLink }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message ?? 'Saving HTML to file failed.');
      }

      const data: string = await res.json();

      setErrorMessage('');
      setInfoMessage('');
      setPostOrCommentLink('');
      setIsVisibleInfoPanel(true);
      setInfoMessage(`HTML saved to file successfully: ${data}`);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Saving HTML to file failed.');
    }
  };







  const addSave = async () => {
    if (!postOrCommentLink) {
      setErrorMessage('Please enter a postView URL.');
      return;
    }

    if (postOrCommentLink.includes('youtube.com')) {
      try {
        const res = await fetch(`http://localhost:3001/scrapper/addSaveYTDLP`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({arg_URL: postOrCommentLink}),
        });


        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.log(errBody);
          throw new Error(errBody?.message ?? 'Prijava nije uspjela.');
        }

        const data: AddPostResponse = await res.json();
        console.log(data);
        setErrorMessage('');
      }
      catch (err: any) {
        console.log(err?.message);
        setErrorMessage(err?.message ?? 'Adding video failed.');
      }
    }else if (postOrCommentLink.includes('reddit.com')) {
      try {
        const res = await fetch(`http://localhost:3001/scrapper/addSaveREDDIT`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({arg_URL: postOrCommentLink}),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody?.message ?? 'Dohvaćanje objave nije uspjelo.');
        }

        const data: AddPostResponse = await res.json();

        setErrorMessage('');
        setInfoMessage('');
        setPostOrCommentLink('');
        console.log(data.status, data.message);

        if (data.status === 'alert') {
          setCommentId(data.comment_id ?? '');
          setPostId(data.post_id ?? '');
          setIsVisibleInfoPanel(true);
          setInfoMessage(data.message ?? 'Alert message not available.');
        } else if (data.status === 'success') {
          setCommentId(data.comment_id ?? '');
          setIsVisibleSuccessPanel(true);
          setSuccessMessage(data.message ?? 'Post added successfully.');
        }
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Dohvaćanje objave nije uspjelo.');
      }
    }
  };





  return (
    <>
      <aside className="bg-gradient-to-b from-[#6e7572] via-[#bfc5c3] to-[#f1f3f2] rounded-4xl p-4 shadow-lg">
        <img src="/icons/profile.png" alt="default-pfp" className="w-2/3 mx-auto mb-1" />
        <p className="text-center">DESKTOP-BO7ERR7</p>

        <div className="flex flex-col items-center gap-1 text-white">
          <Link
            href="/saves"
            className="flex items-stretch w-full h-10 py-1 rounded-2xl shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)] button_gradient_green"
          >
            <img src="/icons/saves.png" alt="lists-icon" className="flex mx-2" />
            <p className="flex items-center text-[1.25rem]"> Saves </p>
          </Link>

          <a
            onClick={openOrCloseAddSavePanel}
            className="flex items-stretch w-full h-10 py-1 rounded-2xl shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)] button_gradient_green cursor-pointer"
          >
            <img src="/icons/add.png" alt="info-icon" className="flex mx-2" />
            <p className="flex items-center text-[1.25rem]"> Add </p>
          </a>

          <Link
            href="/settings"
            className="flex items-stretch w-full h-10 py-1 rounded-2xl shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)] button_gradient_green"
          >
            <img src="/icons/settings.png" alt="settings-icon" className="flex mx-2" />
            <p className="flex items-center text-[1.25rem]"> Settings </p>
          </Link>

          <Link
            href="/info"
            className="flex items-stretch w-full h-10 py-1 rounded-2xl shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)] button_gradient_green"
          >
            <img src="/icons/info.png" alt="info-icon" className="flex mx-2" />
            <p className="flex items-center text-[1.25rem]"> Info </p>
          </Link>
        </div>
      </aside>

      {isVisiblePostPanel && (
        <div
          onClick={onOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-semibold">Add post or comment</h2>

            <form id="addPostForm" name="addPostForm" onSubmit={(e) => e.preventDefault()}>
              <p className="text-gray-600">Enter Reddit, Youtube, TikTok or Instagram URL</p>

              <input
                id="postUrl"
                type="text"
                value={postOrCommentLink}
                onChange={(e) => setPostOrCommentLink(e.target.value)}
                name="postUrl"
                className="w-full rounded-lg border border-gray-300 p-2.5 outline-none"
              />

              <div className="mt-5 flex justify-start gap-2">
                <button
                  type="button"
                  onClick={() => setIsVisiblePostPanel(false)}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => addSave()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Save
                </button>
              </div>
            </form>

            {errorMessage && <p className="mt-2 text-red-500">{errorMessage}</p>}
          </div>

          {/* OVERLAY - STATUS panel */}
          {isVisibleInfoPanel && infoMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Alert</h2>
                <p>{infoMessage}</p>
                <div className="mt-5 flex justify-end gap-2">
                  {commentId && (
                    <Link
                      href={`/commentView/${commentId}`}
                      onClick={() => setIsVisibleInfoPanel(false)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                    >
                      Go to comment
                    </Link>
                  )}
                  {postId && (
                    <Link
                      href={`/postView/${postId}`}
                      onClick={() => setIsVisibleInfoPanel(false)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                    >
                      Go to post
                    </Link>
                  )}
                  <button
                    onClick={() => setIsVisibleInfoPanel(false)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {isVisibleSuccessPanel && successMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Success</h2>
                <p>{successMessage}</p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setIsVisibleSuccessPanel(false)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
