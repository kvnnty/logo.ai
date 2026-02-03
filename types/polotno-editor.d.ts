declare module "@/components/dashboard/editor/polotno-editor" {
  import { ComponentType } from "react";
  interface PolotnoEditorProps {
    brandId: string;
    designId: string;
    designName?: string;
    initialJson: Record<string, unknown> | null;
  }
  const PolotnoEditor: ComponentType<PolotnoEditorProps>;
  export default PolotnoEditor;
}
