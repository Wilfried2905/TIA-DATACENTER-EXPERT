import { pgTable, text, serial, integer, boolean, date, json, timestamp, unique, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Constantes pour les catégories et sous-catégories
export const CATEGORIES = {
  AMOA: "amoa",
  AUDIT: "audit",
  CONSEIL: "conseil",
  ACCOMPAGNEMENT: "accompagnement"
};

export const SUBCATEGORIES = {
  // AMOA
  PRELIMINARY_STUDY: "preliminary-study",
  INFRASTRUCTURE_EVALUATION: "infrastructure-evaluation",
  NEEDS_EVALUATION: "needs-evaluation",
  LOCATION_STUDY: "location-study",
  RESILIENCE_STUDY: "resilience-study",
  SPECIALIZED_ASSESSMENTS: "specialized-assessments",
  ENERGY_OPTIMIZATION: "energy-optimization",
  COMPARATIVE_STUDIES: "comparative-studies",
  
  // AUDIT
  TIA942_COMPLIANCE: "tia942-compliance",
  TIER_CERTIFICATION: "tier-certification",
  DOCUMENT_AUDIT: "document-audit",
  PERIODIC_EVALUATIONS: "periodic-evaluations",
  GAP_ANALYSIS: "gap-analysis",
  PHYSICAL_SECURITY_AUDIT: "physical-security-audit",
  CERTIFICATION_PREPARATION: "certification-preparation",
  
  // CONSEIL
  TECHNICAL_CONSULTING: "technical-consulting",
  OPERATIONAL_CONSULTING: "operational-consulting",
  STRATEGIC_CONSULTING: "strategic-consulting",
  STRATEGIC_PLANNING: "strategic-planning",
  MODERNIZATION_STUDIES: "modernization-studies",
  
  // ACCOMPAGNEMENT
  TEAM_TRAINING: "team-training",
  DOC_PRODUCTION: "doc-production",
  DOCUMENTATION_MANAGEMENT: "documentation-management",
  COMPETENCE_TRANSFER: "competence-transfer",
  PROJECT_SUPPORT: "project-support",
  RECOMMENDATIONS_TRACKING: "recommendations-tracking"
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  category: text("category"),  // Catégorie associée au client
  subcategory: text("subcategory"), // Sous-catégorie associée au client
});

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  // Category and subcategory information
  category: text("category"),
  subcategory: text("subcategory"),
  // Fields for Infrastructure Evaluation subcategory
  dataCenterName: text("datacenter_name"),
  location: text("location"),
  currentTier: text("current_tier"),
  description: text("description"),
  
  // Fields for Feasibility Study subcategory
  projectName: text("project_name"),
  clientName: text("client_name"),
  objectifPrincipal: text("objectif_principal"),
  niveauTier: text("niveau_tier"),
  etudeGeotech: text("etude_geotech"),
  accesInfrastructures: text("acces_infrastructures"),
  budgetEstime: text("budget_estime"),
  equipeProjet: text("equipe_projet"),
  sourcesAlimentationSuffisantes: text("sources_alimentation_suffisantes"),
  capacitesRefroidissement: text("capacites_refroidissement"),
  delaiRealisation: text("delai_realisation"),
  phasagePossible: text("phasage_possible"),
  autorisationsIdentifiees: text("autorisations_identifiees"),
  contraintesReglementaires: text("contraintes_reglementaires"),
  comments: text("comments"),
  
  // Feasibility scoring
  score: integer("score"),
  maxScore: integer("max_score"),
  feasibilityLevel: text("feasibility_level"),
  
  // Common fields
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Identification d'évaluation temporaire/brouillon
  // Cette propriété permet d'identifier des évaluations non finalisées ou brouillons
  // qui peuvent être supprimées manuellement par l'utilisateur
  isTemporary: boolean("is_temporary").default(false),
  
  // Indique si cette évaluation est un modèle pouvant être réutilisé
  templateEvaluation: boolean("template_evaluation").default(false),
  
  // Other evaluation fields will be stored in separate tables or in JSON
  siteData: json("site_data"),
  architectureData: json("architecture_data"),
  electricalData: json("electrical_data"),
  mechanicalData: json("mechanical_data"),
  telecomData: json("telecom_data"),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  evaluationId: integer("evaluation_id").references(() => evaluations.id),
  projectName: text("project_name").notNull(),
  purpose: text("purpose").notNull(),
  
  // Common fields
  densityPower: text("density_power"),
  estimatedCapacity: integer("estimated_capacity"),
  tierLevel: text("tier_level"),
  budgetRange: text("budget_range"),
  timeline: text("timeline"),
  specificRequirements: text("specific_requirements"),
  
  // Feasibility study specific fields
  totalPoints: integer("total_points"),
  maxPoints: integer("max_points"),
  scorePercentage: integer("score_percentage"),
  besoinsLevel: text("besoins_level"),
  globalScorePercentage: integer("global_score_percentage"),
  globalFeasibilityLevel: text("global_feasibility_level"),
  comments: text("comments"),
  
  // JSON data for answers to questionnaire
  answers: json("answers"),
  
  // Common fields
  status: text("status").notNull().default("in_progress"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Other questionnaire sections will be stored as JSON
  operationalData: json("operational_data"),
  technicalData: json("technical_data"),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  evaluationId: integer("evaluation_id").references(() => evaluations.id).notNull(),
  questionnaireId: integer("questionnaire_id").references(() => questionnaires.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  justification: text("justification"),
  priority: text("priority").notNull(),
  category: text("category").notNull(), // 'architecture', 'electrical', 'cooling', 'network', 'security'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  details: json("details"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  evaluationId: integer("evaluation_id").references(() => evaluations.id),
  type: text("type").notNull(), // 'cdc', 'technical_offer', 'evaluation_report', 'bom'
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  options: json("options"),
});

