// components/AdminAIAgent/AdminAgentSidebar.jsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Terminal, AlertCircle, Settings, Activity, Code, MessageSquare } from 'lucide-react';

/**
 * Sidebar pour la navigation dans l'interface d'administration des agents IA
 */
const AdminAgentSidebar = ({ activeView, setActiveView, alerts = [], onToggleMcpPanel }) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Activity className="w-4 h-4" />,
      description: 'Vue d\'ensemble du système'
    },
    {
      id: 'chat',
      label: 'Chat & Discussion',
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Interagir avec l\'agent IA'
    },
    {
      id: 'code-analysis',
      label: 'Analyse de Code',
      icon: <Code className="w-4 h-4" />,
      description: 'Analyser et optimiser le code'
    },
    {
      id: 'insights',
      label: 'Insights & Rapports',
      icon: <Brain className="w-4 h-4" />,
      description: 'Insights système et recommandations'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-4 h-4" />,
      description: 'Configuration des agents IA'
    }
  ];
  
  return (
    <div className="admin-agent-sidebar w-60 min-w-60 bg-muted/50 border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="font-bold">Admin IA</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Moniteur et contrôle des agents IA
        </p>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <div className="p-3">
          <div className="space-y-1">
            {navigationItems.map(item => (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-sm ${activeView === item.id ? 'bg-secondary/80' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                  
                  {item.id === 'alerts' && alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {alerts.length}
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-border mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-between gap-2"
          onClick={onToggleMcpPanel}
        >
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Paramètres MCP
          </span>
          <Badge variant="secondary" className="text-xs">
            Avancé
          </Badge>
        </Button>
        
        <div className="mt-3 text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>État système:</span>
            <span className="flex items-center gap-1 text-green-500">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span> 
              Actif
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Modèle:</span>
            <span>Claude 3.7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAgentSidebar;