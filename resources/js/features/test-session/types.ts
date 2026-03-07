export type TestType = "pretest" | "posttest";
export type TestOptionValue = "A" | "B" | "C" | "D" | "E";

export type TestOptionItem = {
    label: "A" | "B" | "C" | "D" | "E";
    value: TestOptionValue;
    text: string;
};

export type TestQuestionItem = {
    id: number;
    number: number;
    question: string;
    selected_option: TestOptionValue | null;
    options: TestOptionItem[];
};

export type TestSessionData = {
    public_key: string;
    title: string;
    type: TestType;
    materi: {
        id: number;
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
    duration_minutes: number;
    started_at: string | null;
    expires_at: string | null;
    remaining_seconds: number;
    is_score_visible: boolean;
    total_questions: number;
    answered_count: number;
    result_url: string;
    questions: TestQuestionItem[];
};

export type StartTestResponse =
    | {
          already_finished: true;
          redirect_url: string;
          finish_reason?: "timeout" | "manual";
      }
    | TestSessionData;

export type TestResultData = {
    public_key: string;
    title: string;
    type: TestType;
    materi: {
        id: number;
        title: string;
        kelas?: string | null;
        mapel?: string | null;
    } | null;
    started_at: string | null;
    finished_at: string | null;
    duration_seconds: number;
    total_questions: number;
    answered_count: number;
    unanswered_count: number;
    correct_count: number;
    wrong_count: number;
    score: number | null;
    is_score_visible: boolean;
    back_url: string;
    back_label: string;
};
