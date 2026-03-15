import { useAppStore } from "@/store/useAppStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useToastStore } from "@/store/useToastStore";
import { useTranslation } from "@/locales";
import { generatePixelArt } from "@/services/tauri/commands";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import "./GenerateButton.css";

function GenerateButton() {
  const {
    importedImage,
    transformSettings,
    setPixelDocument,
    isGenerating,
    setIsGenerating,
  } = useAppStore();

  const { showToast } = useToastStore();
  const t = useTranslation();

  const handleGenerate = async () => {
    if (!importedImage) {
      showToast(t.ui.pleaseImportImage, "warning");
      return;
    }

    console.log("开始生成像素画...", {
      path: importedImage.path,
      settings: transformSettings,
    });

    setIsGenerating(true);
    try {
      const document = await generatePixelArt(
        importedImage.path,
        transformSettings
      );
      console.log("生成成功:", document);
      setPixelDocument(document);
      // 生成新像素画后，如果有工程路径，标记为未保存
      const { currentProjectPath } = useProjectStore.getState();
      if (currentProjectPath) {
        useProjectStore.getState().setHasUnsavedChanges(true);
      }
      showToast(t.ui.generatingSuccess, "success");
    } catch (error) {
      console.error("生成像素画失败:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      showToast(`${t.ui.generatingFailed}: ${errorMsg}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="generate-button-container">
      <button
        className="generate-button"
        onClick={handleGenerate}
        disabled={!importedImage || isGenerating}
      >
        {isGenerating ? t.ui.generating : t.ui.generatePixelArt}
      </button>
      {isGenerating && (
        <div className="generate-loading">
          <LoadingSpinner size="small" message={t.ui.processingImage} />
        </div>
      )}
    </div>
  );
}

export default GenerateButton;
