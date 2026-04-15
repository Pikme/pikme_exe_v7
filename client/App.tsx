import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ToursList from "./pages/ToursList";
import TourDetail from "./pages/TourDetail";
import CountriesList from "./pages/CountriesList";
import LocationsList from "./pages/LocationsList";
import LocationDetail from "./pages/LocationDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminImport from "./pages/AdminImport";
import AdminToursManagement from "./pages/AdminToursManagement";
import AdminLocationsManagement from "./pages/AdminLocationsManagement";
import AdminActivitiesManagement from "./pages/AdminActivitiesManagement";
import AdminSEOSettings from "./pages/AdminSEOSettings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminCountriesManagement from "./pages/AdminCountriesManagement";
import AdminStatesManagement from "./pages/AdminStatesManagement";
import AdminCitiesManagement from "./pages/AdminCitiesManagement";
import AdminCategoriesManagement from "./pages/AdminCategoriesManagement";
import AdminAttractionsManagement from "./pages/AdminAttractionsManagement";
import AdminAuditLog from "./pages/AdminAuditLog";
import { SchedulerLogsViewer } from "./pages/admin/SchedulerLogsViewer";
import { AdminLocalizationManager } from "./pages/AdminLocalizationManager";
import { AdminRollbackHistory } from "./pages/AdminRollbackHistory";
import AdminTranslationManager from "./pages/AdminTranslationManager";
import AdminBookingManagement from "./pages/AdminBookingManagement";
import AdminRoutingConfig from "./pages/admin/AdminRoutingConfig";
import { ScheduledExportsPage } from "./pages/ScheduledExportsPage";
import { AdminAutoTagging } from "./pages/AdminAutoTagging";
import { AdminTagPerformance } from "./pages/AdminTagPerformance";
import AdminFeatureFlagsDashboard from "./pages/AdminFeatureFlagsDashboard";
import AdminHomePageSettings from "./pages/AdminHomePageSettings";
import ActivityDetail from "./pages/ActivityDetail";
import ActivityHub from "./pages/ActivityHub";

import StatesList from "./pages/StatesList";
import StateDetail from "./pages/StateDetail";
import CategoriesList from "./pages/CategoriesList";
import CategoryDetail from "./pages/CategoryDetail";
import CitiesListSEO from "./pages/CitiesListSEO";
import CityDetailSEO from "./pages/CityDetailSEO";
import { ToursPage } from "./pages/ToursPage";
import { DestinationCountry } from "./pages/DestinationCountry";
import { DestinationState } from "./pages/DestinationState";
import { DestinationCity } from "./pages/DestinationCity";
import ActivitiesList from "./pages/ActivitiesList";
import SearchResults from "./pages/SearchResults";
import { SEOEnhancementGuide } from "./pages/SEOEnhancementGuide";
import { ChiangMai } from "./pages/ChiangMai";
import { CitiesListing } from "./pages/CitiesListing";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import CancellationPolicy from "./pages/CancellationPolicy";
import AdditionalInfo from "./pages/AdditionalInfo";
import { useAuth } from "@/_core/hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WhatsAppButton } from "./components/WhatsAppButton";

function Router() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchResults} />
      <Route path="/tours" component={ToursPage} />
      <Route path="/tours/list" component={ToursList} />
      <Route path="/visit/tour/:slug" component={TourDetail} />
      <Route path="/tour/:slug" component={TourDetail} />
      <Route path="/activities" component={ActivitiesList} />
      <Route path="/activities/:slug" component={ActivityHub} />
      <Route path="/countries" component={CountriesList} />
      <Route path="/states" component={StatesList} />
      <Route path="/states/:slug" component={StateDetail} />
      <Route path="/states/:stateSlug/cities" component={CitiesListSEO} />
      <Route path="/states/:stateSlug/cities/:citySlug" component={CityDetailSEO} />
      <Route path="/categories" component={CategoriesList} />
      <Route path="/categories/:slug" component={CategoryDetail} />
      {/* More specific patterns first */}
      <Route path="/visit/:countryWithSuffix" component={DestinationCountry} />
      <Route path="/destinations/:country/:state/:city" component={DestinationCity} />
      <Route path="/destinations/:country/:state" component={DestinationState} />
      <Route path="/destinations/:country" component={DestinationCountry} />
      {/* Generic patterns last */}
      <Route path="/visit/:countrySlug/:locationSlug" component={LocationDetail} />
      <Route path="/visit/:countrySlug" component={LocationsList} />
      <Route path="/activity/:id" component={ActivityDetail} />
      <Route path="/activity/:slug" component={ActivityDetail} />
      <Route path="/seo-enhancement-guide" component={SEOEnhancementGuide} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-and-conditions" component={TermsAndConditions} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/cancellation-policy" component={CancellationPolicy} />
      <Route path="/additional-info" component={AdditionalInfo} />
      <Route path="/cities" component={CitiesListing} />
      <Route path="/cities/chiang-mai" component={ChiangMai} />
      
      {/* Admin routes */}
      {isAdmin && (
        <>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/import" component={AdminImport} />
          <Route path="/admin/tours" component={AdminToursManagement} />
          <Route path="/admin/locations" component={AdminLocationsManagement} />
          <Route path="/admin/activities" component={AdminActivitiesManagement} />
          <Route path="/admin/seo" component={AdminSEOSettings} />
          <Route path="/admin/countries" component={AdminCountriesManagement} />
          <Route path="/admin/states" component={AdminStatesManagement} />
          <Route path="/admin/cities" component={AdminCitiesManagement} />
          <Route path="/admin/categories" component={AdminCategoriesManagement} />
          <Route path="/admin/attractions" component={AdminAttractionsManagement} />
          <Route path="/admin/localization" component={AdminLocalizationManager} />
          <Route path="/admin/seo" component={AdminSEOSettings} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route path="/admin/rollback-history" component={AdminRollbackHistory} />
          <Route path="/admin/translations" component={AdminTranslationManager} />
          <Route path="/admin/bookings" component={AdminBookingManagement} />
          <Route path="/admin/routing" component={AdminRoutingConfig} />
          <Route path="/admin/scheduled-exports" component={ScheduledExportsPage} />
          <Route path="/admin/auto-tagging" component={AdminAutoTagging} />
          <Route path="/admin/tag-performance" component={AdminTagPerformance} />
          <Route path="/admin/feature-flags" component={AdminFeatureFlagsDashboard} />
          <Route path="/admin/home-page-settings" component={AdminHomePageSettings} />

          <Route path="/admin/audit-log" component={AdminAuditLog} />
          <Route path="/admin/scheduler-logs" component={SchedulerLogsViewer} />
        </>
      )}
      
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
            <WhatsAppButton phoneNumber="+917259696555" message="Hi! I am interested in your tour packages. Can you provide more information?" />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
