import dynamic from "next/dynamic";

export const metadata = {
  title: "Hướng Dẫn Sử Dụng - Gia Phả Trần Tộc Mỹ Nguyên",
  description:
    "Tài liệu hướng dẫn sử dụng các tính năng cơ bản của website gia phả điện tử.",
};

const GuidePage = dynamic(
  () => import("@/components/guide/guide-page").then((m) => m.GuidePage),
);

export default function Page() {
  return <GuidePage />;
}
