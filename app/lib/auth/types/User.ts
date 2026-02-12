export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  isSuperuser: boolean;
};

export type UserWithPassword = User & {
  password: string;
};
