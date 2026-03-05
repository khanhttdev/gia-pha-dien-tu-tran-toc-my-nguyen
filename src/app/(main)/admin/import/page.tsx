"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Workflow,
  Users,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseGedcom, GedcomData } from "@/lib/gedcom-parser";
import { importGedcomAction } from "@/lib/import-actions";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminImportPage() {
  const [fileData, setFileData] = useState<GedcomData | null>(null);
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".ged")) {
      toast.error("Vui lòng chọn file có định dạng tiêu chuẩn .ged (GEDCOM)");
      return;
    }

    setFileName(file.name);
    setIsParsing(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const parsed = parseGedcom(text);
      setFileData(parsed);
      toast.success(
        `Phân tích hoàn tất: Tìm thấy ${parsed.individuals.length} tổ tiên/hậu duệ và ${parsed.families.length} liên kết gia đình.`,
      );
    } catch (error: any) {
      console.error("Lỗi khi đọc file GEDCOM:", error);
      toast.error(
        "Không thể đọc file. Cấu trúc GEDCOM không hợp lệ hoặc bị lỗi mã hóa.",
      );
    } finally {
      setIsParsing(false);
    }

    e.target.value = "";
  };

  const handleImportToDatabase = async () => {
    if (!fileData) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importGedcomAction(fileData);
      setImportResult(result);
      if (result.success) {
        toast.success("Đã đồng bộ hóa dữ liệu GEDCOM vào Hệ thống thành công!");
      } else {
        toast.error("Lỗi đồng bộ: " + result.message);
      }
    } catch (error: any) {
      console.error("Lỗi khi Import:", error);
      toast.error("Hệ thống gặp sự cố khi truyền tải dữ liệu vào kho lưu trữ.");
    } finally {
      setIsImporting(false);
      setFileData(null);
      setFileName("");
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-10 overflow-y-auto custom-scrollbar w-full max-w-4xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <Button
            aria-label="Quay lại"
            variant="outline"
            size="icon"
            className="h-10 w-10 border-heritage-gold/20 hover:bg-heritage-gold/10 text-heritage-gold rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold royal-text-gradient flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-heritage-gold" />
            Nhập Dữ Liệu Gia Tộc
          </h1>
          <p className="text-sm text-heritage-gold-dim mt-1.5 font-medium italic opacity-70">
            Đồng bộ hóa sổ sách từ định dạng GEDCOM quốc tế (.ged)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Upload Card */}
        <Card className="bg-royal-card border-heritage-gold/20 p-12 royal-glass flex flex-col items-center justify-center text-center space-y-8 hover:royal-gold-glow transition-all duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-heritage-gold/50 to-transparent opacity-30"></div>

          <div className="w-24 h-24 royal-halo bg-heritage-gold/10 flex items-center justify-center text-heritage-gold shadow-[0_0_30px_rgba(234,179,8,0.1)] mb-4">
            <UploadCloud className="w-10 h-10 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <div className="space-y-3">
            <h3 className="font-serif text-2xl font-bold text-heritage-gold">Tải Lên Tệp Tin GEDCOM</h3>
            <p className="text-sm text-heritage-gold-dim max-w-md mx-auto italic font-medium opacity-80 leading-relaxed px-4">
              Hệ thống sẽ tự động đối soát, nhận diện nhân khẩu mới và kết nối các nhánh phả hệ dựa trên tiêu chuẩn GEDCOM quốc tế.
            </p>
          </div>

          <label className="relative mt-4 group">
            <Button
              className="gold-gradient text-amber-950 font-black px-10 py-6 rounded-2xl shadow-2xl transition-all group-hover:scale-105 active:scale-95 text-xs uppercase tracking-[0.2em] pointer-events-none"
            >
              Chọn Tệp Tin .GED
            </Button>
            <input
              type="file"
              accept=".ged"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={isParsing || isImporting}
            />
          </label>

          <div className="pt-6 border-t border-heritage-gold/5 w-full max-w-sm">
            <p className="text-[10px] text-heritage-gold-dim/40 font-bold uppercase tracking-widest">Định dạng hỗ trợ: GEDCOM 5.5 / 5.5.1</p>
          </div>
        </Card>

        {isParsing && (
          <Card className="p-8 bg-royal-card border-heritage-gold/30 flex items-center justify-center gap-4 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-heritage-gold" />
            <p className="text-sm font-serif font-bold royal-text-gradient uppercase tracking-widest">
              Đang giải mã cấu trúc cổ thư kỹ thuật số...
            </p>
          </Card>
        )}

        {fileData && !isParsing && (
          <Card className="bg-royal-card border-heritage-gold/40 p-10 royal-glass animate-in zoom-in-95 duration-500 hover:royal-gold-glow-pink">
            <div className="flex items-center gap-6 border-b border-heritage-gold/10 pb-8 mb-8">
              <div className="w-14 h-14 royal-halo-pink bg-rose-500/10 flex items-center justify-center">
                <FileText className="w-7 h-7 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-xl font-bold text-heritage-gold truncate mb-1">{fileName}</h4>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80">
                    Đã xác thực chữ ký dữ liệu hợp lệ
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-black/40 rounded-3xl p-6 border border-heritage-gold/10 text-center hover:border-heritage-gold/30 transition-all">
                <Users className="w-5 h-5 text-heritage-gold/30 mx-auto mb-2" />
                <p className="text-4xl font-serif font-black royal-text-gradient mb-1">
                  {fileData.individuals.length}
                </p>
                <p className="text-[10px] font-black text-heritage-gold-dim uppercase tracking-[0.2em] opacity-40">
                  Thành viên/Nhân khẩu
                </p>
              </div>
              <div className="bg-black/40 rounded-3xl p-6 border border-heritage-gold/10 text-center hover:border-heritage-gold/30 transition-all">
                <Workflow className="w-5 h-5 text-heritage-gold/30 mx-auto mb-2" />
                <p className="text-4xl font-serif font-black royal-text-gradient mb-1">
                  {fileData.families.length}
                </p>
                <p className="text-[10px] font-black text-heritage-gold-dim uppercase tracking-[0.2em] opacity-40">
                  Liên kết/Hệ phả
                </p>
              </div>
            </div>

            <Card className="mt-8 p-6 bg-heritage-maroon/20 border-heritage-gold/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck className="w-20 h-20 text-heritage-gold" />
              </div>
              <div className="flex items-start gap-4 text-heritage-gold-dim/90 relative z-10">
                <AlertCircle className="w-5 h-5 text-heritage-gold shrink-0 mt-0.5 opacity-60" />
                <div className="text-xs leading-relaxed space-y-3 font-medium">
                  <strong className="text-heritage-gold uppercase tracking-widest text-[10px]">Tiến trình đồng bộ tự động:</strong>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-heritage-gold/40" />
                      Kiểm tra trùng lặp và giữ nguyên các bản ghi đã tồn tại.
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-heritage-gold/40" />
                      Khởi tạo nhân khẩu mới vào hệ quản trị dòng tộc.
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-heritage-gold/40" />
                      Thiết lập quan hệ Huyết thống (Cha-Con) và Hôn nhân (Vợ-Chồng).
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="pt-10 flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                className="text-heritage-gold-dim hover:text-heritage-gold hover:bg-heritage-gold/5 font-bold uppercase tracking-widest text-[10px] px-6"
                onClick={() => setFileData(null)}
                disabled={isImporting}
              >
                Hủy bỏ
              </Button>
              <Button
                className="bg-heritage-gold hover:bg-heritage-gold/90 text-amber-950 font-black px-10 py-6 rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-0.98 text-xs uppercase tracking-[0.2em]"
                onClick={handleImportToDatabase}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" /> Đang cập nhật sử thư...
                  </>
                ) : (
                  "Xác nhận Đồng bộ Hóa"
                )}
              </Button>
            </div>
          </Card>
        )}

        {importResult && (
          <Card
            className={cn(
              "p-6 flex items-start gap-4 animate-in slide-in-from-bottom-4 duration-500",
              importResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
            )}
          >
            {importResult.success ? (
              <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-bold font-serif">{importResult.success ? "Thành công" : "Thất bại"}</p>
              <p className="text-xs font-medium italic opacity-80">{importResult.message}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
