export class User {
  id!: string;
  email!: string;
  name!: string;
  createdAt!: number;
  updatedAt!: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateUserInput {
  email: string;
  name: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  published?: boolean;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  published?: boolean;
}
