import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { posterService } from '../services/posterService';
import {
  PosterTeam,
  PosterDataResponse,
  PlayerCardItem,
  PosterSettings,
  ExportDimensionId,
  PosterTemplateId,
  EXPORT_DIMENSIONS,
} from '../types/poster';
import { ModernPosterTemplate } from '../components/poster/ModernPosterTemplate';
import { AnnouncementPosterTemplate } from '../components/poster/AnnouncementPosterTemplate';
import { MinimalPosterTemplate } from '../components/poster/MinimalPosterTemplate';
import { PlayerCardView } from '../components/poster/PlayerCardView';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import {
  Download,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Users,
  Star,
  Archive,
  Eye,
  Sliders,
} from 'lucide-react';

const SEASONS = ['2026-27', '2025-26', '2024-25'];

export const PosterGeneratorPage: React.FC = () => {
  // Teams & Selection State
  const [teams, setTeams] = useState<PosterTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-1');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026-27');
  const [posterData, setPosterData] = useState<PosterDataResponse | null>(null);
  const [playerCards, setPlayerCards] = useState<PlayerCardItem[]>([]);

  // Studio Settings State
  const [settings, setSettings] = useState<PosterSettings>({
    title: '',
    subtitle: '',
    template: 'modern',
    dimension: 'instagram-portrait',
    showPositions: true,
    showJerseyNumbers: true,
    showCaptainBadge: true,
    showAge: true,
    showRating: true,
    customAccentColor: '',
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeView, setActiveView] = useState<'poster' | 'cards'>('poster');

  // Hidden references for high-res export
  const fullPosterRef = useRef<HTMLDivElement>(null);
  const hiddenCardsContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Tournament Teams on Mount
  useEffect(() => {
    let mounted = true;
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const data = await posterService.getTeams();
        if (!mounted) return;
        setTeams(data);
        if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        }
      } catch (err: any) {
        showToast('error', 'Failed to load tournament teams');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTeams();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Squad Poster Data when Team or Season changes
  useEffect(() => {
    if (!selectedTeamId) return;
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [pData, cData] = await Promise.all([
          posterService.getTeamPosterData(selectedTeamId, selectedSeason),
          posterService.getTeamPlayerCards(selectedTeamId, selectedSeason),
        ]);
        if (!mounted) return;
        setPosterData(pData);
        setPlayerCards(cData.cards);

        // Update default title & subtitle based on team
        setSettings((prev) => ({
          ...prev,
          title: `${pData.team.name.toUpperCase()} SQUAD`,
          subtitle: `OFFICIAL ROSTER ANNOUNCEMENT · SEASON ${pData.season}`,
          customAccentColor: pData.team.primaryColor,
        }));
      } catch (err: any) {
        showToast('error', err.message || 'Failed to compile team squad data');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [selectedTeamId, selectedSeason]);

  // Reset to default settings
  const handleResetSettings = () => {
    if (!posterData) return;
    setSettings({
      title: `${posterData.team.name.toUpperCase()} SQUAD`,
      subtitle: `OFFICIAL ROSTER ANNOUNCEMENT · SEASON ${posterData.season}`,
      template: 'modern',
      dimension: 'instagram-portrait',
      showPositions: true,
      showJerseyNumbers: true,
      showCaptainBadge: true,
      showAge: true,
      showRating: true,
      customAccentColor: posterData.team.primaryColor,
    });
    showToast('success', 'Reset studio settings to defaults');
  };

  // Export Full Squad Poster as PNG
  const handleDownloadPoster = async () => {
    if (!fullPosterRef.current || !posterData) return;
    try {
      setIsExporting(true);
      setExportProgress('Rendering high-resolution poster graphic...');

      // Render with 2x pixel ratio for print clarity
      const dataUrl = await toPng(fullPosterRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });

      const teamSlug = posterData.team.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${teamSlug}_Squad_Poster_${settings.dimension}_${selectedSeason}.png`;

      // Trigger download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      // Log export event to backend
      posterService.logPosterExport(selectedTeamId, {
        template: settings.template,
        format: 'PNG',
        dimensions: `${EXPORT_DIMENSIONS[settings.dimension].width}x${EXPORT_DIMENSIONS[settings.dimension].height}`,
        count: 1,
      });

      showToast('success', `Poster exported successfully (${filename})`);
    } catch (err: any) {
      console.error('Failed to export poster:', err);
      showToast('error', 'Image export failed. Ensure all player photos have loaded.');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Export Single Player Card as PNG
  const handleDownloadSingleCard = async (card: PlayerCardItem) => {
    const el = document.getElementById(`card-export-${card.id}`);
    if (!el) return;
    try {
      setIsExporting(true);
      setExportProgress(`Generating card for ${card.fullName}...`);

      const dataUrl = await toPng(el, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });

      const cleanName = card.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${cleanName}_${card.playingPosition}_Card.png`;

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      showToast('success', `Exported card for ${card.fullName}`);
    } catch (err: any) {
      console.error('Card export failed:', err);
      showToast('error', `Failed to export card for ${card.fullName}`);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Export ALL Player Cards into a Single ZIP file using JSZip
  const handleDownloadAllCardsZip = async () => {
    if (!playerCards || playerCards.length === 0 || !posterData) {
      showToast('error', 'No player cards available to export');
      return;
    }

    try {
      setIsExporting(true);
      const zip = new JSZip();
      const folderName = `${posterData.team.name.replace(/[^a-zA-Z0-9]/g, '_')}_Player_Cards`;
      const imgFolder = zip.folder(folderName);

      let completedCount = 0;
      const total = playerCards.length;

      for (let i = 0; i < total; i++) {
        const card = playerCards[i];
        setExportProgress(`Generating card ${i + 1} of ${total}: ${card.fullName}...`);

        const el = document.getElementById(`hidden-card-${card.id}`);
        if (el) {
          try {
            const dataUrl = await toPng(el, {
              quality: 0.95,
              pixelRatio: 2,
              cacheBust: true,
            });

            // Convert base64 dataUrl to pure base64 bytes
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
            const safeName = card.fullName.replace(/[^a-zA-Z0-9]/g, '_');
            const jerseyStr = card.jerseyNumber ? `_#${card.jerseyNumber}` : '';
            const fileName = `${String(i + 1).padStart(2, '0')}_${safeName}_${card.playingPosition}${jerseyStr}.png`;

            imgFolder?.file(fileName, base64Data, { base64: true });
            completedCount++;
          } catch (imgErr) {
            console.warn(`Card render skipped for ${card.fullName}:`, imgErr);
          }
        }
      }

      if (completedCount === 0) {
        throw new Error('Could not render any player cards.');
      }

      setExportProgress(`Packaging ${completedCount} cards into ZIP archive...`);
      const zipContent = await zip.generateAsync({ type: 'blob' });

      // Trigger ZIP file download
      const zipUrl = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${posterData.team.name.replace(/[^a-zA-Z0-9]/g, '_')}_Player_Cards_${selectedSeason}.zip`;
      link.click();
      URL.revokeObjectURL(zipUrl);

      // Log export event
      posterService.logPosterExport(selectedTeamId, {
        template: 'player-cards-zip',
        format: 'ZIP',
        dimensions: '360x520',
        count: completedCount,
      });

      showToast('success', `Exported ${completedCount} player cards in ZIP!`);
    } catch (err: any) {
      console.error('ZIP generation error:', err);
      showToast('error', err.message || 'Failed to build ZIP archive');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const activeDimension = EXPORT_DIMENSIONS[settings.dimension];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-pitch-glow text-xs text-white flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500'
              : 'bg-rose-950/95 border-rose-500'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span className="font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Export Progress Modal */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl bg-pitch-card border border-orange-500/50 shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white">Generating Graphics</h3>
            <p className="text-xs text-slate-300 font-mono">
              {exportProgress || 'Rendering image...'}
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-950/70 via-pitch-card to-slate-900 border border-orange-500/40 shadow-pitch-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-3 h-3 text-orange-400" />
              PHASE 5 STUDIO
            </span>
            <span className="text-xs font-mono text-slate-400">
              Official Team Squad Graphics Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Team Squad Poster & Player Card Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Render broadcast-ready squad roster announcements and high-resolution player cards
            using actual purchased auction squad data.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('poster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'poster'
                ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
                : 'text-slate-400 hover:text-white bg-pitch-darker border border-pitch-border'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Squad Poster
          </button>
          <button
            onClick={() => setActiveView('cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'cards'
                ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
                : 'text-slate-400 hover:text-white bg-pitch-darker border border-pitch-border'
            }`}
          >
            <Layers className="w-4 h-4" />
            Player Cards ({playerCards.length})
          </button>
        </div>
      </div>

      {/* Main Studio Workspace: 3-Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT PANEL: TEAM & SQUAD SELECTION (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 border-pitch-border bg-pitch-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5 pb-2 border-b border-pitch-border">
              <Users className="w-4 h-4" />
              Franchise Selection
            </h3>

            {/* Team Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select Franchise Team:
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-bold"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Season Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                League Season:
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    Season {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Franchise Summary Card */}
            {posterData && (
              <div className="p-3.5 rounded-xl bg-pitch-darker border border-pitch-border space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-slate-800 border flex items-center justify-center text-lg font-bold"
                    style={{ borderColor: posterData.team.primaryColor }}
                  >
                    {posterData.team.logoUrl && posterData.team.logoUrl.length > 2 ? (
                      <img src={posterData.team.logoUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <span>{posterData.team.logoUrl || '⚡'}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {posterData.team.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Coach: {posterData.team.coach || 'Head Coach'}
                    </p>
                  </div>
                </div>

                {/* Position Breakdown Table */}
                <div className="pt-2 border-t border-pitch-border space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Squad Size:</span>
                    <span className="font-mono font-bold text-white">
                      {posterData.squadStats.totalPlayers} Players
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Goalkeepers:</span>
                    <span className="font-mono">{posterData.squadStats.goalkeepers}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Defenders:</span>
                    <span className="font-mono">{posterData.squadStats.defenders}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Midfielders:</span>
                    <span className="font-mono">{posterData.squadStats.midfielders}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Forwards:</span>
                    <span className="font-mono">{posterData.squadStats.forwards}</span>
                  </div>
                  {posterData.squadStats.captain && (
                    <div className="flex justify-between text-amber-300 pt-1 font-bold">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" /> Captain:
                      </span>
                      <span className="truncate max-w-[120px]">
                        {posterData.squadStats.captain.fullName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ================= CENTER PANEL: LIVE PREVIEW VIEWPORT (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-4 border-pitch-border bg-pitch-card flex flex-col items-center justify-between min-h-[640px]">
            {/* Viewport Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-pitch-border text-xs text-slate-400">
              <span className="font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-400" />
                Live Studio Viewport
              </span>
              <span className="font-mono text-[11px] text-orange-400">
                {activeDimension.width} × {activeDimension.height} px ({activeDimension.name})
              </span>
            </div>

            {/* Poster Preview Viewport with CSS Scaling */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-24">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Compiling squad graphics...</p>
              </div>
            ) : posterData ? (
              <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden">
                {activeView === 'poster' ? (
                  /* Scaled Poster Wrapper to fit preview area nicely */
                  <div
                    className="relative shadow-2xl rounded-2xl overflow-hidden border border-white/20 origin-center transition-all duration-300"
                    style={{
                      width: '420px',
                      height: `${(420 * activeDimension.height) / activeDimension.width}px`,
                      maxHeight: '560px',
                    }}
                  >
                    <div
                      style={{
                        width: `${activeDimension.width}px`,
                        height: `${activeDimension.height}px`,
                        transform: `scale(${420 / activeDimension.width})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      {settings.template === 'modern' && (
                        <ModernPosterTemplate
                          data={posterData}
                          settings={settings}
                          dimension={activeDimension}
                        />
                      )}
                      {settings.template === 'announcement' && (
                        <AnnouncementPosterTemplate
                          data={posterData}
                          settings={settings}
                          dimension={activeDimension}
                        />
                      )}
                      {settings.template === 'minimal' && (
                        <MinimalPosterTemplate
                          data={posterData}
                          settings={settings}
                          dimension={activeDimension}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Cards Grid View */
                  <div className="w-full h-full max-h-[560px] overflow-y-auto pr-2 grid grid-cols-2 gap-3">
                    {playerCards.map((card) => (
                      <div
                        key={card.id}
                        className="p-3 rounded-xl bg-pitch-darker border border-pitch-border flex flex-col items-center text-center justify-between hover:border-orange-500/50 transition-all"
                      >
                        <img
                          src={card.photoUrl}
                          alt={card.fullName}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-700 shadow mb-2"
                        />
                        <h4 className="text-xs font-bold text-white truncate w-full">
                          {card.fullName}
                        </h4>
                        <span className="text-[10px] text-orange-400 font-mono">
                          {card.playingPosition} {card.jerseyNumber ? `· #${card.jerseyNumber}` : ''}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadSingleCard(card)}
                          icon={Download}
                          className="mt-2 text-[10px] py-1 px-2.5 w-full"
                        >
                          PNG Card
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                Select a team to preview poster
              </div>
            )}

            {/* Bottom Download Actions Bar */}
            <div className="w-full pt-4 border-t border-pitch-border flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="primary"
                onClick={handleDownloadPoster}
                disabled={isExporting || !posterData}
                icon={Download}
                className="font-black bg-orange-600 hover:bg-orange-500 text-white"
              >
                Download Poster (PNG)
              </Button>

              <Button
                variant="secondary"
                onClick={handleDownloadAllCardsZip}
                disabled={isExporting || playerCards.length === 0}
                icon={Archive}
                className="text-xs font-bold text-emerald-400 border-emerald-500/40"
              >
                Download Cards (ZIP)
              </Button>
            </div>
          </Card>
        </div>

        {/* ================= RIGHT PANEL: CUSTOMIZATIONS & SETTINGS (3 cols) ================= */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-5 border-pitch-border bg-pitch-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pitch-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Poster Customization
              </h3>
              <button
                onClick={handleResetSettings}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Reset to Defaults"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Template Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Poster Template:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'modern',
                    name: 'Modern Club',
                    desc: 'Vibrant club glow, dark stadium background, organized grid',
                  },
                  {
                    id: 'announcement',
                    name: 'League Announcement',
                    desc: 'Broadcast ribbon, metallic borders, official tournament style',
                  },
                  {
                    id: 'minimal',
                    name: 'Minimal Poster',
                    desc: 'High-contrast monochrome, typography focus, geometric lines',
                  },
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, template: tmpl.id as PosterTemplateId }))
                    }
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                      settings.template === tmpl.id
                        ? 'bg-orange-950/60 border-orange-500 text-white shadow-sm'
                        : 'bg-pitch-darker border-pitch-border text-slate-400 hover:text-white'
                    }`}
                  >
                    <p className="font-bold text-white">{tmpl.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tmpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Dimension Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Export Dimensions:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(EXPORT_DIMENSIONS) as ExportDimensionId[]).map((dimKey) => {
                  const d = EXPORT_DIMENSIONS[dimKey];
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSettings((prev) => ({ ...prev, dimension: d.id }))}
                      className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                        settings.dimension === d.id
                          ? 'bg-orange-950/60 border-orange-500 text-white'
                          : 'bg-pitch-darker border-pitch-border text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-white">{d.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {d.width} × {d.height} px
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-orange-400">
                        {d.aspectRatio}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Title & Subtitle */}
            <div className="space-y-3 pt-2 border-t border-pitch-border">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Poster Title:
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Poster Subtitle:
                </label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Visual Toggles */}
            <div className="space-y-2 pt-2 border-t border-pitch-border text-xs">
              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Show Playing Positions</span>
                <input
                  type="checkbox"
                  checked={settings.showPositions}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showPositions: e.target.checked }))
                  }
                  className="rounded text-orange-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Show Jersey Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.showJerseyNumbers}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showJerseyNumbers: e.target.checked }))
                  }
                  className="rounded text-orange-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Show Captain Badges</span>
                <input
                  type="checkbox"
                  checked={settings.showCaptainBadge}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showCaptainBadge: e.target.checked }))
                  }
                  className="rounded text-orange-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                <span>Show Player Age</span>
                <input
                  type="checkbox"
                  checked={settings.showAge}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showAge: e.target.checked }))
                  }
                  className="rounded text-orange-500 focus:ring-0"
                />
              </label>
            </div>
          </Card>
        </div>
      </div>

      {/* ================= OFF-SCREEN RENDER NODES FOR HIGH-RES EXPORT ================= */}
      {/* 1. Full-Resolution Squad Poster for html-to-image PNG export */}
      {posterData && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
          <div ref={fullPosterRef}>
            {settings.template === 'modern' && (
              <ModernPosterTemplate
                data={posterData}
                settings={settings}
                dimension={activeDimension}
              />
            )}
            {settings.template === 'announcement' && (
              <AnnouncementPosterTemplate
                data={posterData}
                settings={settings}
                dimension={activeDimension}
              />
            )}
            {settings.template === 'minimal' && (
              <MinimalPosterTemplate
                data={posterData}
                settings={settings}
                dimension={activeDimension}
              />
            )}
          </div>
        </div>
      )}

      {/* 2. Hidden Player Cards Container for ZIP export */}
      <div
        ref={hiddenCardsContainerRef}
        style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}
      >
        {playerCards.map((card) => (
          <div key={`hidden-${card.id}`}>
            <PlayerCardView
              id={`hidden-card-${card.id}`}
              card={card}
              showJerseyNumber={settings.showJerseyNumbers}
              showPosition={settings.showPositions}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