export const generatedDocuments = pgTable("generated_documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  clientName: text("client_name"), // Ajout du nom du client pour faciliter les recherches
  evaluationId: integer("evaluation_id").references(() => evaluations.id),
  category: text("category"),
  subcategory: text("subcategory"),
  format: text("format"), // 'docx', 'pdf', 'xlsx'
  content: text("content"), // Contenu du document (pour les prévisualisations et stockage)
  path: text("path").notNull(),
  status: text("status").notNull().default("ready"), // 'ready', 'generating', 'completed', 'error', 'pending'
  generatedAt: timestamp("generated_at"), // Date de génération finale (différente de createdAt)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  options: json("options"),
  linkedDocuments: json("linked_documents"), // Liste des documents liés ou nombre de documents
});

// Nouvelle table pour les prompts et sommaires associés aux catégories/sous-catégories
// Table pour stocker les catégories disponibles (au lieu d'utiliser des constantes)
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // Code utilisé dans le système (ex: "amoa")
  name: text("name").notNull(), // Nom d'affichage (ex: "AMOA")
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table pour stocker les sous-catégories disponibles
export const subCategoriesTable = pgTable("subcategories", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  code: text("code").notNull(), // Code utilisé dans le système (ex: "preliminary-study")
  name: text("name").notNull(), // Nom d'affichage
  description: text("description"),
  icon: text("icon"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Contrainte d'unicité sur la combinaison catégorie + code
    categoryCodeUnique: unique().on(table.categoryId, table.code),
  };
});

// Table pour stocker les types de documents disponibles
export const documentTypesTable = pgTable("document_types", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  requiresEvaluation: boolean("requires_evaluation").default(false), // Indique si ce type nécessite une évaluation
  requiresQuestionnaire: boolean("requires_questionnaire").default(false), // Indique si ce type nécessite un questionnaire
  isAvailable: boolean("is_available").default(true), // Indique si ce type est disponible à la génération
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table de relation entre catégories, sous-catégories et types de documents
export const categoryDocumentRelationsTable = pgTable("category_document_relations", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  subCategoryId: integer("subcategory_id").references(() => subCategoriesTable.id).notNull(),
  documentTypeId: integer("document_type_id").references(() => documentTypesTable.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Contrainte d'unicité pour éviter les doublons
    relationUnique: unique().on(table.categoryId, table.subCategoryId, table.documentTypeId),
  };
});

