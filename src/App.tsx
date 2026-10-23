import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MemosPage from "./pages/Memos";
import Resume from "./pages/Resume";
import KirklandsMemo from "./pages/memos/KirklandsMemo";
import LycraMemo from "./pages/memos/LycraMemo";
import PartyCityMemo from "./pages/memos/PartyCityMemo";
import IranMemoPartIFull from "./pages/memos/IranMemoPartIFull";
import IranMemoPartIIFull from "./pages/memos/IranMemoPartIIFull";
import IranMemoPartIIIFull from "./pages/memos/IranMemoPartIIIFull";
import ShadowPartnerMemo from "./pages/memos/ShadowPartnerMemo";
import FieldNotesIndex from "./pages/field-notes/FieldNotesIndex";
import FieldNoteDay from "./pages/field-notes/FieldNoteDay";
import TimelinePage from "./pages/TimelinePage";
import PositionsPage from "./pages/Positions";
import FulcrumIndexPage from "./pages/FulcrumIndex";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Casework from "./pages/Casework";
import RestorationCaseStudy from "./pages/casework/RestorationCaseStudy";
import BoardRoom from "./strategy/pages/BoardRoom";
import PlayerView from "./strategy/pages/PlayerView";
import OpsView from "./strategy/pages/OpsView";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/memos" element={<MemosPage />} />
            <Route path="/memos/kirklands" element={<KirklandsMemo />} />
            <Route path="/memos/lycra" element={<LycraMemo />} />
            <Route path="/memos/party-city" element={<PartyCityMemo />} />
            <Route path="/memos/iran" element={<IranMemoPartIFull />} />
            <Route path="/memos/iran-part-ii" element={<IranMemoPartIIFull />} />
            <Route path="/memos/iran-part-iii" element={<IranMemoPartIIIFull />} />
            <Route path="/memos/shadow-partner" element={<ShadowPartnerMemo />} />
            <Route path="/field-notes" element={<FieldNotesIndex />} />
            <Route path="/field-notes/:day" element={<FieldNoteDay />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/fulcrum-index" element={<FulcrumIndexPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/casework" element={<Casework />} />
            <Route path="/casework/restoration" element={<RestorationCaseStudy />} />
            <Route path="/strategy" element={<BoardRoom />} />
            <Route path="/strategy/play" element={<PlayerView />} />
            <Route path="/strategy/ops" element={<OpsView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
