import documentCasierManager from '../managers/DocumentCasierManager';
import { toast } from '../components/ui/toast';
import { saveAs } from 'file-saver';

/**
 * Génère un document en utilisant le système de casiers prédéfinis
 */
export const generateDocumentFromCasier = async (category, subcategory, docType, clientData, evaluationData) => {
  try {
    // 1. Récupérer les informations du casier
    const casierInfo = documentCasierManager.getCasierInfo(category, subcategory, docType);
    
    console.log(`Génération avec casier prédéfini:`, casierInfo);
    
    // 2. Vérifier si les documents nécessaires sont disponibles
    if (!casierInfo.promptDocId || !casierInfo.summaryDocId) {
      throw new Error(`Documents modèles manquants pour la génération (prompt: ${casierInfo.promptDocId}, summary: ${casierInfo.summaryDocId})`);
    }
    
    // 3. Nom du fichier selon la nomenclature standardisée
    const customFilename = documentCasierManager.generateFilename(
      category, 
      subcategory, 
      docType, 
      clientData
    );
    
    // 4. Notification de début de génération
    toast({
      title: "Génération en cours",
      description: `Préparation du document ${customFilename}`,
      variant: "default",
    });
    
    // 5. Appel à l'API de génération avec paramètres complets
    const response = await fetch('/api/documents/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: clientData?.id,
        evaluationId: evaluationData?.id,
        documentType: docType,
        options: {
          includeLogo: true,
          includeDiagrams: true,
          includePricing: false,
          detailLevel: 'standard',
          useClaudeAI: true,
          casierInfo: {
            promptDocId: casierInfo.promptDocId,
            summaryDocId: casierInfo.summaryDocId,
            customFilename: customFilename
          },
          language: 'fr'
        }
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.document && result.document.path) {
      // 6. Notification de réussite de génération
      toast({
        title: "Document généré",
        description: `${customFilename} a été généré avec succès`,
        variant: "success",
      });
      
      // 7. Retour des informations de document
      return {
        path: result.document.path,
        filename: customFilename,
        format: casierInfo.format,
        ...result
      };
    } else {
      throw new Error(result.message || "Échec de génération du document");
    }
  } catch (error) {
    console.error('Erreur lors de la génération de document:', error);
    
    toast({
      title: "Erreur de génération",
      description: error.message || "Une erreur s'est produite lors de la génération du document",
      variant: "destructive",
    });
    
    return { success: false, error: error.message };
  }
};

/**
 * Télécharge un document généré à partir d'un casier
 */
export const downloadGeneratedDocument = async (documentPath, clientData) => {
  try {
    // 1. Extraire les informations du chemin
    const pathParts = documentPath.split('/').filter(part => part);
    const category = pathParts.length > 1 ? pathParts[1] : '';
    const subcategory = pathParts.length > 2 ? pathParts[2] : '';
    const docType = pathParts.length > 3 ? pathParts[3] : '';
    
    // 2. Notification de début de téléchargement
    toast({
      title: "Téléchargement",
      description: "Préparation du téléchargement...",
      variant: "default",
    });
    
    // 3. Construire les paramètres de requête avec plus d'informations
    const queryParams = new URLSearchParams({
      path: documentPath,
      validateIntegrity: 'true'
    });
    
    // 4. Vérifier d'abord l'intégrité du document
    const integrityResponse = await fetch(`/api/enhanced-documents/check-integrity?${queryParams.toString()}`);
    const integrityResult = await integrityResponse.json();
    
    if (!integrityResult.valid) {
      console.warn('Intégrité du document compromise, utilisation de la route sécurisée pour le téléchargement', integrityResult);
      
      // Utiliser la route améliorée pour le téléchargement sécurisé
      const response = await fetchWithRetry(
        `/api/enhanced-documents/download?${queryParams.toString()}`,
        { maxRetries: 3 }
      );
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Erreur HTTP: ${response.status}`);
      }
      
      // 5. Récupération du blob
      const blob = await response.blob();
      
      // 6. Extraction du nom de fichier depuis les en-têtes
      let fileName = extractFilenameFromHeaders(response);
      
      // Fallback au nom généré si non disponible
      if (!fileName) {
        const casierInfo = documentCasierManager.getCasierInfo(category, subcategory, docType);
        fileName = documentCasierManager.generateFilename(category, subcategory, docType, clientData);
      }
      
      // 7. Téléchargement sécurisé du document
      saveAs(blob, fileName);
      
      toast({
        title: "Succès",
        description: "Document téléchargé avec succès",
        variant: "success",
      });
      
      return { success: true, fileName, secureDownload: true };
    } else {
      // Document valide, utiliser la route standard
      const response = await fetchWithRetry(
        `/api/documents/download?${queryParams.toString()}`,
        { maxRetries: 3 }
      );
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Erreur HTTP: ${response.status}`);
      }
      
      // 5. Récupération du blob
      const blob = await response.blob();
      
      // 6. Extraction du nom de fichier depuis les en-têtes
      let fileName = extractFilenameFromHeaders(response);
      
      // Fallback au nom généré si non disponible
      if (!fileName) {
        const casierInfo = documentCasierManager.getCasierInfo(category, subcategory, docType);
        fileName = documentCasierManager.generateFilename(category, subcategory, docType, clientData);
      }
      
      // 7. Téléchargement sécurisé du document
      saveAs(blob, fileName);
      
      toast({
        title: "Succès",
        description: "Document téléchargé avec succès",
        variant: "success",
      });
      
      return { success: true, fileName, secureDownload: false };
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    
    toast({
      title: "Erreur",
      description: `Impossible de télécharger le document: ${error.message}`,
      variant: "destructive",
    });
    
    return { success: false, error: error.message };
  }
};

/**
 * Exécute une requête avec mécanisme de réessai
 */
const fetchWithRetry = async (url, options = {}) => {
  const { maxRetries = 3, ...fetchOptions } = options;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error) {
      console.warn(`Tentative ${attempt}/${maxRetries} échouée:`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        // Attente exponentielle entre les tentatives
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }
  
  throw lastError || new Error(`Échec après ${maxRetries} tentatives`);
};

/**
 * Extrait le nom de fichier depuis les en-têtes HTTP
 */
const extractFilenameFromHeaders = (response) => {
  const contentDisposition = response.headers.get('Content-Disposition');
  if (!contentDisposition) return null;
  
  // Recherche du nom de fichier dans l'en-tête Content-Disposition
  const filenameRegex = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i;
  const matches = filenameRegex.exec(contentDisposition);
  
  if (matches) {
    const filename = matches[1] || matches[2] || matches[3];
    return decodeURIComponent(filename);
  }
  
  return null;
};