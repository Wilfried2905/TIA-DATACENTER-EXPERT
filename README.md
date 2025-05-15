# TIA-DATACENTER-EXPERT

Application d'expertise et d'évaluation de datacenters basée sur les normes TIA-942.

## Description

TIA-DATACENTER-EXPERT est une application web complète pour la gestion, l'évaluation et la documentation d'infrastructures de datacenters conformément aux normes TIA-942. Elle offre une plateforme intégrée permettant aux consultants et aux experts de :

- Évaluer des datacenters existants selon les standards internationaux
- Générer des documentations professionnelles personnalisées
- Analyser la conformité et les écarts par rapport aux normes
- Produire des recommandations adaptées aux besoins spécifiques
- Gérer le cycle de vie complet des projets d'infrastructure

## Fonctionnalités principales

- **Évaluation structurée** : Workflows guidés pour collecter et analyser les informations de datacenter
- **Génération de documents** : Production automatisée de rapports, audits et plans d'action
- **Assistant IA intégré** : Analyse intelligente et recommandations personnalisées
- **Gestion des clients** : Suivi complet des projets et historique des évaluations
- **Base de connaissances** : Référentiels de normes et meilleures pratiques
- **Interface multilingue** : Support du français et de l'anglais
- **Tableau de bord interactif** : Visualisation des métriques clés et suivi de progression

## Captures d'écran

![Dashboard](https://github.com/Wilfried2905/TIA-DATACENTER-EXPERT/raw/main/screenshots/dashboard.png)
![Document Generation](https://github.com/Wilfried2905/TIA-DATACENTER-EXPERT/raw/main/screenshots/document_generation.png)

## Installation

### Prérequis

- Node.js 20+
- PostgreSQL 16+
- npm ou yarn

### Configuration de la base de données

1. Créez une base de données PostgreSQL
2. Importez le fichier `database/db_dump.sql` inclus dans le package téléchargeable
3. Configurez les variables d'environnement de connexion

Pour des instructions détaillées, consultez [DATABASE_INSTRUCTIONS.md](DATABASE_INSTRUCTIONS.md).

### Installation des dépendances

```bash
npm install
```

### Configuration de l'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
DATABASE_URL=postgres://[username]:[password]@localhost:5432/datacenter_expert
PORT=3000
NODE_ENV=production
```

### Lancement de l'application

```bash
npm run dev     # Mode développement
npm run build   # Construction du projet
npm start       # Mode production
```

## Architecture technique

- **Frontend** : React.js avec Tailwind CSS et shadcn/ui
- **Backend** : Node.js avec Express
- **Base de données** : PostgreSQL avec Drizzle ORM
- **IA** : Integration Claude AI pour l'analyse avancée
- **Documentation** : Génération dynamique via templates Word

## Structure du projet

- `/client` - Interface utilisateur React
- `/server` - API backend Express
- `/shared` - Types et schémas partagés
- `/templates` - Modèles de documents
- `/scripts` - Utilitaires et migrations
- `/database` - Scripts et dumps SQL

## Contribution

Ce projet est développé et maintenu par [3R Technologie](https://www.3rtechnologie.com). Pour toute question ou suggestion, veuillez contacter l'équipe de développement.

## Licence

Tous droits réservés. Ce logiciel est la propriété de 3R Technologie.