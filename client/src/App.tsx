import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Evaluation from "@/pages/Evaluation";
import Questionnaire from "@/pages/Questionnaire";
import Recommendations from "@/pages/Recommendations";
import Documents from "@/pages/Documents";
import Operations from "@/pages/Operations";
import Clients from "@/pages/Clients";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ModularDocumentTest from "@/pages/ModularDocumentTest";
import DocumentGenerationPage from "@/pages/DocumentGenerationPage";
import DocumentWebView from "@/components/DocumentWebView";
import DocumentExplorer from "@/pages/DocumentExplorer";
// import DocumentGenerationTestPage from "@/pages/DocumentGenerationTestPage"; // Commented out, page not used currently
import SubcategoryDetailPage from "@/pages/subcategory/SubcategoryDetailPage";
import ClientInfoPage from "@/pages/subcategory/ClientInfoPage";
import SurveyPage from "@/pages/SurveyPage"; // Nouvelle page avec le layout équilibré
import CasierAdmin from "./pages/admin/CasierAdmin";
import BlueprintManagement from "@/components/blueprint/BlueprintManagement";
import Sidebar from "@/components/layout/Sidebar";
import AssistantIA from "@/pages/AssistantIA";
import AdminAIAgentPage from "@/pages/AdminAIAgentPage";
import MobileMenu from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useEffect } from "react";
import { useAuth, AuthProvider, UserRole } from "@/hooks/use-auth";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { Icons } from "@/lib/icons";
import { GlobalStylesInjector } from "@/components/layout/GlobalLayout";
import RouteGuard from "@/components/guards/RouteGuard";

// Composant pour les routes protégées
function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component {...rest} />;
}

function AuthenticatedLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout, userRole } = useAuth();
  const [appTheme, setAppTheme] = useState("light");

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Détecter le mode sombre
  useEffect(() => {
    // Vérifier si le mode sombre est activé
    const isDarkMode = document.documentElement.classList.contains("dark");
    setAppTheme(isDarkMode ? "dark" : "light");

    // Observer les changements de classe sur html pour détecter les changements de thème
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains("dark");
          setAppTheme(isDark ? "dark" : "light");
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Appliquer les couleurs du thème en fonction du rôle utilisateur
  useEffect(() => {
    if (userRole) {
      // Appliquer les couleurs spécifiques au rôle
      if (userRole === "administrateur") {
        document.documentElement.style.setProperty('--color-primary', '#1A2D5E');
        document.documentElement.style.setProperty('--color-secondary', '#E34A44');
      } else if (userRole === "technicien") {
        document.documentElement.style.setProperty('--color-primary', '#05874B');
        document.documentElement.style.setProperty('--color-secondary', '#FF8500');
      } else {
        document.documentElement.style.setProperty('--color-primary', '#7952B3');
        document.documentElement.style.setProperty('--color-secondary', '#FFC107');
      }
    }
  }, [userRole]);

  // Déterminer les classes de thème en fonction du rôle et du mode sombre
  const themeClass = 
    userRole === "administrateur" ? (appTheme === "dark" ? "admin-theme-dark" : "admin-theme") : 
    userRole === "technicien" ? (appTheme === "dark" ? "tech-theme-dark" : "tech-theme") : 
    (appTheme === "dark" ? "guest-theme-dark" : "guest-theme");
    
  // Définir les couleurs d'en-tête mobile en fonction du rôle
  const headerBgColor = 
    userRole === "administrateur" ? "bg-[#1A2D5E]" : 
    userRole === "technicien" ? "bg-[#05874B]" : 
    "bg-[#7952B3]";

  return (
    <div className={`flex h-screen overflow-hidden bg-background ${themeClass}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile Header & Menu */}
        <div className={`md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 ${headerBgColor} text-white flex items-center justify-between`}>
          <button 
            className="p-2"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center">
            <div className="bg-white text-blue-900 h-8 w-8 rounded-full flex items-center justify-center mr-3 font-semibold text-sm">
              TIA
            </div>
            <span className="text-lg font-medium pr-4">TIA-942 Datacenter Expert</span>
            <ThemeToggle className="mr-2" />
            <button 
              onClick={logout}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {mobileMenuOpen && <MobileMenu onLinkClick={() => setMobileMenuOpen(false)} />}

        {/* Page Content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <Switch>
            <Route path="/">
              <Home />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/operations">
              <Operations />
            </Route>
            <Route path="/operations/:categoryId">
              {(params) => <Operations initialCategory={params.categoryId} />}
            </Route>
            <Route path="/operations/:categoryId/:subcategoryId">
              {(params) => <Operations initialCategory={params.categoryId} initialSubcategory={params.subcategoryId} />}
            </Route>
            <Route path="/evaluations">
              <Evaluation />
            </Route>
            <Route path="/questionnaires">
              <Questionnaire />
            </Route>
            <Route path="/recommendations">
              <Recommendations />
            </Route>
            <Route path="/documents">
              <Documents />
            </Route>
            <Route path="/documents/modular-test">
              <ModularDocumentTest />
            </Route>
            {/* Commented out route for test page that has been removed 
            <Route path="/documents/test-v2">
              <DocumentGenerationTestPage />
            </Route> */}
            <Route path="/audit/:auditId/document-generation">
              <DocumentGenerationPage />
            </Route>
            <Route path="/document-generation">
              <DocumentGenerationPage />
            </Route>
            <Route path="/web-document/:documentId">
              {/* Utiliser l'ancien composant DocumentWebView en attendant de résoudre les problèmes */}
              {(params) => <DocumentWebView documentId={params.documentId} />}
            </Route>
            <Route path="/document-explorer">
              <DocumentExplorer />
            </Route>
            <Route path="/survey-page">
              <SurveyPage />
            </Route>
            <Route path="/assistant-ia">
              <AssistantIA />
            </Route>
            <Route path="/clients">
              <RouteGuard allowedRoles={["administrateur"]}>
                <Clients />
              </RouteGuard>
            </Route>
            {/* Route /admin-ai-agent supprimée car la fonctionnalité est maintenant intégrée dans AssistantIA */}
            <Route path="/subcategory/:categoryId/:subcategoryId">
              <SubcategoryDetailPage />
            </Route>
            <Route path="/client-info/:categoryId/:subcategoryId">
              <ClientInfoPage />
            </Route>
            <Route path="/settings">
              <RouteGuard allowedRoles={["administrateur"]}>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">Paramètres administrateur</h1>
                    <div className="bg-card rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-medium mb-4">Gestion des utilisateurs</h2>
                      <p className="text-gray-600 mb-4">
                        Dans cette section, vous pouvez gérer les utilisateurs et leurs droits d'accès.
                      </p>
                      <div className="flex gap-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                          Créer un nouvel utilisateur
                        </button>
                        <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded">
                          Gérer les droits d'accès
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#202836] rounded-lg shadow-md p-6 mt-6">
                      <h2 className="text-xl font-medium mb-4">Paramètres de l'application</h2>
                      <p className="mb-4">
                        Personnalisez les paramètres généraux de l'application.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Notification par email</span>
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input type="checkbox" id="toggle-email" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                            <label htmlFor="toggle-email" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Mode sombre</span>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </RouteGuard>
            </Route>
            <Route path="/admin/casiers">
              <RouteGuard allowedRoles={["administrateur"]}>
                <CasierAdmin />
              </RouteGuard>
            </Route>
            <Route path="/users">
              <RouteGuard allowedRoles={["administrateur"]}>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <div className="px-4 py-6 sm:px-0">
                    <h1 className="text-2xl font-semibold mb-6">Gestion des utilisateurs</h1>
                    <div className="bg-white dark:bg-[#202836] rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-xl font-medium">Liste des utilisateurs</h2>
                          <p className="text-sm">Gérez les utilisateurs et leurs permissions</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center">
                          <Icons.Plus className="w-4 h-4 mr-2" />
                          Ajouter un utilisateur
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                          <thead>
                            <tr className="w-full h-16 border-b border-gray-200">
                              <th className="text-left pl-4">Nom</th>
                              <th className="text-left">Email</th>
                              <th className="text-left">Rôle</th>
                              <th className="text-left">Statut</th>
                              <th className="text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="h-14 border-b border-gray-100 hover:bg-gray-50">
                              <td className="pl-4">Admin 3R</td>
                              <td>admin@tia942.fr</td>
                              <td>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Administrateur</span>
                              </td>
                              <td>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Actif</span>
                              </td>
                              <td className="flex space-x-2 py-3">
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <Icons.Edit className="w-4 h-4 text-gray-500" />
                                </button>
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <Icons.Trash className="w-4 h-4 text-gray-500" />
                                </button>
                              </td>
                            </tr>
                            <tr className="h-14 border-b border-gray-100 hover:bg-gray-50">
                              <td className="pl-4">Technique 3R</td>
                              <td>tech@tia942.fr</td>
                              <td>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Technicien</span>
                              </td>
                              <td>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Actif</span>
                              </td>
                              <td className="flex space-x-2 py-3">
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <Icons.Edit className="w-4 h-4 text-gray-500" />
                                </button>
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <Icons.Trash className="w-4 h-4 text-gray-500" />
                                </button>
                              </td>
                            </tr>
                            <tr className="h-14 hover:bg-gray-50">
                              <td className="pl-4">Invité 3R</td>
                              <td>invite@tia942.fr</td>
                              <td>
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Invité</span>
                              </td>
                              <td>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Actif</span>
                              </td>
                              <td className="flex space-x-2 py-3">
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <Icons.Edit className="w-4 h-4 text-gray-500" />
                                </button>
                                <button className="p-1 rounded hover:bg-gray-100">
                                  <Icons.Trash className="w-4 h-4 text-gray-500" />
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </RouteGuard>
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  
  // Stocker l'état d'authentification dans le localStorage pour éviter de perdre l'état lors des rafraîchissements
  if (isAuthenticated) {
    localStorage.setItem("isAuthenticated", "true");
  }
  
  // Vérifier s'il y a un état d'authentification enregistré
  const savedAuth = localStorage.getItem("isAuthenticated") === "true";
  
  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated || savedAuth ? <Redirect to="/" /> : <Login />}
      </Route>
      
      <Route path="/*">
        {isAuthenticated || savedAuth ? <AuthenticatedLayout /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
}

// Importer le ClientContextProvider
import { ClientContextProvider } from "./contexts/ClientContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ClientContextProvider>
            <GlobalStylesInjector />
            <Router />
            <Toaster />
          </ClientContextProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
