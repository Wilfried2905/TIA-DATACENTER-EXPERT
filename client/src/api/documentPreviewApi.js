/**
 * Service API pour la prévisualisation et la génération avancée de documents
 */

/**
 * Générer une prévisualisation de document basée sur un prompt et un sommaire
 * 
 * @param {Object} params Les paramètres pour la génération de la prévisualisation
 * @param {number} params.promptId ID du document prompt
 * @param {number} params.summaryId ID du document sommaire
 * @param {number} params.clientId ID du client
 * @param {number} [params.evaluationId] ID de l'évaluation (optionnel)
 * @returns {Promise<Object>} Prévisualisation du document
 */
export const generateDocumentPreview = async (params) => {
  try {
    const response = await fetch('/api/document-preview/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la génération de prévisualisation: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la génération de la prévisualisation:', error);
    throw error;
  }
};

/**
 * Générer et enregistrer un document final à partir d'une prévisualisation
 * 
 * @param {Object} params Les paramètres pour la génération du document final
 * @param {string} params.previewContent Contenu de la prévisualisation
 * @param {string} params.documentName Nom du document
 * @param {string} params.category Catégorie du document
 * @param {string} params.subcategory Sous-catégorie du document
 * @param {number} params.clientId ID du client
 * @param {string} [params.format='docx'] Format du document ('docx', 'pdf', 'xlsx')
 * @returns {Promise<Object>} Document généré
 */
export const generateFinalDocument = async (params) => {
  try {
    const response = await fetch('/api/document-preview/finalize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        format: params.format || 'docx',
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la génération du document final: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la génération du document final:', error);
    throw error;
  }
};