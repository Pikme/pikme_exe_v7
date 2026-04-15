import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.admin': 'Admin',
    'nav.dashboard': 'Dashboard',
    'nav.attractions': 'Attractions',
    'nav.tours': 'Tours',
    'nav.locations': 'Locations',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.language': 'Language',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to Admin Dashboard',
    'dashboard.stats': 'Statistics',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.overview': 'Overview',
    
    // Attractions
    'attractions.title': 'Attractions',
    'attractions.list': 'Attractions List',
    'attractions.add': 'Add Attraction',
    'attractions.edit': 'Edit Attraction',
    'attractions.delete': 'Delete Attraction',
    'attractions.name': 'Name',
    'attractions.type': 'Type',
    'attractions.location': 'Location',
    'attractions.rating': 'Rating',
    'attractions.featured': 'Featured',
    'attractions.active': 'Active',
    'attractions.description': 'Description',
    'attractions.image': 'Image',
    'attractions.noResults': 'No attractions found',
    
    // Tours
    'tours.title': 'Tours',
    'tours.list': 'Tours List',
    'tours.add': 'Add Tour',
    'tours.edit': 'Edit Tour',
    'tours.delete': 'Delete Tour',
    'tours.name': 'Name',
    'tours.duration': 'Duration',
    'tours.price': 'Price',
    'tours.destination': 'Destination',
    'tours.description': 'Description',
    'tours.noResults': 'No tours found',
    
    // Locations
    'locations.title': 'Locations',
    'locations.list': 'Locations List',
    'locations.add': 'Add Location',
    'locations.edit': 'Edit Location',
    'locations.delete': 'Delete Location',
    'locations.name': 'Name',
    'locations.country': 'Country',
    'locations.state': 'State',
    'locations.description': 'Description',
    'locations.noResults': 'No locations found',
    
    // Analytics
    'analytics.title': 'Analytics',
    'analytics.views': 'Views',
    'analytics.clicks': 'Clicks',
    'analytics.conversions': 'Conversions',
    'analytics.topAttractions': 'Top Attractions',
    'analytics.topTours': 'Top Tours',
    'analytics.trends': 'Trends',
    'analytics.period': 'Period',
    'analytics.lastMonth': 'Last Month',
    'analytics.lastQuarter': 'Last Quarter',
    'analytics.lastYear': 'Last Year',
    
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General Settings',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.security': 'Security',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    
    // Messages
    'message.deleteConfirm': 'Are you sure you want to delete this item?',
    'message.saveSuccess': 'Item saved successfully',
    'message.deleteSuccess': 'Item deleted successfully',
    'message.error': 'An error occurred',
    'message.loading': 'Please wait...',
    'message.noData': 'No data available',
    
    // Public Navigation
    'nav.destinations': 'Destinations',
    'nav.states': 'States',
    'nav.categories': 'Categories',
    'nav.login': 'Login',
    
    // Home Page
    'home.title': 'Discover Amazing Tours & Experiences',
    'home.subtitle': 'Explore the best tours, activities, and destinations across India and Southeast Asia',
    'home.browseTours': 'Browse Tours',
    'home.exploreDestinations': 'Explore Destinations',
    'home.searchPlaceholder': 'Search tours, destinations, activities...',
    'home.searchButton': 'Search',
    'home.whyChoose': 'Why Choose Pikme.org',
    'home.whySubtitle': 'VIP Customised Domestic, International & Spiritual Tours from India',
    'home.whyDescription': 'Hotels | Airlines | Domestic & International Tours',
    'home.globalDestinations': 'Global Destinations',
    'home.globalDestinationsDesc': 'Explore destinations across all continents',
    'home.expertGuides': 'Expert Guides',
    'home.expertGuidesDesc': 'Travel with experienced local guides',
    'home.hotelStays': '3 Star to 5 Star Hotels',
    'home.hotelStaysDesc': 'Comfortable, clean & centrally located stays',
    'home.bestPrices': 'Best Prices',
    'home.bestPricesDesc': 'Get the best deals on travel packages',
    'home.featuredTours': 'Featured Tours',
    'home.viewDetails': 'View Details',
    'home.testimonials': 'What Our Customers Say',
    'home.testimonialSubtitle': 'Join thousands of happy travelers who have experienced amazing journeys with Pikme',
    'home.stats.tours': 'Tours Available',
    'home.stats.destinations': 'Destinations',
    'home.stats.activities': 'Activities',
    'home.stats.travelers': 'Happy Travelers',
    
    // Footer
    'footer.brand': 'Pikme',
    'footer.description': 'Discover handpicked travel experiences across the world',
    'footer.quickLinks': 'Quick Links',
    'footer.company': 'Company',
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.allRights': 'All rights reserved.',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
  },
  es: {
    // Navigation
    'nav.admin': 'Administración',
    'nav.dashboard': 'Panel de Control',
    'nav.attractions': 'Atracciones',
    'nav.tours': 'Tours',
    'nav.locations': 'Ubicaciones',
    'nav.analytics': 'Analítica',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar Sesión',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Añadir',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    'common.confirm': 'Confirmar',
    'common.language': 'Idioma',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.welcome': 'Bienvenido al Panel de Control',
    'dashboard.stats': 'Estadísticas',
    'dashboard.recentActivity': 'Actividad Reciente',
    'dashboard.overview': 'Descripción General',
    
    // Attractions
    'attractions.title': 'Atracciones',
    'attractions.list': 'Lista de Atracciones',
    'attractions.add': 'Añadir Atracción',
    'attractions.edit': 'Editar Atracción',
    'attractions.delete': 'Eliminar Atracción',
    'attractions.name': 'Nombre',
    'attractions.type': 'Tipo',
    'attractions.location': 'Ubicación',
    'attractions.rating': 'Calificación',
    'attractions.featured': 'Destacado',
    'attractions.active': 'Activo',
    'attractions.description': 'Descripción',
    'attractions.image': 'Imagen',
    'attractions.noResults': 'No se encontraron atracciones',
    
    // Tours
    'tours.title': 'Tours',
    'tours.list': 'Lista de Tours',
    'tours.add': 'Añadir Tour',
    'tours.edit': 'Editar Tour',
    'tours.delete': 'Eliminar Tour',
    'tours.name': 'Nombre',
    'tours.duration': 'Duración',
    'tours.price': 'Precio',
    'tours.destination': 'Destino',
    'tours.description': 'Descripción',
    'tours.noResults': 'No se encontraron tours',
    
    // Locations
    'locations.title': 'Ubicaciones',
    'locations.list': 'Lista de Ubicaciones',
    'locations.add': 'Añadir Ubicación',
    'locations.edit': 'Editar Ubicación',
    'locations.delete': 'Eliminar Ubicación',
    'locations.name': 'Nombre',
    'locations.country': 'País',
    'locations.state': 'Estado',
    'locations.description': 'Descripción',
    'locations.noResults': 'No se encontraron ubicaciones',
    
    // Analytics
    'analytics.title': 'Analítica',
    'analytics.views': 'Vistas',
    'analytics.clicks': 'Clics',
    'analytics.conversions': 'Conversiones',
    'analytics.topAttractions': 'Atracciones Principales',
    'analytics.topTours': 'Tours Principales',
    'analytics.trends': 'Tendencias',
    'analytics.period': 'Período',
    'analytics.lastMonth': 'Último Mes',
    'analytics.lastQuarter': 'Último Trimestre',
    'analytics.lastYear': 'Último Año',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.general': 'Configuración General',
    'settings.appearance': 'Apariencia',
    'settings.notifications': 'Notificaciones',
    'settings.security': 'Seguridad',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.darkMode': 'Modo Oscuro',
    'settings.lightMode': 'Modo Claro',
    
    // Messages
    'message.deleteConfirm': '¿Está seguro de que desea eliminar este elemento?',
    'message.saveSuccess': 'Elemento guardado correctamente',
    'message.deleteSuccess': 'Elemento eliminado correctamente',
    'message.error': 'Ocurrió un error',
    'message.loading': 'Por favor espere...',
    'message.noData': 'No hay datos disponibles',
    
    // Public Navigation
    'nav.destinations': 'Destinos',
    'nav.states': 'Estados',
    'nav.categories': 'Categorias',
    'nav.login': 'Iniciar Sesion',
    
    // Home Page
    'home.title': 'Descubre Tours y Experiencias Increíbles',
    'home.subtitle': 'Explora los mejores tours, actividades y destinos en India y el Sudeste Asiático',
    'home.browseTours': 'Explorar Tours',
    'home.exploreDestinations': 'Explorar Destinos',
    'home.searchPlaceholder': 'Buscar tours, destinos, actividades...',
    'home.searchButton': 'Buscar',
    'home.whyChoose': 'Por Qué Elegir Pikme.org',
    'home.whySubtitle': 'Tours Personalizados Nacionales, Internacionales y Espirituales desde India',
    'home.whyDescription': 'Hoteles | Aerolíneas | Tours Nacionales e Internacionales',
    'home.globalDestinations': 'Destinos Globales',
    'home.globalDestinationsDesc': 'Explora destinos en todos los continentes',
    'home.expertGuides': 'Guías Expertos',
    'home.expertGuidesDesc': 'Viaja con guías locales experimentados',
    'home.hotelStays': 'Hoteles de 3 a 5 Estrellas',
    'home.hotelStaysDesc': 'Estadías cómodas, limpias y ubicadas centralmente',
    'home.bestPrices': 'Mejores Precios',
    'home.bestPricesDesc': 'Obtén las mejores ofertas en paquetes de viaje',
    'home.featuredTours': 'Tours Destacados',
    'home.viewDetails': 'Ver Detalles',
    'home.testimonials': 'Lo Que Dicen Nuestros Clientes',
    'home.testimonialSubtitle': 'Únete a miles de viajeros felices que han experimentado viajes increíbles con Pikme',
    'home.stats.tours': 'Tours Disponibles',
    'home.stats.destinations': 'Destinos',
    'home.stats.activities': 'Actividades',
    'home.stats.travelers': 'Viajeros Felices',
    
    // Footer
    'footer.brand': 'Pikme',
    'footer.description': 'Descubre experiencias de viaje seleccionadas en todo el mundo',
    'footer.quickLinks': 'Enlaces Rapidos',
    'footer.company': 'Empresa',
    'footer.about': 'Acerca de Nosotros',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Politica de Privacidad',
    'footer.allRights': 'Todos los derechos reservados.',
    'footer.terms': 'Terminos de Servicio',
    'footer.cookies': 'Politica de Cookies',
  },
  fr: {
    // Navigation
    'nav.admin': 'Administration',
    'nav.dashboard': 'Tableau de Bord',
    'nav.attractions': 'Attractions',
    'nav.tours': 'Tours',
    'nav.locations': 'Lieux',
    'nav.analytics': 'Analytique',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.close': 'Fermer',
    'common.confirm': 'Confirmer',
    'common.language': 'Langue',
    
    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.welcome': 'Bienvenue au Tableau de Bord',
    'dashboard.stats': 'Statistiques',
    'dashboard.recentActivity': 'Activité Récente',
    'dashboard.overview': 'Aperçu',
    
    // Attractions
    'attractions.title': 'Attractions',
    'attractions.list': 'Liste des Attractions',
    'attractions.add': 'Ajouter une Attraction',
    'attractions.edit': 'Modifier l\'Attraction',
    'attractions.delete': 'Supprimer l\'Attraction',
    'attractions.name': 'Nom',
    'attractions.type': 'Type',
    'attractions.location': 'Lieu',
    'attractions.rating': 'Évaluation',
    'attractions.featured': 'En Vedette',
    'attractions.active': 'Actif',
    'attractions.description': 'Description',
    'attractions.image': 'Image',
    'attractions.noResults': 'Aucune attraction trouvée',
    
    // Tours
    'tours.title': 'Tours',
    'tours.list': 'Liste des Tours',
    'tours.add': 'Ajouter un Tour',
    'tours.edit': 'Modifier le Tour',
    'tours.delete': 'Supprimer le Tour',
    'tours.name': 'Nom',
    'tours.duration': 'Durée',
    'tours.price': 'Prix',
    'tours.destination': 'Destination',
    'tours.description': 'Description',
    'tours.noResults': 'Aucun tour trouvé',
    
    // Locations
    'locations.title': 'Lieux',
    'locations.list': 'Liste des Lieux',
    'locations.add': 'Ajouter un Lieu',
    'locations.edit': 'Modifier le Lieu',
    'locations.delete': 'Supprimer le Lieu',
    'locations.name': 'Nom',
    'locations.country': 'Pays',
    'locations.state': 'État',
    'locations.description': 'Description',
    'locations.noResults': 'Aucun lieu trouvé',
    
    // Analytics
    'analytics.title': 'Analytique',
    'analytics.views': 'Vues',
    'analytics.clicks': 'Clics',
    'analytics.conversions': 'Conversions',
    'analytics.topAttractions': 'Attractions Principales',
    'analytics.topTours': 'Tours Principaux',
    'analytics.trends': 'Tendances',
    'analytics.period': 'Période',
    'analytics.lastMonth': 'Dernier Mois',
    'analytics.lastQuarter': 'Dernier Trimestre',
    'analytics.lastYear': 'Dernière Année',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.general': 'Paramètres Généraux',
    'settings.appearance': 'Apparence',
    'settings.notifications': 'Notifications',
    'settings.security': 'Sécurité',
    'settings.language': 'Langue',
    'settings.theme': 'Thème',
    'settings.darkMode': 'Mode Sombre',
    'settings.lightMode': 'Mode Clair',
    
    // Messages
    'message.deleteConfirm': 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    'message.saveSuccess': 'Élément enregistré avec succès',
    'message.deleteSuccess': 'Élément supprimé avec succès',
    'message.error': 'Une erreur s\'est produite',
    'message.loading': 'Veuillez patienter...',
    'message.noData': 'Aucune donnée disponible',
    
    // Public Navigation
    'nav.destinations': 'Destinations',
    'nav.states': 'Etats',
    'nav.categories': 'Categories',
    'nav.login': 'Connexion',
    
    // Home Page
    'home.title': 'Découvrez des Tours et Expériences Incroyables',
    'home.subtitle': 'Explorez les meilleurs tours, activités et destinations en Inde et en Asie du Sud-Est',
    'home.browseTours': 'Parcourir les Tours',
    'home.exploreDestinations': 'Explorer les Destinations',
    'home.searchPlaceholder': 'Rechercher des tours, destinations, activités...',
    'home.searchButton': 'Rechercher',
    'home.whyChoose': 'Pourquoi Choisir Pikme.org',
    'home.whySubtitle': 'Tours Personnalisés Nationaux, Internationaux et Spirituels depuis l\'Inde',
    'home.whyDescription': 'Hôtels | Compagnies Aériennes | Tours Nationaux et Internationaux',
    'home.globalDestinations': 'Destinations Mondiales',
    'home.globalDestinationsDesc': 'Explorez des destinations sur tous les continents',
    'home.expertGuides': 'Guides Experts',
    'home.expertGuidesDesc': 'Voyagez avec des guides locaux expérimentés',
    'home.hotelStays': 'Hôtels 3 à 5 Étoiles',
    'home.hotelStaysDesc': 'Séjours confortables, propres et situés au centre-ville',
    'home.bestPrices': 'Meilleurs Prix',
    'home.bestPricesDesc': 'Obtenez les meilleures offres sur les forfaits de voyage',
    'home.featuredTours': 'Tours Vedettes',
    'home.viewDetails': 'Voir les Détails',
    'home.testimonials': 'Ce que Disent Nos Clients',
    'home.testimonialSubtitle': 'Rejoignez des milliers de voyageurs heureux qui ont vécu des voyages incroyables avec Pikme',
    'home.stats.tours': 'Tours Disponibles',
    'home.stats.destinations': 'Destinations',
    'home.stats.activities': 'Activités',
    'home.stats.travelers': 'Voyageurs Heureux',
    
    // Footer
    'footer.brand': 'Pikme',
    'footer.description': 'Découvrez des expériences de voyage triées sur le volet dans le monde entier',
    'footer.quickLinks': 'Liens Rapides',
    'footer.company': 'Entreprise',
    'footer.about': 'À Propos',
    'footer.contact': 'Contact',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.allRights': 'Tous les droits réservés.',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.cookies': 'Politique de Cookies',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get language from localStorage
    const saved = localStorage.getItem('language');
    if (saved && ['en', 'es', 'fr'].includes(saved)) {
      return saved as Language;
    }
    // Default to English
    return 'en';
  });

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
