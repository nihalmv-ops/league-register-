import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PlayersPage } from './pages/PlayersPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { TeamsPage } from './pages/TeamsPage';
import { LiveAuctionPage } from './pages/LiveAuctionPage';
import { ProjectorScreen } from './pages/ProjectorScreen';
import { ManagerBiddingPage } from './pages/ManagerBiddingPage';
import { TeamSquadsPage } from './pages/TeamSquadsPage';
import { PosterGeneratorPage } from './pages/PosterGeneratorPage';
import { FixturesPage } from './pages/FixturesPage';
import { MatchResultsPage } from './pages/MatchResultsPage';
import { PointsTablePage } from './pages/PointsTablePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Fullscreen Dedicated Projector Displays (Standalone Cinema View) */}
        <Route path="/auction/projector" element={<ProjectorScreen />} />
        <Route path="/auction/live/:auctionId" element={<ProjectorScreen />} />

        {/* Dashboard Shell Navigation */}
        <Route path="/" element={<DashboardLayout />}>
          {/* 1. Dashboard Overview */}
          <Route index element={<DashboardPage />} />

          {/* 2. Players */}
          <Route path="players" element={<PlayersPage />} />

          {/* 3. Registrations */}
          <Route path="registrations" element={<RegistrationsPage />} />

          {/* 4. Teams */}
          <Route path="teams" element={<TeamsPage />} />

          {/* 5. Live Auction Admin Deck */}
          <Route path="auction" element={<LiveAuctionPage />} />

          {/* 5b. Manager Live Bidding Portal */}
          <Route path="auction/manager" element={<ManagerBiddingPage />} />

          {/* 6. Team Squads */}
          <Route path="squads" element={<TeamSquadsPage />} />

          {/* 7. Team Poster Generator */}
          <Route path="poster-generator" element={<PosterGeneratorPage />} />

          {/* 8. Fixtures */}
          <Route path="fixtures" element={<FixturesPage />} />

          {/* 9. Match Results */}
          <Route path="results" element={<MatchResultsPage />} />

          {/* 10. Points Table */}
          <Route path="standings" element={<PointsTablePage />} />

          {/* 11. Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
