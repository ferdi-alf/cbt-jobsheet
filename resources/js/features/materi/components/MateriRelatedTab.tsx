import DataTable from "@/Components/data-table/DataTable";
import type { TestRow } from "../types";

type PracticeRuleRow = {
    id: number;
    title: string | null;
    deadline_at?: string | null;
    created_at?: string;
};

type ChecklistRow = {
    id: number;
    order: number;
    title: string;
    created_at?: string;
};

export default function MateriRelatedTab({ materiId }: { materiId: number }) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl border p-4">
                <div className="font-semibold mb-2">Pretest & Posttest</div>
                <DataTable<TestRow>
                    fetchUrl={`/api/materis/${materiId}/tests`}
                    columns={
                        [
                            { key: "title", label: "Title" },
                            { key: "type", label: "Type" },
                            { key: "created_at", label: "Created At" },
                        ] as any
                    }
                    search={{ enabled: false }}
                    pagination={{ enabled: false }}
                    striped
                    emptyMessage="Belum ada test."
                />
            </div>

            <div className="rounded-xl border p-4">
                <div className="font-semibold mb-2">Praktek</div>

                <DataTable<PracticeRuleRow>
                    fetchUrl={`/api/materis/${materiId}/practice-checklists`}
                    columns={
                        [
                            { key: "title", label: "Rule" },
                            { key: "deadline_at", label: "Deadline" },
                            { key: "created_at", label: "Created At" },
                        ] as any
                    }
                    search={{ enabled: false }}
                    pagination={{ enabled: false }}
                    striped
                    expandable={{
                        condition: () => true,
                        render: (_sub, rule) => (
                            <div className="rounded-lg border p-3 bg-background">
                                <div className="font-semibold mb-2">
                                    Checklist
                                </div>
                                <DataTable<ChecklistRow>
                                    fetchUrl={`/api/practice-rules/${rule.id}/checklists`}
                                    columns={
                                        [
                                            { key: "order", label: "#" },
                                            { key: "title", label: "Title" },
                                            {
                                                key: "created_at",
                                                label: "Created At",
                                            },
                                        ] as any
                                    }
                                    search={{
                                        enabled: true,
                                        placeholder: "Cari checklist...",
                                        debounceMs: 300,
                                    }}
                                    pagination={{
                                        enabled: true,
                                        pageSize: 10,
                                        pageSizeOptions: [5, 10, 15, 20],
                                    }}
                                    striped
                                    emptyMessage="Belum ada checklist."
                                />
                            </div>
                        ),
                    }}
                    emptyMessage="Belum ada rule praktek."
                />
            </div>
        </div>
    );
}
