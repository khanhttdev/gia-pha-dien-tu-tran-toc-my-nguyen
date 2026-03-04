import { GlobalLoading } from "@/components/ui/global-loading";

export default function Loading() {
    // Vùng Auth cũng dùng kiểu loading cục bộ để giữ background
    return <GlobalLoading fullScreen={false} />;
}
