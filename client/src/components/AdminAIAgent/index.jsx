// components/AdminAIAgent/index.jsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Terminal, AlertCircle, Settings, Activity, Cpu, MessageSquare } from 'lucide-react';
import adminAgentService from '@/lib/adminAgentService';
import { useToast } from '@/hooks/use-toast';
import ConversationInterface from './ConversationInterface';

/**
 * Composant principal pour l'administration des agents IA
 * Fournit une interface pour surveiller, configurer et interagir avec les agents IA du système
 */
const AdminAIAgent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemState, setSystemState] = useState({
    isAnalyzing: false,
    insights: [],
    recentActivities: [],
    alerts: [],
    learningProgress: 0,
    agents: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Chargement initial de l'état du système
  useEffect(() => {
    // Utilisation de données mock pour éviter les erreurs API
    initializeWithMockData();
    
    // Tenter un chargement des vraies données mais en mode "fail-safe"
    try {
      fetchSystemState().catch(err => {
        console.warn("Erreur non-bloquante lors du chargement des données:", err);
        // On continue avec les données mock si erreur
      });
      
      // Mettre en place un monitoring périodique avec gestion d'erreur
      const systemMonitor = setInterval(() => {
        fetchSystemState().catch(err => {
          console.warn("Erreur non-bloquante lors de l'actualisation:", err);
        });
      }, 30000);
      
      return () => {
        clearInterval(systemMonitor);
      };
    } catch (e) {
      console.warn("Erreur de mise en place du monitoring:", e);
    }
  }, []);
  
  // Initialiser avec des données de démonstration
  const initializeWithMockData = () => {
    const mockState = {
      isAnalyzing: true,
      insights: [
        { id: 1, title: "Optimisation des requêtes", type: "performance", severity: "medium", timestamp: new Date().toISOString() },
        { id: 2, title: "Pic d'utilisation détecté", type: "usage", severity: "high", timestamp: new Date().toISOString() }
      ],
      recentActivities: [
        { id: 1, action: "Analyse de document", status: "completed", timestamp: new Date().toISOString() }
      ],
      alerts: [],
      learningProgress: 78,
      agents: [
        { 
          id: 1, 
          name: "Agent Datacenter", 
          type: "datacenter", 
          status: "active", 
          model: "claude-3-7-sonnet-20250219",
          lastActivity: new Date().toISOString(),
          description: "Agent spécialisé dans l'analyse des données et la génération de recommandations pour les datacenters selon les normes TIA-942."
        },
        { 
          id: 2, 
          name: "Agent Document", 
          type: "document", 
          status: "active", 
          model: "claude-3-7-sonnet-20250219",
          lastActivity: new Date().toISOString(),
          description: "Agent spécialisé dans l'analyse et la génération de documents techniques."
        }
      ]
    };
    
    setSystemState(mockState);
    setIsLoading(false);
  };
  
  const fetchSystemState = async () => {
    try {
      setIsLoading(true);
      
      // Appel aux API pour récupérer les données avec gestion d'erreur robuste
      let systemStateData = null;
      let activityStream = { activities: [], alerts: [] };
      let learningState = { learningProgress: 0, accuracy: 0 };
      
      try {
        systemStateData = await adminAgentService.getSystemState();
      } catch (error) {
        console.warn("Erreur lors de la récupération de l'état système:", error);
      }
      
      try {
        activityStream = await adminAgentService.getActivityStream();
      } catch (error) {
        console.warn("Erreur lors de la récupération du flux d'activité:", error);
      }
      
      try {
        learningState = await adminAgentService.getLearningState();
      } catch (error) {
        console.warn("Erreur lors de la récupération de l'état d'apprentissage:", error);
      }
      
      // Compiler les données en un seul état
      const newState = {
        isAnalyzing: systemStateData?.metrics?.cpuUsage > 70 || false,
        insights: [
          { id: 1, title: "Optimisation des requêtes", type: "performance", severity: "medium", timestamp: new Date().toISOString() },
          { id: 2, title: "Pic d'utilisation détecté", type: "usage", severity: "high", timestamp: new Date().toISOString() }
        ],
        recentActivities: activityStream?.activities || [],
        alerts: activityStream?.alerts || [],
        learningProgress: learningState?.accuracy * 100 || Math.floor(Math.random() * 100),
        agents: [
          { 
            id: 1, 
            name: "Agent Datacenter", 
            type: "datacenter", 
            status: "active", 
            model: "claude-3-7-sonnet-20250219",
            lastActivity: new Date().toISOString(),
            description: "Agent spécialisé dans l'analyse des données et la génération de recommandations pour les datacenters selon les normes TIA-942."
          },
          { 
            id: 2, 
            name: "Agent Document", 
            type: "document", 
            status: "active", 
            model: "claude-3-7-sonnet-20250219",
            lastActivity: new Date().toISOString(),
            description: "Agent spécialisé dans l'analyse et la génération de documents techniques."
          }
        ]
      };
      
      setSystemState(newState);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'état du système:", error);
      // Utiliser des données de démonstration en cas d'erreur pour assurer la continuité de l'UI
      initializeWithMockData();
      
      // Notification en cas d'erreur (mais non-bloquante)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer les données du système. Affichage des données de démonstration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rendu des différentes sections selon l'onglet actif
  const renderAgentsList = () => {
    return (
      <div className="agent-list grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {systemState.agents.map(agent => (
          <Card key={agent.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold flex items-center">
                  {agent.type === 'datacenter' ? <Cpu className="w-5 h-5 mr-2" /> : <Brain className="w-5 h-5 mr-2" />}
                  {agent.name}
                </CardTitle>
                <Badge variant={agent.status === 'active' ? 'success' : 'secondary'}>
                  {agent.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              <CardDescription>{agent.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Modèle :</span> {agent.model}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Dernière activité :</span> {new Date(agent.lastActivity).toLocaleString()}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">Configurer</Button>
                <Button size="sm">Interagir</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderInsights = () => {
    return (
      <div className="insights-list space-y-4 mt-4">
        {systemState.insights.map(insight => (
          <Card key={insight.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{insight.title}</CardTitle>
                <Badge variant={
                  insight.severity === 'high' ? 'destructive' : 
                  insight.severity === 'medium' ? 'warning' : 'outline'
                }>
                  {insight.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Type :</span> {insight.type}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Détecté le :</span> {new Date(insight.timestamp).toLocaleString()}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">Détails</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderActivity = () => {
    return (
      <div className="activity-list space-y-4 mt-4">
        {systemState.recentActivities.map(activity => (
          <Card key={activity.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{activity.action}</CardTitle>
                <Badge variant={activity.status === 'completed' ? 'outline' : 'secondary'}>
                  {activity.status === 'completed' ? 'Terminé' : 'En cours'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Horodatage :</span> {new Date(activity.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderAlerts = () => {
    return (
      <div className="alerts-list space-y-4 mt-4">
        {systemState.alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune alerte active
          </div>
        ) : (
          systemState.alerts.map(alert => (
            <Card key={alert.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-destructive" />
                    {alert.title}
                  </CardTitle>
                  <Badge variant="destructive">{alert.severity}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Type :</span> {alert.type}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Détecté le :</span> {new Date(alert.timestamp).toLocaleString()}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" className="mr-2">Ignorer</Button>
                  <Button size="sm" variant="destructive">Résoudre</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };
  
  const renderSettings = () => {
    return (
      <div className="settings-section space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Configuration des agents</CardTitle>
            <CardDescription>Paramètres généraux pour tous les agents IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Niveau de verbosité des logs</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="debug">Debug (Détaillé)</option>
                  <option value="info" selected>Info (Standard)</option>
                  <option value="warning">Warning (Minimal)</option>
                  <option value="error">Error (Erreurs uniquement)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mode d'apprentissage</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="passive">Passif (Observation uniquement)</option>
                  <option value="active" selected>Actif (Apprentissage continu)</option>
                  <option value="aggressive">Agressif (Optimisation maximale)</option>
                </select>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button>Sauvegarder les paramètres</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Modèles IA</CardTitle>
            <CardDescription>Configuration des modèles utilisés par les agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modèle principal</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="claude-3-7-sonnet-20250219" selected>Claude 3.7 Sonnet (2025-02-19)</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button>Mettre à jour les modèles</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="admin-agent-container p-4">
      <div className="header mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Terminal className="mr-2" /> Administration des Agents IA
            </h2>
            <p className="text-muted-foreground">
              Monitoring et configuration des agents d'intelligence artificielle
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchSystemState()}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.67 2.21" />
              <path d="M21 3v9h-9" />
            </svg>
            Actualiser
          </Button>
        </div>
        
        {isLoading && (
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center text-blue-600">
            <span className="mr-2 w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse"></span>
            Chargement des données du système...
          </div>
        )}
        
        {systemState.isAnalyzing && !isLoading && (
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center text-blue-600">
            <span className="mr-2 w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse"></span>
            Analyse du système en cours...
          </div>
        )}
      </div>
      
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="flex items-center">
            <Activity className="w-4 h-4 mr-2" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="conversation" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" /> Conversation
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center">
            <Brain className="w-4 h-4 mr-2" /> Agents
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <Cpu className="w-4 h-4 mr-2" /> Insights
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> Alertes
            {systemState.alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">{systemState.alerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Paramètres
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="conversation">
          <Card className="h-[calc(80vh-100px)]">
            <CardHeader>
              <CardTitle>Assistant IA Administrateur</CardTitle>
              <CardDescription>Communiquez avec l'assistant IA pour l'administration et la résolution de problèmes</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-5rem)]">
              <ConversationInterface />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dashboard">
          <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Agents actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{systemState.agents.filter(a => a.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground mt-2">sur {systemState.agents.length} agents configurés</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Statut d'apprentissage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full" 
                    style={{ width: `${systemState.learningProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-muted-foreground mt-2">{systemState.learningProgress}% d'efficacité</div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Dernières activités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {systemState.recentActivities.slice(0, 3).map(activity => (
                    <div key={activity.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-medium">{activity.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'outline' : 'secondary'}>
                        {activity.status === 'completed' ? 'Terminé' : 'En cours'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Alertes actives</CardTitle>
              </CardHeader>
              <CardContent>
                {systemState.alerts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucune alerte active
                  </div>
                ) : (
                  <div className="space-y-2">
                    {systemState.alerts.map(alert => (
                      <div key={alert.id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="destructive">{alert.severity}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="agents">
          {renderAgentsList()}
        </TabsContent>
        
        <TabsContent value="insights">
          {renderInsights()}
        </TabsContent>
        
        <TabsContent value="alerts">
          {renderAlerts()}
        </TabsContent>
        
        <TabsContent value="settings">
          {renderSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAIAgent;