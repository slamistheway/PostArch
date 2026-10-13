export interface PostInterface {
    id: string;
    manual_save: boolean;
    author: string;
    title: string;
    content: string;
    image_path?: string | null;
    url: string;
    subreddit: string;
    date_added: Date;
    isPinned?: boolean | false;
}

export interface CommentInterface {
    id: string;
    post_id: string;
    manual_save: boolean;
    author: string;
    content: string;
    url: string;
    subreddit: string;
    date_added: Date;
}

export interface ListInterface {
    id: number;
    name: string;
    date_added: Date;
}

export interface AllInterface {
    id: string;
    post_id?: string | null;
    manual_save: boolean;
    author?: string;
    title?: string | null;
    content: string;
    url: string;
    subreddit?: string;
    date_added: Date;
}
