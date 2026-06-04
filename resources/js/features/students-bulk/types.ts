// types.ts
export type BulkStudentInput = {
    nisn: string;
    full_name: string;
    username?: string;
    email?: string;
    password?: string;
    gender?: "laki-laki" | "perempuan" | "";
    phone?: string;
};

export type BulkStudentPayload = {
    kelas_id: number;
    students: BulkStudentInput[];
};

export type BulkValidationErrors = Record<string, string[]>;