// Table de dépendances entre documents
export const documentDependenciesTable = pgTable("document_dependencies", {
  id: serial("id").primaryKey(),
  documentTypeId: integer("document_type_id").references(() => documentTypesTable.id).notNull(),
  dependsOnDocumentTypeId: integer("depends_on_document_type_id").references(() => documentTypesTable.id).notNull(),
  isRequired: boolean("is_required").default(true), // Si true, le document est un prérequis obligatoire
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Contrainte d'unicité pour éviter les doublons
    dependencyUnique: unique().on(table.documentTypeId, table.dependsOnDocumentTypeId),
  };
});

export const categoryTemplates = pgTable("category_templates", {
  id: serial("id").primaryKey(),
  // Catégorie et sous-catégorie (clés de référence pour le classement)
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  // Type de document (prompt, summary, etc.)
  templateType: text("template_type").notNull(), // 'prompt', 'summary', 'template', etc.
  // Nom d'affichage pour le document
  name: text("name").notNull(),
  // Nom de fichier original
  filename: text("filename").notNull(),
  // Description du document
  description: text("description"),
  // Chemin du fichier
  filePath: text("file_path").notNull(),
  // Date de création
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Date de mise à jour
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Métadonnées additionnelles en JSON
  metadata: json("metadata"),
});

/**
 * Table des casiers de documents prédéfinis
 * Cette table stocke les "casiers" pour chaque type de document dans l'application
 * Chaque casier contient toutes les informations prédéfinies pour générer un document spécifique
 */
export const documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  
  // Identifiant unique du template (ex: "amoa-etude-preliminaire-faisabilite")
  templateId: text("template_id").notNull().unique(),
  
  // Organisation hiérarchique
  category: text("category").notNull(),          // Catégorie principale (ex: "AMOA")
  subcategory: text("subcategory").notNull(),    // Sous-catégorie (ex: "etude-preliminaire")
  documentType: text("document_type").notNull(), // Type de document (ex: "etude-faisabilite")
  
  // Nomenclature et affichage
  displayName: text("display_name").notNull(),   // Nom d'affichage pour l'interface (ex: "Étude de faisabilité")
  filenamePattern: text("filename_pattern").notNull(), // Modèle pour nommer le fichier (ex: "AMOA_etudeprelim_faisabilite_%client%_%date%")
  
  // Contenu prédéfini
  promptId: integer("prompt_id"), // Référence vers le prompt dans categoryTemplates
  summaryId: integer("summary_id"), // Référence vers le sommaire dans categoryTemplates
  templatePath: text("template_path"), // Chemin vers le template DOCX/XLSX
  
  // Structure et sections
  structure: json("structure"), // Structure du document (sections, sous-sections)
  
  // Métadonnées
  description: text("description"), // Description détaillée du document
  tags: text("tags").array(), // Tags pour faciliter la recherche
  
  // Champs administratifs
  active: boolean("active").default(true).notNull(), // Indique si ce template est actif
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  contactName: true,
  email: true,
  phone: true,
  category: true,
  subcategory: true,
});

