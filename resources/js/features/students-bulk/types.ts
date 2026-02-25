export type BulkStudentInput = {
    username: string;
    email: string;
    password: string;
    full_name: string;
    nisn: string;
    gender: "laki-laki" | "perempuan";
    phone: string;
};

export type BulkStudentPayload = {
    kelas_id: number;
    students: BulkStudentInput[];
};

export type BulkValidationErrors = Record<string, string[]>;
