import SectionField from "@/components/ui/SectionField";
import type { Backdrop } from "@/lib/backdrop";

export default function PageBackdrop({
  top = "constellation",
  bottom = "bloom",
}: {
  top?: Backdrop;
  bottom?: Backdrop;
}) {
  return (
    <div
      aria-hidden
      data-backdrop-scope
      className="pointer-events-none absolute inset-0 overflow-hidden print:hidden"
    >
      <div className="page-flow absolute inset-0" />
      <div className="page-drift" />
      <div className="absolute inset-x-0 top-0 h-[62%]">
        <SectionField backdrop={top} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[58%]">
        <SectionField backdrop={bottom} />
      </div>
    </div>
  );
}
