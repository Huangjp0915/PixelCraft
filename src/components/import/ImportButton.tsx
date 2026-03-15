import { useAppStore } from "@/store/useAppStore";
import { useToastStore } from "@/store/useToastStore";
import { openImageDialog } from "@/services/tauri/dialog";
import { loadImage } from "@/services/tauri/commands";
import "./ImportButton.css";

function ImportButton() {
  const { setImportedImage } = useAppStore();
  const { showToast } = useToastStore();

  const handleImport = async () => {
    try {
      const selected = await openImageDialog();

      if (selected) {
        // 调用 Rust command 读取图片信息
        const imageMeta = await loadImage(selected);

        setImportedImage({
          path: imageMeta.path,
          width: imageMeta.width,
          height: imageMeta.height,
        });
        showToast("图片导入成功", "success");
      }
    } catch (error) {
      console.error("导入图片失败:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      showToast(`导入图片失败: ${errorMsg}`, "error");
    }
  };

  return (
    <button className="import-button" onClick={handleImport}>
      选择图片 (JPG/PNG)
    </button>
  );
}

export default ImportButton;
