// components/AdminAIAgent/MCPController.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// Contexte MCP
const MCPContext = createContext(null);

/**
 * Hook pour accéder facilement au contexte MCP
 */
export function useMCP() {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error('useMCP doit être utilisé dans un MCPProvider');
  }
  return context;
}

/**
 * Fournisseur du contexte MCP
 * Gère l'état des paramètres MCP pour le protocole de contexte modèle
 */
export function MCPProvider({ children }) {
  // État par défaut du MCP
  const [mcpState, setMcpState] = useState({
    // Paramètres de base du MCP
    persona: 'expert',      // Type de personnalité (expert, coach, collaborator, auditor, consultant)
    mode: 'analytical',     // Mode d'interaction (analytical, concise, creative, methodical, critical)
    domain: 'general',      // Domaine de spécialisation (general, security, performance, compliance, etc.)
    verbosity: 'standard',  // Niveau de détail (minimal, standard, detailed, comprehensive)
    technical_level: 2,     // Niveau technique (1-4, 1=basique, 4=expert)
    
    // Contexte additionnel pour la session
    session_context: {
      previousExchanges: [],          // Échanges précédents pertinents
      userPreferences: {              // Préférences spécifiques à l'utilisateur
        preferredLanguage: 'French',
        responseFormat: 'structured'
      },
      // Préférences spécifiques pour l'analyse de code
      codeAnalysisPreferences: {
        checkSecurity: true,
        focusOnPerformance: true,
        styleSuggestions: true,
        commentLevel: 'medium'
      }
    },
    
    // Métadonnées de la session
    sessionId: `mcp_${Date.now()}`,
    lastUpdated: new Date().toISOString()
  });
  
  // Effet pour synchroniser le MCP avec le stockage local
  useEffect(() => {
    const savedMcp = localStorage.getItem('mcp_settings');
    if (savedMcp) {
      try {
        const parsedMcp = JSON.parse(savedMcp);
        setMcpState(prev => ({ ...prev, ...parsedMcp }));
      } catch (e) {
        console.error('Erreur lors du chargement des paramètres MCP:', e);
      }
    }
  }, []);
  
  // Fonction pour mettre à jour les paramètres MCP
  const updateMCP = (updates) => {
    setMcpState(prev => {
      const updated = { ...prev, ...updates, lastUpdated: new Date().toISOString() };
      
      // Sauvegarder dans le stockage local
      try {
        localStorage.setItem('mcp_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des paramètres MCP:', e);
      }
      
      return updated;
    });
  };
  
  // Fonction pour mettre à jour le contexte de session
  const updateSessionContext = (contextUpdates) => {
    setMcpState(prev => {
      const updated = {
        ...prev,
        session_context: {
          ...prev.session_context,
          ...contextUpdates
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Sauvegarder dans le stockage local
      try {
        localStorage.setItem('mcp_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde du contexte de session MCP:', e);
      }
      
      return updated;
    });
  };
  
  // Fonction pour ajouter un échange à l'historique
  const addExchange = (exchange) => {
    setMcpState(prev => {
      const previousExchanges = [...prev.session_context.previousExchanges, exchange];
      // Limiter à 10 échanges maximum
      if (previousExchanges.length > 10) {
        previousExchanges.shift();
      }
      
      const updated = {
        ...prev,
        session_context: {
          ...prev.session_context,
          previousExchanges
        },
        lastUpdated: new Date().toISOString()
      };
      
      // Sauvegarder dans le stockage local
      try {
        localStorage.setItem('mcp_settings', JSON.stringify(updated));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des échanges MCP:', e);
      }
      
      return updated;
    });
  };
  
  // Fonction pour réinitialiser les paramètres MCP
  const resetMCP = () => {
    const defaultMCP = {
      persona: 'expert',
      mode: 'analytical',
      domain: 'general',
      verbosity: 'standard',
      technical_level: 2,
      session_context: {
        previousExchanges: [],
        userPreferences: {
          preferredLanguage: 'French',
          responseFormat: 'structured'
        },
        codeAnalysisPreferences: {
          checkSecurity: true,
          focusOnPerformance: true,
          styleSuggestions: true,
          commentLevel: 'medium'
        }
      },
      sessionId: `mcp_${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };
    
    setMcpState(defaultMCP);
    
    // Effacer du stockage local
    try {
      localStorage.removeItem('mcp_settings');
    } catch (e) {
      console.error('Erreur lors de la réinitialisation des paramètres MCP:', e);
    }
  };
  
  return (
    <MCPContext.Provider value={{ 
      mcpState, 
      updateMCP, 
      updateSessionContext, 
      addExchange, 
      resetMCP 
    }}>
      {children}
    </MCPContext.Provider>
  );
}