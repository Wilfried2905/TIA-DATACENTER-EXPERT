// components/AdminAIAgent/ConversationInterface.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, SendIcon, Copy, RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import adminAgentService from '@/lib/adminAgentService';
import './ConversationInterface.css';

const ConversationInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();
  
  // Initialisation de la conversation
  useEffect(() => {
    initializeConversation();
  }, []);
  
  // Scroll automatique vers le bas quand il y a de nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialiser la conversation avec un message de bienvenue
  const initializeConversation = async () => {
    try {
      setIsProcessing(true);
      
      // Données de contexte MCP (Model Control Protocol)
      const mcpContext = {
        persona: 'admin_assistant',
        domain: 'system_administration',
        temperature: 0.7,
        max_tokens: 1500
      };
      
      console.log("Tentative d'initialisation de la conversation...");
      
      // Appel au backend pour initialiser la conversation
      const response = await adminAgentService.initializeConversation(mcpContext);
      console.log("Réponse initiale reçue:", response);
      
      setSessionId(response.sessionId);
      
      // Message de bienvenue initial
      setMessages([
        {
          role: 'assistant',
          content: response.welcomeMessage || "Bonjour, je suis votre assistant administrateur. Comment puis-je vous aider aujourd'hui ?",
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Suggestions initiales
      setSuggestions(response.suggestions || [
        "Analyser les performances système",
        "Optimiser la configuration",
        "Résoudre les problèmes de nomenclature"
      ]);
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      
      // Message par défaut en cas d'erreur
      setSessionId('local-' + Date.now());
      setMessages([
        {
          role: 'assistant',
          content: "Bonjour, je suis votre assistant IA administrateur. Comment puis-je vous aider aujourd'hui ? (Mode hors-ligne)",
          timestamp: new Date().toISOString()
        }
      ]);
      setSuggestions([
        "Analyser les performances système",
        "Optimiser la configuration",
        "Résoudre les problèmes de nomenclature"
      ]);
      
      // Notification pour l'utilisateur
      toast({
        title: "Mode hors-ligne activé",
        description: "La connexion à l'API d'IA n'a pas pu être établie. L'assistant fonctionne en mode hors-ligne avec des fonctionnalités limitées.",
        variant: "warning",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Envoyer un message à l'assistant
  const sendMessage = async (content = inputText) => {
    if (!content.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    try {
      // Contexte MCP pour la requête
      const mcpContext = {
        persona: 'admin_assistant',
        domain: 'system_administration',
        temperature: 0.7,
        max_tokens: 1500
      };
      
      console.log("Envoi du message à l'API avec sessionId:", sessionId);
      
      // Mode hors-ligne si pas de sessionId valide
      if (!sessionId || sessionId.startsWith('local-')) {
        console.log("Mode hors-ligne activé pour l'envoi de message");
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Réponses pré-définies pour le mode hors-ligne
        let offlineResponse = "Je suis en mode hors-ligne actuellement. Voici une réponse basique à votre demande.";
        let offlineSuggestions = ["Réessayer plus tard", "Vérifier la connexion"];
        
        // Quelques réponses différentes selon le contenu
        if (content.toLowerCase().includes("performance")) {
          offlineResponse = "En mode hors-ligne, je ne peux pas analyser les performances système en temps réel. Veuillez réessayer lorsque la connexion sera rétablie.";
          offlineSuggestions = ["Vérifier les logs manuellement", "Redémarrer le serveur"];
        } else if (content.toLowerCase().includes("config")) {
          offlineResponse = "La configuration du système nécessite un accès à l'API. Je suis actuellement en mode hors-ligne et ne peux pas accéder aux paramètres système.";
          offlineSuggestions = ["Consulter la documentation", "Vérifier les fichiers de configuration"];
        }
        
        const assistantMessage = {
          role: 'assistant',
          content: offlineResponse,
          timestamp: new Date().toISOString(),
          suggestions: offlineSuggestions,
          isOffline: true
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setSuggestions(offlineSuggestions);
        return;
      }
      
      // Envoyer le message via adminAgentService
      const response = await adminAgentService.sendConversationMessage(
        content, 
        sessionId, 
        mcpContext,
        messages.slice(-10) // Envoyer les 10 derniers messages pour le contexte
      );
      
      console.log("Réponse de l'API reçue:", response);
      
      // Ajouter la réponse de l'assistant
      const assistantMessage = {
        role: 'assistant',
        content: response.response || "Je n'ai pas pu générer une réponse appropriée. Veuillez reformuler votre question.",
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions || []
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Mettre à jour les suggestions si disponibles
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: "Je suis désolé, j'ai rencontré une erreur lors du traitement de votre demande. Le service API semble indisponible. J'ai activé le mode hors-ligne avec des fonctionnalités limitées.",
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
      
      // Notifier l'utilisateur
      toast({
        title: "Erreur de communication",
        description: "La connexion avec le service IA a échoué. Mode hors-ligne activé.",
        variant: "destructive",
        duration: 3000,
      });
      
      // Activer le mode hors-ligne
      if (!sessionId || !sessionId.startsWith('local-')) {
        setSessionId('local-' + Date.now());
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Utiliser une suggestion
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };
  
  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Copier le contenu d'un message dans le presse-papier
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copié !",
          description: "Le contenu a été copié dans le presse-papier.",
          duration: 2000,
        });
      },
      (err) => {
        console.error('Erreur lors de la copie:', err);
        toast({
          title: "Erreur",
          description: "Impossible de copier le contenu.",
          variant: "destructive",
        });
      }
    );
  };
  
  // Formatter le texte avec des blocs de code
  const formatMessageContent = (content) => {
    if (!content) return '';
    
    // Diviser par blocs de code (délimités par ```)
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extraire le langage et le code
        const match = part.match(/```([\w-]*)\n([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || part.slice(3, -3);
        
        return (
          <div key={index} className="code-block">
            {language && <div className="code-language">{language}</div>}
            <pre><code>{code}</code></pre>
            <Button 
              className="copy-button" 
              onClick={() => copyToClipboard(code)}
              size="icon"
              variant="ghost"
              title="Copier le code"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        );
      } else {
        // Texte normal - convertir les liens en éléments cliquables
        return <div key={index} className="text-content" dangerouslySetInnerHTML={{ __html: formatLinks(part) }} />;
      }
    });
  };
  
  // Convertir les URLs en liens cliquables
  const formatLinks = (text) => {
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  };
  
  return (
    <div className="conversation-interface">
      <div className="conversation-header">
        <div className="assistant-info">
          <div className="assistant-avatar">
            <Brain className="h-5 w-5" />
          </div>
          <div className="assistant-details">
            <div className="assistant-name">Assistant IA Admin</div>
            <div className="assistant-mode">
              TIA-942 Datacenter Expert
              {sessionId && sessionId.startsWith('local-') && (
                <span className="offline-badge" title="Mode hors-ligne - fonctionnalités limitées">
                  hors-ligne
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="conversation-actions">
          <Button 
            className="action-button"
            onClick={initializeConversation}
            size="icon"
            variant="outline"
            title="Nouvelle conversation"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button 
            className="action-button"
            onClick={() => {
              // Exporter la conversation (implémentation simplifiée)
              const text = messages.map(msg => 
                `${msg.role === 'user' ? 'Vous' : 'Assistant'}: ${msg.content}`
              ).join('\n\n');
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `conversation-${new Date().toISOString().slice(0, 10)}.txt`;
              a.click();
            }}
            size="icon"
            variant="outline"
            title="Exporter la conversation"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role} ${message.isError ? 'error' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="message-avatar">
                <Brain className="h-5 w-5" />
              </div>
            )}
            
            <div className="message-content">
              {formatMessageContent(message.content)}
              
              {/* Afficher les suggestions proposées par l'assistant */}
              {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                <div className="message-suggestions">
                  {message.suggestions.map((suggestion, idx) => (
                    <Button 
                      key={idx}
                      className="suggestion-chip"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Indicateur de traitement */}
        {isProcessing && (
          <div className="message assistant">
            <div className="message-avatar">
              <Brain className="h-5 w-5" />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Élément invisible pour le scroll automatique */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Zone de suggestions */}
      {!isProcessing && suggestions.length > 0 && (
        <div className="suggestions-container">
          <div className="suggestions-label">Suggestions :</div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <Button 
                key={index}
                className="suggestion-button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Zone de saisie */}
      <div className="input-container">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Posez une question à l'Assistant IA..."
          disabled={isProcessing}
          className="message-input"
          rows={1}
        />
        
        <Button 
          onClick={() => sendMessage()}
          disabled={!inputText.trim() || isProcessing}
          size="icon"
          className="send-button"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationInterface;