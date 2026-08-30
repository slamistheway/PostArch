import {
    Column,
    Entity,
    OneToMany,
    JoinColumn,
    ManyToMany,
    PrimaryColumn,
    ManyToOne,
    JoinTable,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';


@Entity({ name: 'posts' })
export class Post {
    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'manual_save', type: 'boolean' })
    manual_save!: boolean;

    @Column({ name: 'author', type: 'text' })
    author!: string;

    @Column({ name: 'title', type: 'text' })
    title!: string;

    @Column({ name: 'content', type: 'text' })
    content!: string;

    @Column({ name: 'image_path', type: 'text', nullable: true })
    image_path!: string | null;

    @Column({ name: 'url', type: 'text' })
    url!: string;

    @Column({ name: 'subreddit', type: 'text' })
    subreddit!: string;

    @Column({ name: 'date_added', type: 'timestamp' })
    date_added!: Date;
}


@Entity({ name: 'comments' })
export class Comment {
    @PrimaryColumn({ name: 'id', type: 'text' })
    id!: string;

    @Column({ name: 'manual_save', type: 'boolean', default: false })
    manual_save!: boolean;

    @Column({ name: 'parent_id', type: 'text' })
    parent_id!: string;

    @Column({ name: 'post_id', type: 'text' })
    post_id!: string;

    @Column({ name: 'author', type: 'text' })
    author!: string;

    @Column({ name: 'content', type: 'text' })
    content!: string;

    @Column({ name: 'url', type: 'text' })
    url!: string;

    @Column({ name: 'subreddit', type: 'text' })
    subreddit!: string;

    @Column({ name: 'date_added', type: 'timestamp' })
    date_added!: Date;

    @ManyToOne(() => Post)
    @JoinColumn({ name: 'post_id' })
    post!: Post;
}


@Entity({ name: 'lists' })
export class List {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'name', type: 'text' })
    name!: string;

    @Column({ name: 'date_added', type: 'timestamp' })
    date_added!: Date;
}


@Entity({ name: 'list_posts' })
export class PostInList {
    @PrimaryColumn({ name: 'list_id', type: 'int' })
    listId!: number;

    @PrimaryColumn({ name: 'post_id', type: 'text' })
    postId!: string;

    @ManyToOne(() => List, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'list_id' })
    list: List;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'post_id' })
    post: Post;
}


@Entity({ name: 'list_comments' })
export class ComemntInList {
    @PrimaryColumn({ name: 'list_id', type: 'int' })
    listId: number;

    @PrimaryColumn({ name: 'comment_id', type: 'text' })
    commentId: string;

    @ManyToOne(() => List, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'list_id' })
    list: List;

    @ManyToOne(() => Comment, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'comment_id' })
    comment: Comment;
}


@Entity({ name: 'pinned' })
export class Pinned {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'post_id', type: 'text', nullable: true })
    post_id: string | null;

    @Column({ name: 'comment_id', type: 'text', nullable: true })
    comment_id: string | null;

    @Column({ name: 'date_pinned', type: 'timestamp', default: () => 'NOW()' })
    date_pinned: Date;

    @ManyToOne(() => Post, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'post_id' })
    post: Post | null;

    @ManyToOne(() => Comment, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'comment_id' })
    comment: Comment | null;
}
