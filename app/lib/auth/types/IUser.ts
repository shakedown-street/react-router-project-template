export type IUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  isSuperuser: boolean;
};

export type IUserWithPassword = IUser & {
  password: string;
};
