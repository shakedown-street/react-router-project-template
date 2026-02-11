export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  isSuperuser: boolean;
};

export const userSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  isSuperuser: true,
};

export type UserWithPassword = User & {
  password: string;
};

export const userWithPasswordSelect = {
  ...userSelect,
  password: true,
};
