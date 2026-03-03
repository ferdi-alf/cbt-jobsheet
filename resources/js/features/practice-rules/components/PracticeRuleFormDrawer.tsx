import { ReactNode, useEffect, useMemo, useState } from "react";
import EntityDrawer from "@/Components/drawers/EntityDrawer";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import BulkGroups from "@/Components/bulk/BulkGroups";
import { useBulkGroups } from "@/hooks/bulk/useBulkGroups";
import { ApiError } from "@/lib/http";

import type { PracticeRuleEditDetail } from "../types";
import { usePracticeRuleLookups } from "../hooks/usePracticeRuleLookups";
import { usePracticeRuleMutations } from "../hooks/usePracticeRuleMutations";
import { getPracticeRuleForEdit } from "../api/practiceRules.api";

type ChecklistItem = { title: string };

export default function PracticeRuleFormDrawer({
    mode,
    ruleId,
    trigger,
}: {
    mode: "create" | "edit";
    ruleId?: number;
    trigger: ReactNode;
}) {
    const isEdit = mode === "edit";

    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    const { materis } = usePracticeRuleLookups(open);

    const mutations = usePracticeRuleMutations(() => {
        close();
    });

    const bulk = useBulkGroups<ChecklistItem>({
        initialItem: () => ({ title: "" }),
        initialItems: [{ title: "" }],
        errorPrefix: "checklists",
    });

    const [form, setForm] = useState<{
        materi_id: string;
        title: string;
        deadline_at: string;
    }>({
        materi_id: "",
        title: "",
        deadline_at: "",
    });

    useEffect(() => {
        if (!open) return;

        bulk.clearErrors();

        if (!isEdit) {
            setForm({ materi_id: "", title: "", deadline_at: "" });
            bulk.setItems([{ title: "" }]);
            return;
        }

        if (!ruleId) return;

        (async () => {
            try {
                const data: PracticeRuleEditDetail =
                    await getPracticeRuleForEdit(ruleId);

                setForm({
                    materi_id: String(data.materi_id ?? ""),
                    title: data.title ?? "",
                    deadline_at: toDatetimeLocal(data.deadline_at),
                });

                const items =
                    (data.checklists ?? []).map((c) => ({
                        title: c.title ?? "",
                    })) || [];

                bulk.setItems(items.length ? items : [{ title: "" }]);
            } catch (e) {}
        })();
    }, [open, isEdit, ruleId]);

    const canSubmit = useMemo(() => {
        if (!form.title.trim()) return false;
        if (!form.materi_id) return false;
        if (!bulk.items.length) return false;
        if (bulk.items.some((x) => !x.title.trim())) return false;
        return true;
    }, [form, bulk.items]);

    const set = (k: keyof typeof form, v: string) =>
        setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        bulk.clearErrors();

        const payload: any = {
            materi_id: Number(form.materi_id),
            title: form.title.trim(),
            deadline_at: form.deadline_at
                ? fromDatetimeLocal(form.deadline_at)
                : null,
            checklists: bulk.items.map((it) => ({ title: it.title.trim() })),
        };

        try {
            if (isEdit) {
                await mutations.update(ruleId!, payload);
            } else {
                await mutations.create(payload);
            }
        } catch (e: any) {
            const err = e as ApiError;
            const payloadJson = err?.payload;
            if (payloadJson?.errors) {
                bulk.setErrors(payloadJson.errors);
                bulk.scrollToFirstError();
            }
            throw e;
        }
    };

    return (
        <EntityDrawer<any>
            variant="slide"
            title={isEdit ? "Edit Rule Praktek" : "Tambah Rule Praktek"}
            trigger={trigger}
            id={ruleId ?? 0}
            open={open}
            onOpenChange={setOpen}
            render={({ close }) => (
                <div className="space-y-4 text-start">
                    <div className="grid gap-2">
                        <Label>Materi</Label>
                        <Select
                            value={form.materi_id}
                            onValueChange={(v) => set("materi_id", v)}
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={
                                        materis.isLoading
                                            ? "Loading..."
                                            : materis.isError
                                              ? "Gagal memuat materi"
                                              : "Pilih materi"
                                    }
                                />
                            </SelectTrigger>

                            <SelectContent>
                                {(materis.data ?? []).map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.title} ({m.kelas ?? "-"} /{" "}
                                        {m.mapel ?? "-"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {materis.isError && (
                            <div className="text-sm text-destructive">
                                {materis.error?.message ??
                                    "Gagal memuat lookup materi"}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Judul</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Deadline</Label>
                        <Input
                            type="datetime-local"
                            value={form.deadline_at}
                            onChange={(e) => set("deadline_at", e.target.value)}
                        />
                    </div>

                    <div className="pt-2">
                        <BulkGroups<ChecklistItem>
                            title="Checklist"
                            addLabel="Tambah Checklist"
                            itemsLabelPrefix="Item"
                            bulk={bulk}
                            renderItem={(item, idx, api) => (
                                <div className="grid gap-2">
                                    <Label>Judul Checklist</Label>
                                    <Input
                                        value={item.title}
                                        onChange={(e) =>
                                            api.update(idx, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: Upload foto hasil..."
                                    />
                                    {api.getFieldError(idx, "title") && (
                                        <div className="text-sm text-destructive">
                                            {api.getFieldError(idx, "title")}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={close}>
                            Batal
                        </Button>
                        <Button disabled={!canSubmit} onClick={submit}>
                            {isEdit ? "Update" : "Simpan"}
                        </Button>
                    </div>
                </div>
            )}
        />
    );
}

function toDatetimeLocal(iso: string | null | undefined) {
    if (!iso) return "";
    const s = iso.replace(" ", "T");
    return s.slice(0, 16);
}

function fromDatetimeLocal(v: string) {
    return v;
}
