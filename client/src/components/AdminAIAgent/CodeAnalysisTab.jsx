// components/AdminAIAgent/CodeAnalysisTab.jsx

import React, { useState, useRef } from 'react';
import { useMCP } from './MCPController';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, FileCode, FilePlus, CheckCircle, AlertTriangle, Info, Code } from 'lucide-react';
import './CodeAnalysisTab.css';

/**
 * Composant d'analyse de code avec support MCP
 * Permet d'analyser et d'optimiser le code avec différentes configurations de contexte
 */
const CodeAnalysisTab = () => {
  const { mcpState } = useMCP();
  const [codeInput, setCodeInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('javascript');
  const [optimizationTarget, setOptimizationTarget] = useState('performance');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeTab, setActiveTab] = useState('input');
  
  // Référence pour le code amélioré
  const improvedCodeRef = useRef(null);
  
  // Options pour les types de fichiers
  const fileTypeOptions = [
    { value: 'javascript', label: 'JavaScript (.js)' },
    { value: 'typescript', label: 'TypeScript (.ts)' },
    { value: 'jsx', label: 'React JSX (.jsx)' },
    { value: 'tsx', label: 'React TSX (.tsx)' },
    { value: 'python', label: 'Python (.py)' },
    { value: 'css', label: 'CSS (.css)' },
    { value: 'html', label: 'HTML (.html)' }
  ];
  
  // Options pour les cibles d'optimisation
  const optimizationOptions = [
    { value: 'performance', label: 'Performance' },
    { value: 'readability', label: 'Lisibilité' },
    { value: 'security', label: 'Sécurité' },
    { value: 'compatibility', label: 'Compatibilité' }
  ];
  
  // Exécuter l'analyse
  const handleAnalyze = async () => {
    if (!codeInput.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSelectedIssue(null);
    
    try {
      // En production, ceci serait un appel API réel
      // Pour la démonstration, simuler un appel API
      
      // Créer le contexte MCP pour l'analyse de code
      const codeAnalysisContext = {
        ...mcpState,
        // Enrichir avec des informations spécifiques au contexte
        session_context: {
          ...mcpState.session_context,
          currentFile: fileName,
          fileType: fileType
        }
      };
      
      // Simuler un délai d'analyse
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler un résultat d'analyse
      // Dans un environnement réel, ceci viendrait de l'API
      const simulatedResult = {
        success: true,
        language: fileType,
        complexity: 75,
        issues: [
          {
            id: 1,
            line: 12,
            column: 5,
            severity: 'error',
            title: 'Variable non utilisée',
            description: 'La variable "result" est déclarée mais n\'est jamais utilisée',
            solution: 'Supprimer la déclaration ou utiliser la variable.'
          },
          {
            id: 2,
            line: 25,
            column: 10,
            severity: 'warning',
            title: 'Promesse non gérée',
            description: 'La promesse retournée par fetch() n\'est pas gérée',
            solution: 'Ajouter un gestionnaire catch() pour gérer les erreurs potentielles.'
          },
          {
            id: 3,
            line: 18,
            column: 3,
            severity: 'info',
            title: 'Console statement',
            description: 'L\'utilisation de console.log() en production n\'est pas recommandée',
            solution: 'Remplacer par un système de logging approprié.'
          }
        ],
        improvementScore: 68,
        improvedCode: codeInput.replace('console.log', '// console.log'),
        personalizedInsights: [
          {
            title: "Optimisation des performances",
            description: "Plusieurs opportunités d'amélioration des performances identifiées, notamment dans la gestion des promesses et l'utilisation de variables temporaires.",
            importance: 4
          },
          {
            title: "Structure du code",
            description: "La structure du code pourrait être améliorée pour une meilleure maintenabilité. Considérez l'utilisation de fonctions plus petites et spécialisées.",
            importance: 3
          }
        ],
        mcpAdjustments: {
          toolsUsed: ['eslint', 'complexity-analysis'],
          complexityThreshold: 70,
          securityScanEnabled: optimizationTarget === 'security' || mcpState.domain === 'security'
        }
      };
      
      setAnalysisResult(simulatedResult);
      setActiveTab('results');
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      // Gérer l'erreur avec une UI appropriée
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Gestionnaire de changement de code
  const handleCodeChange = (e) => {
    setCodeInput(e.target.value);
  };
  
  // Sélectionner un problème pour l'afficher en détail
  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
  };
  
  // Copier le code amélioré dans le presse-papiers
  const handleCopyImprovedCode = () => {
    if (analysisResult?.improvedCode) {
      navigator.clipboard.writeText(analysisResult.improvedCode)
        .then(() => {
          // Afficher une notification de succès
          alert("Code amélioré copié dans le presse-papiers");
        })
        .catch(err => {
          console.error("Erreur lors de la copie dans le presse-papiers:", err);
        });
    }
  };
  
  // Fonction pour obtenir la couleur de sévérité
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'secondary';
    }
  };
  
  // Fonction pour obtenir l'icône de sévérité
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };
  
  // Rendu des insights personnalisés basés sur MCP
  const renderPersonalizedInsights = () => {
    if (!analysisResult?.personalizedInsights?.length) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Insights Personnalisés</h3>
        <div className="space-y-3">
          {analysisResult.personalizedInsights.map((insight, index) => (
            <Card key={index}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                  <Badge variant={insight.importance > 3 ? 'default' : 'secondary'}>
                    Importance: {insight.importance}/5
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="py-2 text-sm">
                {insight.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="code-analysis-container h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="border-b px-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="input" className="flex items-center">
              <FileCode className="w-4 h-4 mr-2" /> Entrée du code
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center" disabled={!analysisResult}>
              <Code className="w-4 h-4 mr-2" /> Résultats d'analyse
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="input" className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-4">Analyser du code</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du fichier (optionnel)
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="example.js"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de fichier
                  </label>
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un type de fichier" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cible d'optimisation
                </label>
                <Select value={optimizationTarget} onValueChange={setOptimizationTarget}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir une cible d'optimisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {optimizationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code à analyser
                </label>
                <Textarea
                  value={codeInput}
                  onChange={handleCodeChange}
                  placeholder="Collez votre code ici..."
                  className="font-mono"
                  rows={15}
                />
              </div>
              
              <div className="text-right">
                <Button
                  onClick={handleAnalyze}
                  disabled={!codeInput.trim() || isAnalyzing}
                  className="flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4 mr-2" />
                      Analyser le code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results" className="flex-1 overflow-y-auto p-4">
          {analysisResult ? (
            <div className="max-w-4xl mx-auto">
              <div className="analysis-summary mb-6">
                <h3 className="text-lg font-semibold mb-2">Résumé de l'analyse</h3>
                <div className="metrics">
                  <div className="metric">
                    <span className="metric-label">Score d'amélioration</span>
                    <span className="metric-value">{analysisResult.improvementScore}/100</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Complexité</span>
                    <span className="metric-value">{analysisResult.complexity}/100</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Problèmes détectés</span>
                    <span className="metric-value">{analysisResult.issues.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Problèmes détectés</h3>
                  <Card>
                    <CardContent className="p-0">
                      <div className="issues-list max-h-80 overflow-y-auto">
                        {analysisResult.issues.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            <CheckCircle className="w-5 h-5 mx-auto mb-2 text-green-500" />
                            Aucun problème détecté
                          </div>
                        ) : (
                          analysisResult.issues.map(issue => (
                            <div
                              key={issue.id}
                              className={`issue-item ${selectedIssue?.id === issue.id ? 'selected' : ''}`}
                              onClick={() => handleSelectIssue(issue)}
                            >
                              <div className={`issue-severity`} data-severity={issue.severity}></div>
                              <div className="issue-info">
                                <div className="issue-title">
                                  <span className="font-medium">Ligne {issue.line}: </span>
                                  {issue.title}
                                </div>
                                <div className="issue-location">
                                  <Badge variant={getSeverityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {selectedIssue && (
                        <div className="issue-detail">
                          <h5>
                            {getSeverityIcon(selectedIssue.severity)}
                            <span className="ml-1">{selectedIssue.title}</span>
                          </h5>
                          <p>{selectedIssue.description}</p>
                          <div className="issue-solution">
                            <h6>Solution recommandée:</h6>
                            <p>{selectedIssue.solution}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {renderPersonalizedInsights()}
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Code amélioré</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyImprovedCode}
                      className="flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copier
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <div className="code-diff-title">
                        <span className="text-sm">
                          {fileName || `code.${fileType}`}
                        </span>
                        <Badge variant="outline" className="ml-2 feature-tag">
                          MCP: {mcpState.domain}
                        </Badge>
                      </div>
                      <div className="p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {analysisResult.improvedCode}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Impact du contexte MCP</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm space-y-2">
                          <p>
                            <span className="font-medium">Persona:</span> {mcpState.persona}
                          </p>
                          <p>
                            <span className="font-medium">Domaine:</span> {mcpState.domain}
                          </p>
                          <p>
                            <span className="font-medium">Niveau technique:</span> {mcpState.technical_level}/4
                          </p>
                          {analysisResult.mcpAdjustments && (
                            <>
                              <div className="pt-2 border-t border-border mt-2">
                                <p className="font-medium mb-1">Ajustements appliqués:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  {analysisResult.mcpAdjustments.toolsUsed.map(tool => (
                                    <li key={tool}>{tool}</li>
                                  ))}
                                  {analysisResult.mcpAdjustments.securityScanEnabled && (
                                    <li>Scan de sécurité activé</li>
                                  )}
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FilePlus className="w-12 h-12 mb-4 opacity-20" />
              <p>Aucun résultat d'analyse disponible</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('input')}
              >
                Analyser un code
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeAnalysisTab;