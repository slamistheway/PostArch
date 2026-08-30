'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import '../../../app/globals.css';
import {useRouter} from "next/router";
import { ListInterface, AllInterface } from '@/types/types';
import { CommentInterface } from '@/types/types';




function formatDate(date: string | Date) {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

export default function Comment() {
    const router = useRouter();
    const commentID = router.query.id as string;

    const [comment, setComment] = useState<CommentInterface | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!commentID) return;

        const fetchComment = async () => {
            try {
                const res = await fetch(`http://localhost:3001/scrapper/commentView/${commentID}`);
                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody?.message ?? 'Dohvaćanje objave nije uspjelo.');
                }

                const data: CommentInterface = await res.json();
                setComment(data ?? null);
                setErrorMessage('');
            } catch (err: any) {
                setErrorMessage(err?.message ?? 'Dohvaćanje objave nije uspjelo.');
            }
        };

        fetchComment();
    }, [commentID]);

    return (
        <div className="bg-[url('/bamboo.png')] bg-cover bg-center min-h-screen">
            <Navbar />

            <div className="bg-amber-100 mx-[10vw] p-5">
                <div className="border-4">
                    {errorMessage ? (
                        <>{errorMessage}</>
                    ) : (
                        comment && (
                            <div className="border-2 p-2 mb-4 col-span-1">
                                <div className="flex justify-start items-center gap-2 h-10">
                                    <img src="/icons/profile.png" alt="Profile" className="h-full w-auto" />
                                    <h2 className="font-semibold text-gray-800">u/{comment.author}</h2>
                                </div>
                                <p className="text-gray-500 text-sm">Posted on: {formatDate(comment.date_added)}</p>

                                <p className="text-gray-600 mb-2 overflow-clip">{comment.content}</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