export const insertEvaluationSchema = createInsertSchema(evaluations).pick({
  clientId: true,
  // Category and subcategory information
  category: true,
  subcategory: true,
  // Infrastructure Evaluation fields
  dataCenterName: true,
  location: true,
  currentTier: true,
  description: true,
  
  // Feasibility Study fields
  projectName: true,
  clientName: true,
  objectifPrincipal: true,
  niveauTier: true,
  etudeGeotech: true,
  accesInfrastructures: true,
  budgetEstime: true,
  equipeProjet: true,
  sourcesAlimentationSuffisantes: true,
  capacitesRefroidissement: true,
  delaiRealisation: true,
  phasagePossible: true,
  autorisationsIdentifiees: true,
  contraintesReglementaires: true,
  comments: true,
  
  // Feasibility scoring
  score: true,
  maxScore: true,
  feasibilityLevel: true,
  
  // Common fields
  status: true,
  
  // Temporary evaluation fields
  isTemporary: true,
  templateEvaluation: true,
  
  // JSON data fields
  siteData: true,
  architectureData: true,
  electricalData: true,
  mechanicalData: true,
  telecomData: true,
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).pick({
  clientId: true,
  evaluationId: true,
  projectName: true,
  purpose: true,
  
  // Common fields
  densityPower: true,
  estimatedCapacity: true,
  tierLevel: true,
  budgetRange: true,
  timeline: true,
  specificRequirements: true,
  
  // Feasibility study specific fields
  totalPoints: true,
  maxPoints: true,
  scorePercentage: true,
  besoinsLevel: true,
  globalScorePercentage: true,
  globalFeasibilityLevel: true,
  comments: true,
  answers: true,
  
  // Common fields
  status: true,
  
  // JSON data fields
  operationalData: true,
  technicalData: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  evaluationId: true,
  questionnaireId: true,
  title: true,
  description: true,
  justification: true,
  priority: true,
  category: true,
  details: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  clientId: true,
  evaluationId: true,
  type: true,
  filePath: true,
  options: true,
});

export const insertGeneratedDocumentSchema = createInsertSchema(generatedDocuments).pick({
  name: true,
  filename: true,
  clientId: true,
  clientName: true,
  evaluationId: true,
  category: true,
  subcategory: true,
  format: true,
  content: true,
  path: true,
  status: true,
  generatedAt: true,
  options: true,
  linkedDocuments: true,
});

export const insertCategoryTemplateSchema = createInsertSchema(categoryTemplates).pick({
  category: true,
  subcategory: true,
  templateType: true,
  name: true,
  filename: true,
  description: true,
  filePath: true,
  metadata: true,
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).pick({
  templateId: true,
  category: true,
  subcategory: true,
  documentType: true,
  displayName: true,
  filenamePattern: true,
  promptId: true,
  summaryId: true,
  templatePath: true,
  structure: true,
  description: true,
  tags: true,
  active: true,
});

// Schémas d'insertion pour les nouvelles tables
export const insertCategorySchema = createInsertSchema(categoriesTable).pick({
  code: true,
  name: true,
  description: true,
  icon: true,
  displayOrder: true,
  isActive: true,
});

export const insertSubCategorySchema = createInsertSchema(subCategoriesTable).pick({
  categoryId: true,
  code: true,
  name: true,
  description: true,
  icon: true,
  displayOrder: true,
  isActive: true,
});

export const insertDocumentTypeSchema = createInsertSchema(documentTypesTable).pick({
  code: true,
  name: true,
  description: true,
  requiresEvaluation: true,
  requiresQuestionnaire: true,
  isAvailable: true,
});

export const insertCategoryDocumentRelationSchema = createInsertSchema(categoryDocumentRelationsTable).pick({
  categoryId: true,
  subCategoryId: true,
  documentTypeId: true,
  isActive: true,
});

export const insertDocumentDependencySchema = createInsertSchema(documentDependenciesTable).pick({
  documentTypeId: true,
  dependsOnDocumentTypeId: true,
  isRequired: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;

export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;
export type Questionnaire = typeof questionnaires.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertGeneratedDocument = z.infer<typeof insertGeneratedDocumentSchema>;
export type GeneratedDocument = typeof generatedDocuments.$inferSelect;

export type InsertCategoryTemplate = z.infer<typeof insertCategoryTemplateSchema>;
export type CategoryTemplate = typeof categoryTemplates.$inferSelect;

export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;

// Types pour les nouvelles tables
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export type InsertSubCategory = z.infer<typeof insertSubCategorySchema>;
export type SubCategory = typeof subCategoriesTable.$inferSelect;

export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;
export type DocumentType = typeof documentTypesTable.$inferSelect;

export type InsertCategoryDocumentRelation = z.infer<typeof insertCategoryDocumentRelationSchema>;
export type CategoryDocumentRelation = typeof categoryDocumentRelationsTable.$inferSelect;

export type InsertDocumentDependency = z.infer<typeof insertDocumentDependencySchema>;
export type DocumentDependency = typeof documentDependenciesTable.$inferSelect;
