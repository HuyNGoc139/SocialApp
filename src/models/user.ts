export interface User {
  email: string;
  uid: string;
  username: string;
  DateBitrhDay?: any;
  url?: string;
  friends?: string[];
  createAt?: any;
  TwoFA?: boolean;
}
export interface posts {
  id?: string;
  url: string;
  createAt: any;
  body: string;
  userId: string; //=user cua nguoi dang
  type: string;
}
export interface postsLike {
  id: string;
  createAt: any;
  postId: string; //id cua post
  userId: string; //=user cua nguoi like
}
export interface comments {
  id: string;
  createAt: any;
  postId: string; //id cua post
  userId: string; //=user cua nguoi comment
  text: string;
}
export interface notifications {
  id: string;
  createAt: any;
  senderID: string;
  receiverId: string;
  title: string;
  data: string;
}
