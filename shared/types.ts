// Types partagés entre frontend et backend

export interface User {
  id: number;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Form {
  id: number;
  name: string;
  creatorId: number;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
  fields: FormField[];
}

export interface FormField {
  id: number;
  formId: number;
  type: 'text' | 'textarea';
  label: string;
  order: number;
  required: boolean;
}

export interface FormSubmission {
  id: number;
  formId: number;
  form?: Form;
  submitterId: number;
  submitter?: User;
  data: Record<string, string>;
  excelFileName?: string;
  excelFilePath?: string;
  createdAt: Date;
}

export interface ExcelFile {
  id: number;
  fileName: string;
  filePath: string;
  ownerId: number;
  owner?: User;
  formId: number;
  form?: Form;
  version: number;
  submissionsCount: number;
  createdAt: Date;
}

// DTOs pour les requêtes API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'USER';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface CreateFormRequest {
  name: string;
  fields: Omit<FormField, 'id' | 'formId'>[];
}

export interface SubmitFormRequest {
  formId: number;
  data: Record<string, string>;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}