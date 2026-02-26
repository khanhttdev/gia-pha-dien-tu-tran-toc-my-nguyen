'use client'

import { useState } from 'react'
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { parseGedcom, GedcomData } from '@/lib/gedcom-parser'
import { importGedcomAction } from '@/lib/import-actions'

export default function AdminImportPage() {
    const [fileData, setFileData] = useState<GedcomData | null>(null)
    const [fileName, setFileName] = useState('')
    const [isParsing, setIsParsing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.name.endsWith('.ged')) {
            toast.error('Vui lòng chọn file có định dạng .ged')
            return
        }

        setFileName(file.name)
        setIsParsing(true)
        setImportResult(null)

        try {
            const text = await file.text()
            // Xử lý chạy parse trong luồng hiện tại vì file text thường nhỏ. 
            // Nếu file cực lớn, có thể dùng Web Worker, nhưng client-side là đủ cho GEDCOM < 5MB
            const parsed = parseGedcom(text)
            setFileData(parsed)
            toast.success(`Đã phân tích file: ${parsed.individuals.length} thành viên, ${parsed.families.length} gia đình.`)
        } catch (error: any) {
            console.error('Lỗi khi đọc file GEDCOM:', error)
            toast.error('Không thể đọc file. File bị lỗi cú pháp hoặc không đúng chuẩn GEDCOM.')
        } finally {
            setIsParsing(false)
        }

        // Reset input để người dùng có thể chọn lại file cũ nếu muốn
        e.target.value = ''
    }

    const handleImportToDatabase = async () => {
        if (!fileData) return

        setIsImporting(true)
        setImportResult(null)

        try {
            const result = await importGedcomAction(fileData)
            setImportResult(result)
            if (result.success) {
                toast.success('Nhập dữ liệu thành công!')
            } else {
                toast.error('Có lỗi xảy ra: ' + result.message)
            }
        } catch (error: any) {
            console.error('Lỗi khi Import:', error)
            toast.error('Có lỗi xảy ra trong quá trình truyền dữ liệu.')
        } finally {
            setIsImporting(false)
            setFileData(null)
            setFileName('')
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Nhập dữ liệu gia phả (Import)</h1>
                <p className="text-sm text-muted-foreground">Nhập tệp dữ liệu chuẩn quốc tế chuẩn `.ged` (GEDCOM) xuất ra từ các phần mềm quản lý gia phả khác. Hệ thống sẽ tự động tìm các bản ghi trùng lặp và bỏ qua nếu thành viên đã có trong Hệ thống.</p>
            </div>

            <div className="glass rounded-xl border border-border/50 p-8 flex flex-col items-center justify-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg">Tải lên tệp GEDCOM</h3>
                <p className="text-sm text-muted-foreground max-w-md">Kéo thả tệp hoặc bấm vào nút bên dưới để tải lên tệp gia phả của bạn. Chỉ hỗ trợ tiếng Anh hoặc tiếng Việt Unicode.</p>

                <label className="relative mt-4">
                    <Button variant="default" className="cursor-pointer pointer-events-none">Chọn File .GED</Button>
                    <input
                        type="file"
                        accept=".ged"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        disabled={isParsing || isImporting}
                    />
                </label>
            </div>

            {isParsing && (
                <div className="flex items-center gap-3 p-4 glass rounded-lg text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Đang phân tích cấu trúc cấu trúc tệp dữ liệu...
                </div>
            )}

            {fileData && !isParsing && (
                <div className="glass rounded-xl border border-amber-500/30 p-6 space-y-4 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                        <FileText className="w-6 h-6 text-amber-500" />
                        <div>
                            <h4 className="font-semibold">{fileName}</h4>
                            <p className="text-xs text-muted-foreground">Đã quét thấy nội dung hợp lệ</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="bg-background/50 rounded-lg p-4 border border-border/40 text-center">
                            <p className="text-3xl font-bold text-amber-500 mb-1">{fileData.individuals.length}</p>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thành viên</p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-4 border border-border/40 text-center">
                            <p className="text-3xl font-bold text-amber-500 mb-1">{fileData.families.length}</p>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mối liên kết</p>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3 mt-4">
                        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-500/90 leading-relaxed">
                            <strong>Tiến trình sẽ tự động:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>Kiểm tra và giữ nguyên nếu thành viên đã có sẵn (Skip).</li>
                                <li>Chỉ thêm nhân khẩu mới hoàn toàn.</li>
                                <li>Thiết lập quan hệ cha-con và vợ/chồng.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setFileData(null)} disabled={isImporting}>
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="default"
                            className="bg-amber-600 hover:bg-amber-700 font-semibold shadow-md"
                            onClick={handleImportToDatabase}
                            disabled={isImporting}
                        >
                            {isImporting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập nhật dữ liệu...</>
                            ) : (
                                "Xác nhận Nhập Dữ Liệu"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {importResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 mt-4 border ${importResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
                    {importResult.success ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium">{importResult.message}</p>
                </div>
            )}
        </div>
    )
}
