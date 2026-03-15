import ResolutionControl from "@/components/transform/ResolutionControl";
import PixelScaleControl from "@/components/transform/PixelScaleControl";
import CanvasSizeControl from "@/components/transform/CanvasSizeControl";
import PaletteControl from "@/components/transform/PaletteControl";
import DitherSwitch from "@/components/transform/DitherSwitch";
import BackgroundControl from "@/components/transform/BackgroundControl";
import GenerateButton from "@/components/transform/GenerateButton";
import PaletteSelector from "@/components/editor/PaletteSelector";
import MirrorControl from "@/components/editor/MirrorControl";
import PaletteEditor from "@/components/palette/PaletteEditor";
import { useTranslation } from "@/locales";
import "./RightSidebar.css";

function RightSidebar() {
  const t = useTranslation();
  
  return (
    <aside className="right-sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">{t.ui.transformParams}</h3>
        <div className="sidebar-content">
          <ResolutionControl />
          <PixelScaleControl />
          <CanvasSizeControl />
          <PaletteControl />
          <DitherSwitch />
          <BackgroundControl />
          <GenerateButton />
        </div>
      </div>
      <PaletteSelector />
      <MirrorControl />
      <PaletteEditor />
    </aside>
  );
}

export default RightSidebar;
