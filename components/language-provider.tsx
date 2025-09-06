"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr";

type Translations = Record<Language, Record<string, string>>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  en: {
    // Navbar
    "navbar.title": "POLICE DRS",
    "navbar.subtitle": "DIGITAL RECORDS MANAGEMENT",
    "navbar.unit": "UNIT: LAG-ILU-023",
    "navbar.shift": "SHIFT: DAY",
    "navbar.officer": "Officer A. Musa",
    "navbar.badge": "BADGE: 1247",
    
    // Sidebar
    "sidebar.systemStatus": "SYSTEM STATUS",
    "sidebar.commandCenter": "COMMAND CENTER",
    "sidebar.commandCenter.desc": "Main Dashboard",
    "sidebar.database": "DATABASE",
    "sidebar.database.desc": "Search Records",
    "sidebar.caseFiles": "CASE FILES",
    "sidebar.caseFiles.desc": "Active Cases",
    "sidebar.arrests": "ARRESTS",
    "sidebar.arrests.desc": "Booking Records",
    "sidebar.patrolLogs": "PATROL LOGS",
    "sidebar.patrolLogs.desc": "Field Reports",
    "sidebar.evidence": "EVIDENCE",
    "sidebar.evidence.desc": "Digital Vault",
    "sidebar.hqSync": "HQ SYNC",
    "sidebar.hqSync.desc": "Data Transfer",
    "sidebar.analytics": "ANALYTICS",
    "sidebar.analytics.desc": "Statistics",
    "sidebar.system": "SYSTEM",
    "sidebar.system.desc": "Configuration",
    
    // Dashboard
    "dashboard.activeCases": "ACTIVE CASES",
    "dashboard.arrests": "ARRESTS",
    "dashboard.patrolLogs": "PATROL LOGS",
    "dashboard.openCases": "OPEN CASES",
    "dashboard.totalRecords": "TOTAL RECORDS",
    "dashboard.quickActions": "QUICK ACTIONS",
    "dashboard.quickActions.desc": "OFFICER DASHBOARD CONTROLS",
    "dashboard.systemOnline": "SYSTEM ONLINE",
    "dashboard.newCase": "NEW CASE",
    "dashboard.arrest": "ARREST",
    "dashboard.patrolLog": "PATROL LOG",
    "dashboard.syncHq": "SYNC HQ",
    "dashboard.export": "EXPORT",
    "dashboard.arrestAnalytics": "ARREST ANALYTICS",
    "dashboard.arrestAnalytics.desc": "7-DAY TREND ANALYSIS",
    "dashboard.liveData": "LIVE DATA",
    "dashboard.crimeClassification": "CRIME CLASSIFICATION",
    "dashboard.crimeClassification.desc": "INCIDENT BREAKDOWN",
    "dashboard.total": "TOTAL",
    "dashboard.systemActivityLog": "SYSTEM ACTIVITY LOG",
    "dashboard.systemActivityLog.desc": "REAL-TIME UPDATES",
    "dashboard.monitoring": "MONITORING",
    
    // Records
    "records.title": "RECORDS DATABASE",
    "records.subtitle": "DIGITAL EVIDENCE MANAGEMENT SYSTEM",
    "records.databaseOnline": "DATABASE ONLINE",
    "records.searchFilters": "SEARCH FILTERS",
    "records.searchFilters.desc": "REFINE DATABASE QUERY",
    "records.results": "RESULTS",
    "records.recordType": "RECORD TYPE",
    "records.status": "STATUS",
    "records.searchQuery": "SEARCH QUERY",
    "records.searchPlaceholder": "Enter ID, officer name, or keywords...",
    "records.noRecords": "No records found",
    "records.noRecords.desc": "Try adjusting your search criteria",
    
    // Common
    "common.loading": "Loading...",
    "common.view": "View",
    "common.edit": "Edit",
    "common.new": "New",
    "common.id": "ID",
    "common.type": "Type",
    "common.title": "Title",
    "common.officer": "Officer",
    "common.date": "Date",
    "common.status": "Status",
    "common.actions": "Actions",
  },
  fr: {
    // Navbar
    "navbar.title": "POLICE SRN",
    "navbar.subtitle": "SYSTÈME DE GESTION DES DOSSIERS",
    "navbar.unit": "UNITÉ: LAG-ILU-023",
    "navbar.shift": "ÉQUIPE: JOUR",
    "navbar.officer": "Agent A. Musa",
    "navbar.badge": "INSIGNE: 1247",
    
    // Sidebar
    "sidebar.systemStatus": "ÉTAT DU SYSTÈME",
    "sidebar.commandCenter": "CENTRE DE COMMANDE",
    "sidebar.commandCenter.desc": "Tableau de Bord",
    "sidebar.database": "BASE DE DONNÉES",
    "sidebar.database.desc": "Recherche Dossiers",
    "sidebar.caseFiles": "DOSSIERS",
    "sidebar.caseFiles.desc": "Affaires Actives",
    "sidebar.arrests": "ARRESTATIONS",
    "sidebar.arrests.desc": "Registres d'Écrou",
    "sidebar.patrolLogs": "JOURNAUX PATROUILLE",
    "sidebar.patrolLogs.desc": "Rapports Terrain",
    "sidebar.evidence": "PREUVES",
    "sidebar.evidence.desc": "Coffre Numérique",
    "sidebar.hqSync": "SYNC QG",
    "sidebar.hqSync.desc": "Transfert Données",
    "sidebar.analytics": "ANALYTIQUES",
    "sidebar.analytics.desc": "Statistiques",
    "sidebar.system": "SYSTÈME",
    "sidebar.system.desc": "Configuration",
    
    // Dashboard
    "dashboard.activeCases": "AFFAIRES ACTIVES",
    "dashboard.arrests": "ARRESTATIONS",
    "dashboard.patrolLogs": "JOURNAUX PATROUILLE",
    "dashboard.openCases": "AFFAIRES OUVERTES",
    "dashboard.totalRecords": "TOTAL DOSSIERS",
    "dashboard.quickActions": "ACTIONS RAPIDES",
    "dashboard.quickActions.desc": "CONTRÔLES TABLEAU DE BORD",
    "dashboard.systemOnline": "SYSTÈME EN LIGNE",
    "dashboard.newCase": "NOUVELLE AFFAIRE",
    "dashboard.arrest": "ARRESTATION",
    "dashboard.patrolLog": "JOURNAL PATROUILLE",
    "dashboard.syncHq": "SYNC QG",
    "dashboard.export": "EXPORTER",
    "dashboard.arrestAnalytics": "ANALYTIQUES ARRESTATIONS",
    "dashboard.arrestAnalytics.desc": "ANALYSE TENDANCE 7 JOURS",
    "dashboard.liveData": "DONNÉES EN DIRECT",
    "dashboard.crimeClassification": "CLASSIFICATION CRIMES",
    "dashboard.crimeClassification.desc": "RÉPARTITION INCIDENTS",
    "dashboard.total": "TOTAL",
    "dashboard.systemActivityLog": "JOURNAL ACTIVITÉ SYSTÈME",
    "dashboard.systemActivityLog.desc": "MISES À JOUR TEMPS RÉEL",
    "dashboard.monitoring": "SURVEILLANCE",
    
    // Records
    "records.title": "BASE DE DONNÉES DOSSIERS",
    "records.subtitle": "SYSTÈME GESTION PREUVES NUMÉRIQUES",
    "records.databaseOnline": "BASE DE DONNÉES EN LIGNE",
    "records.searchFilters": "FILTRES RECHERCHE",
    "records.searchFilters.desc": "AFFINER REQUÊTE BASE DONNÉES",
    "records.results": "RÉSULTATS",
    "records.recordType": "TYPE DOSSIER",
    "records.status": "STATUT",
    "records.searchQuery": "REQUÊTE RECHERCHE",
    "records.searchPlaceholder": "Entrez ID, nom agent, ou mots-clés...",
    "records.noRecords": "Aucun dossier trouvé",
    "records.noRecords.desc": "Essayez d'ajuster vos critères de recherche",
    
    // Common
    "common.loading": "Chargement...",
    "common.view": "Voir",
    "common.edit": "Modifier",
    "common.new": "Nouveau",
    "common.id": "ID",
    "common.type": "Type",
    "common.title": "Titre",
    "common.officer": "Agent",
    "common.date": "Date",
    "common.status": "Statut",
    "common.actions": "Actions",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("police-drs-language") as Language;
    if (saved && (saved === "en" || saved === "fr")) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("police-drs-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
