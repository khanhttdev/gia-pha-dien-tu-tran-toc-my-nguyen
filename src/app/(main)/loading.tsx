import { GlobalLoading } from "@/components/ui/global-loading";

export default function Loading() {
    // Trạng thái true/false tuỳ ý nhưng để fullScreen=false giúp loading chỉ xảy ra ở main area 
    return <GlobalLoading fullScreen={false} />;
}
