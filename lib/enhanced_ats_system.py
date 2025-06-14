import spacy
import torch
from transformers import (
    AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
    pipeline, BertTokenizer, BertModel
)
from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import json
from typing import Dict, List, Tuple, Any
import warnings
from .custom_ner_trainer import CustomNERTrainer, extract_recruitment_entities

warnings.filterwarnings('ignore')

class EnhancedATSSystem:
    def __init__(self):
        """
        Système ATS amélioré avec modèle NER personnalisé
        """
        print("🚀 Initialisation du système ATS amélioré...")
        
        # Modèles de base
        try:
            self.nlp_fr = spacy.load("fr_core_news_sm")
        except:
            print("⚠️ Modèle français non trouvé, utilisation du modèle anglais")
            self.nlp_fr = spacy.load("en_core_web_sm")
            
        self.nlp_en = spacy.load("en_core_web_sm")
        
        # Modèle NER personnalisé pour le recrutement
        self.ner_trainer = CustomNERTrainer()
        self.custom_nlp = self.ner_trainer.load_model()
        
        # Modèles BERT et transformers
        self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.bert_model = BertModel.from_pretrained('bert-base-uncased')
        
        # Sentence Transformers
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pipelines d'analyse
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest"
        )
        
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
        
        print("✅ Système ATS amélioré initialisé avec succès!")

    def extract_entities_enhanced(self, text: str) -> Dict[str, List[str]]:
        """
        Extraction d'entités améliorée avec le modèle personnalisé
        """
        # Utiliser le modèle NER personnalisé
        custom_entities = extract_recruitment_entities(text)
        
        # Compléter avec spaCy standard
        doc = self.nlp_fr(text)
        standard_entities = {
            "PERSON": [],
            "ORG": [],
            "GPE": [],
            "MONEY": [],
            "DATE": [],
        }
        
        for ent in doc.ents:
            if ent.label_ in standard_entities:
                standard_entities[ent.label_].append(ent.text.strip())
        
        # Fusionner les résultats
        combined_entities = {**custom_entities, **standard_entities}
        
        # Extraction de compétences techniques avec regex amélioré
        tech_patterns = {
            "programming": r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB|SQL)\b',
            "frameworks": r'\b(?:React|Angular|Vue|Django|Flask|Spring|Laravel|Rails|Express|FastAPI|Node\.js|Next\.js)\b',
            "databases": r'\b(?:MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Oracle|SQLite|Cassandra|DynamoDB|Neo4j)\b',
            "cloud": r'\b(?:AWS|Azure|GCP|Google Cloud|Heroku|DigitalOcean|Kubernetes|Docker|Terraform|Jenkins)\b',
            "tools": r'\b(?:Git|GitHub|GitLab|Jira|Confluence|Slack|Trello|Jenkins|CircleCI|Travis|Webpack|Babel)\b',
            "ai_ml": r'\b(?:TensorFlow|PyTorch|scikit-learn|Keras|OpenCV|NLTK|spaCy|Pandas|NumPy|Matplotlib)\b'
        }
        
        for category, pattern in tech_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if category not in combined_entities:
                combined_entities[category] = []
            combined_entities[category].extend(matches)
        
        # Nettoyage des doublons
        for key in combined_entities:
            combined_entities[key] = list(set(combined_entities[key]))
            
        return combined_entities

    def extract_experience_level(self, text: str) -> Dict[str, Any]:
        """
        Extraction du niveau d'expérience avec analyse avancée
        """
        # Patterns pour détecter l'expérience
        experience_patterns = {
            "years": r'(\d+)\s*(?:ans?|années?|years?)\s*(?:d[\'e]|of)?\s*(?:expérience|experience)',
            "junior": r'\b(?:junior|débutant|entry.level|stagiaire|apprenti)\b',
            "senior": r'\b(?:senior|expert|lead|principal|architect|chef)\b',
            "manager": r'\b(?:manager|directeur|responsable|supervisor|team.lead)\b'
        }
        
        experience_info = {
            "years_detected": [],
            "level_indicators": [],
            "estimated_level": "mid-level",
            "confidence": 0.5
        }
        
        text_lower = text.lower()
        
        # Détecter les années d'expérience
        years_matches = re.findall(experience_patterns["years"], text_lower, re.IGNORECASE)
        if years_matches:
            years = [int(y) for y in years_matches]
            experience_info["years_detected"] = years
            max_years = max(years)
            
            if max_years <= 2:
                experience_info["estimated_level"] = "junior"
                experience_info["confidence"] = 0.8
            elif max_years <= 5:
                experience_info["estimated_level"] = "mid-level"
                experience_info["confidence"] = 0.8
            else:
                experience_info["estimated_level"] = "senior"
                experience_info["confidence"] = 0.8
        
        # Détecter les indicateurs de niveau
        for level, pattern in experience_patterns.items():
            if level != "years":
                matches = re.findall(pattern, text_lower, re.IGNORECASE)
                if matches:
                    experience_info["level_indicators"].extend(matches)
                    if level in ["senior", "manager"]:
                        experience_info["estimated_level"] = "senior"
                        experience_info["confidence"] = max(experience_info["confidence"], 0.7)
                    elif level == "junior":
                        experience_info["estimated_level"] = "junior"
                        experience_info["confidence"] = max(experience_info["confidence"], 0.7)
        
        return experience_info

    def analyze_cv_enhanced(self, cv_text: str) -> Dict[str, Any]:
        """
        Analyse de CV améliorée avec le modèle personnalisé
        """
        analysis = {
            "entities": self.extract_entities_enhanced(cv_text),
            "experience_analysis": self.extract_experience_level(cv_text),
            "bert_embedding": self.extract_bert_embeddings(cv_text),
            "sentence_embedding": self.extract_sentence_embeddings(cv_text),
            "sentiment": self.sentiment_analyzer(cv_text[:512])[0],
            "text_length": len(cv_text),
            "word_count": len(cv_text.split()),
            "raw_text": cv_text
        }
        
        # Analyse de la qualité du CV
        quality_score = self.calculate_cv_quality(analysis)
        analysis["quality_score"] = quality_score
        
        return analysis

    def analyze_job_enhanced(self, job_text: str) -> Dict[str, Any]:
        """
        Analyse d'offre d'emploi améliorée
        """
        analysis = {
            "entities": self.extract_entities_enhanced(job_text),
            "experience_requirements": self.extract_experience_level(job_text),
            "bert_embedding": self.extract_bert_embeddings(job_text),
            "sentence_embedding": self.extract_sentence_embeddings(job_text),
            "sentiment": self.sentiment_analyzer(job_text[:512])[0],
            "text_length": len(job_text),
            "word_count": len(job_text.split()),
            "raw_text": job_text
        }
        
        # Classification du type de poste
        job_types = ["développement", "data science", "design", "management", "marketing", "commercial"]
        job_classification = self.classifier(job_text, job_types)
        analysis["job_type"] = job_classification
        
        return analysis

    def calculate_cv_quality(self, cv_analysis: Dict) -> Dict[str, float]:
        """
        Calcule un score de qualité du CV
        """
        quality_metrics = {
            "completeness": 0.0,
            "technical_depth": 0.0,
            "experience_clarity": 0.0,
            "overall_quality": 0.0
        }
        
        entities = cv_analysis["entities"]
        
        # Score de complétude (présence d'informations essentielles)
        essential_fields = ["PERSON", "SKILL", "ORG", "EDUCATION"]
        present_fields = sum(1 for field in essential_fields if entities.get(field))
        quality_metrics["completeness"] = present_fields / len(essential_fields)
        
        # Profondeur technique (nombre de compétences techniques)
        tech_skills = len(entities.get("SKILL", [])) + len(entities.get("programming", [])) + len(entities.get("frameworks", []))
        quality_metrics["technical_depth"] = min(tech_skills / 10, 1.0)  # Normalisé sur 10 compétences
        
        # Clarté de l'expérience
        exp_analysis = cv_analysis["experience_analysis"]
        quality_metrics["experience_clarity"] = exp_analysis["confidence"]
        
        # Score global
        quality_metrics["overall_quality"] = np.mean(list(quality_metrics.values())[:-1])
        
        return quality_metrics

    def extract_bert_embeddings(self, text: str) -> np.ndarray:
        """Extraction d'embeddings BERT"""
        inputs = self.bert_tokenizer(
            text, 
            return_tensors='pt', 
            max_length=512, 
            truncation=True, 
            padding=True
        )
        
        with torch.no_grad():
            outputs = self.bert_model(**inputs)
            embeddings = outputs.last_hidden_state.mean(dim=1)
            
        return embeddings.numpy().flatten()

    def extract_sentence_embeddings(self, text: str) -> np.ndarray:
        """Extraction d'embeddings avec Sentence Transformers"""
        return self.sentence_model.encode(text)

    def calculate_enhanced_similarity(self, cv_analysis: Dict, job_analysis: Dict) -> Dict[str, float]:
        """
        Calcul de similarité amélioré avec pondération intelligente
        """
        scores = {}
        
        # Similarité BERT
        bert_similarity = cosine_similarity(
            cv_analysis["bert_embedding"].reshape(1, -1),
            job_analysis["bert_embedding"].reshape(1, -1)
        )[0][0]
        scores["bert_similarity"] = float(bert_similarity)
        
        # Similarité Sentence Transformers
        sentence_similarity = cosine_similarity(
            cv_analysis["sentence_embedding"].reshape(1, -1),
            job_analysis["sentence_embedding"].reshape(1, -1)
        )[0][0]
        scores["sentence_similarity"] = float(sentence_similarity)
        
        # Similarité TF-IDF
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = vectorizer.fit_transform([cv_analysis["raw_text"], job_analysis["raw_text"]])
        tfidf_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        scores["tfidf_similarity"] = float(tfidf_similarity)
        
        # Similarité d'entités (nouveau)
        entity_similarity = self.calculate_entity_similarity(cv_analysis["entities"], job_analysis["entities"])
        scores["entity_similarity"] = entity_similarity
        
        return scores

    def calculate_entity_similarity(self, cv_entities: Dict, job_entities: Dict) -> float:
        """
        Calcule la similarité basée sur les entités extraites
        """
        important_categories = ["SKILL", "programming", "frameworks", "databases", "cloud", "tools"]
        
        similarities = []
        for category in important_categories:
            cv_set = set([item.lower() for item in cv_entities.get(category, [])])
            job_set = set([item.lower() for item in job_entities.get(category, [])])
            
            if len(job_set) > 0:
                intersection = len(cv_set.intersection(job_set))
                union = len(cv_set.union(job_set))
                jaccard = intersection / union if union > 0 else 0
                similarities.append(jaccard)
        
        return np.mean(similarities) if similarities else 0.0

    def generate_enhanced_ats_score(self, cv_text: str, job_text: str) -> Dict[str, Any]:
        """
        Génération du score ATS amélioré avec le modèle personnalisé
        """
        print("🔍 Analyse CV améliorée...")
        cv_analysis = self.analyze_cv_enhanced(cv_text)
        
        print("📋 Analyse offre d'emploi améliorée...")
        job_analysis = self.analyze_job_enhanced(job_text)
        
        print("⚖️ Calcul des similarités améliorées...")
        similarity_scores = self.calculate_enhanced_similarity(cv_analysis, job_analysis)
        
        print("🎯 Matching des compétences avancé...")
        skill_matches = self.calculate_skill_match_enhanced(cv_analysis["entities"], job_analysis["entities"])
        
        # Calcul du score global ATS avec pondération améliorée
        weights = {
            "bert_similarity": 0.25,
            "sentence_similarity": 0.25,
            "tfidf_similarity": 0.15,
            "entity_similarity": 0.20,
            "skill_average": 0.15
        }
        
        skill_average = np.mean(list(skill_matches.values())) if skill_matches else 0.0
        
        ats_score = (
            similarity_scores["bert_similarity"] * weights["bert_similarity"] +
            similarity_scores["sentence_similarity"] * weights["sentence_similarity"] +
            similarity_scores["tfidf_similarity"] * weights["tfidf_similarity"] +
            similarity_scores["entity_similarity"] * weights["entity_similarity"] +
            skill_average * weights["skill_average"]
        ) * 100
        
        return {
            "ats_score": round(ats_score, 2),
            "similarity_scores": similarity_scores,
            "skill_matches": skill_matches,
            "cv_analysis": {
                "entities": cv_analysis["entities"],
                "experience_analysis": cv_analysis["experience_analysis"],
                "quality_score": cv_analysis["quality_score"],
                "sentiment": cv_analysis["sentiment"]
            },
            "job_analysis": {
                "entities": job_analysis["entities"],
                "experience_requirements": job_analysis["experience_requirements"],
                "job_type": job_analysis["job_type"],
                "sentiment": job_analysis["sentiment"]
            },
            "recommendations": self.generate_enhanced_recommendations(cv_analysis, job_analysis, skill_matches)
        }

    def calculate_skill_match_enhanced(self, cv_entities: Dict, job_entities: Dict) -> Dict[str, float]:
        """
        Calcul de matching des compétences amélioré
        """
        skill_categories = ["SKILL", "programming", "frameworks", "databases", "cloud", "tools", "ai_ml"]
        skill_matches = {}
        
        for category in skill_categories:
            cv_skills = set([skill.lower() for skill in cv_entities.get(category, [])])
            job_skills = set([skill.lower() for skill in job_entities.get(category, [])])
            
            if len(job_skills) > 0:
                intersection = len(cv_skills.intersection(job_skills))
                match_percentage = intersection / len(job_skills)
                skill_matches[category] = round(match_percentage, 3)
            else:
                skill_matches[category] = 0.0
        
        return skill_matches

    def generate_enhanced_recommendations(self, cv_analysis: Dict, job_analysis: Dict, skill_matches: Dict) -> List[str]:
        """
        Génération de recommandations améliorées
        """
        recommendations = []
        
        # Recommandations basées sur les compétences manquantes
        for category, match_score in skill_matches.items():
            if match_score < 0.5:
                missing_skills = set(job_analysis["entities"].get(category, [])) - set(cv_analysis["entities"].get(category, []))
                if missing_skills:
                    recommendations.append(
                        f"Ajouter les compétences {category}: {', '.join(list(missing_skills)[:3])}"
                    )
        
        # Recommandations basées sur la qualité du CV
        quality = cv_analysis["quality_score"]
        if quality["completeness"] < 0.7:
            recommendations.append("Compléter les informations manquantes (formation, expérience, compétences)")
        
        if quality["technical_depth"] < 0.5:
            recommendations.append("Détailler davantage vos compétences techniques et projets")
        
        # Recommandations basées sur l'expérience
        cv_exp = cv_analysis["experience_analysis"]
        job_exp = job_analysis["experience_requirements"]
        
        if cv_exp["estimated_level"] == "junior" and "senior" in job_exp["level_indicators"]:
            recommendations.append("Mettre en avant vos projets et réalisations pour compenser le manque d'expérience")
        
        return recommendations[:5]

# Fonction utilitaire pour l'intégration
def get_enhanced_ats_system():
    """Retourne une instance du système ATS amélioré"""
    return EnhancedATSSystem()

if __name__ == "__main__":
    # Test du système amélioré
    ats = EnhancedATSSystem()
    
    cv_test = """
    أحمد بن علي
    Développeur Full Stack Senior
    
    Expérience: 5 ans de développement avec Python, React, Node.js
    Formation: Master en Informatique, ENSI Tunis
    Compétences: Docker, Kubernetes, AWS, PostgreSQL, MongoDB
    Langues: Arabe (natif), Français (courant), Anglais (professionnel)
    """
    
    job_test = """
    Recherche Développeur Full Stack Senior
    Compétences requises: Python, React, Node.js, Docker, AWS
    Expérience: 3-5 ans minimum
    Formation: Master en Informatique ou équivalent
    """
    
    result = ats.generate_enhanced_ats_score(cv_test, job_test)
    print(f"\nScore ATS: {result['ats_score']}")
    print(f"Recommandations: {result['recommendations']}")
