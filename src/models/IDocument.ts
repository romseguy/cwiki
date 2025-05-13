export interface IDocument extends Record<string, any> {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}
