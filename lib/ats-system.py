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
warnings.filterwarnings('ignore')

class ATSSystem:
    def __init__(self):
        """
        Initialise le système ATS avec tous les modèles nécessaires
        """
        print("🚀 Initialisation du système ATS...")
        
        # Chargement des modèles SpaCy
        try:
            self.nlp_fr = spacy.load("fr_core_news_sm")
        except:
            print("⚠️ Modèle français non trouvé, utilisation du modèle anglais")
            self.nlp_fr = spacy.load("en_core_web_sm")
            
        self.nlp_en = spacy.load("en_core_web_sm")
        
        # Modèles BERT et transformers
        self.bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.bert_model = BertModel.from_pretrained('bert-base-uncased')
        
        # Sentence Transformers pour les embeddings sémantiques
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Pipeline pour l'analyse de sentiment
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest"
        )
        
        # Pipeline pour la classification de texte
        self.classifier = pipeline(
            "zero-shot-classification",
            model="facebook/bart-large-mnli"
        )
        
        # Modèle pour l'extraction d'entités techniques
        self.tech_ner = pipeline(
            "ner",
            model="dslim/bert-base-NER",
            aggregation_strategy="simple"
        )
        
        print("✅ Tous les modèles sont chargés avec succès!")

    def extract_entities_spacy(self, text: str, language: str = "fr") -> Dict[str, List[str]]:
        """
        Extraction d'entités nommées avec SpaCy
        """
        nlp = self.nlp_fr if language == "fr" else self.nlp_en
        doc = nlp(text)
        
        entities = {
            "PERSON": [],
            "ORG": [],
            "GPE": [],  # Lieux géopolitiques
            "MONEY": [],
            "DATE": [],
            "SKILLS": [],
            "TECHNOLOGIES": []
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                entities[ent.label_].append(ent.text.strip())
        
        # Extraction de compétences techniques avec regex
        tech_patterns = [
            r'\b(?:Python|Java|JavaScript|React|Angular|Vue|Node\.js|Django|Flask|SQL|MongoDB|PostgreSQL|MySQL|Docker|Kubernetes|AWS|Azure|GCP|Git|Linux|Windows|MacOS)\b',
            r'\b(?:HTML|CSS|PHP|Ruby|Go|Rust|C\+\+|C#|Swift|Kotlin|Scala|R|MATLAB|Tableau|Power BI|Excel|Photoshop|Illustrator)\b'
        ]
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            entities["TECHNOLOGIES"].extend(matches)
        
        # Nettoyage des doublons
        for key in entities:
            entities[key] = list(set(entities[key]))
            
        return entities

    def extract_bert_embeddings(self, text: str) -> np.ndarray:
        """
        Extraction d'embeddings BERT
        """
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
        """
        Extraction d'embeddings avec Sentence Transformers
        """
        return self.sentence_model.encode(text)

    def extract_skills_and_requirements(self, text: str) -> Dict[str, List[str]]:
        """
        Extraction avancée de compétences et exigences
        """
        # Patterns pour différents types de compétences
        skill_patterns = {
            "languages": r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB|SQL)\b',
            "frameworks": r'\b(?:React|Angular|Vue|Django|Flask|Spring|Laravel|Rails|Express|FastAPI|Node\.js)\b',
            "databases": r'\b(?:MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Oracle|SQLite|Cassandra|DynamoDB)\b',
            "cloud": r'\b(?:AWS|Azure|GCP|Google Cloud|Heroku|DigitalOcean|Kubernetes|Docker|Terraform)\b',
            "tools": r'\b(?:Git|GitHub|GitLab|Jira|Confluence|Slack|Trello|Jenkins|CircleCI|Travis)\b',
            "soft_skills": r'\b(?:leadership|communication|teamwork|problem.solving|analytical|creative|innovative|adaptable)\b'
        }
        
        extracted_skills = {}
        for category, pattern in skill_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            extracted_skills[category] = list(set(matches))
        
        # Extraction avec le modèle NER technique
        try:
            tech_entities = self.tech_ner(text)
            tech_skills = [ent['word'] for ent in tech_entities if ent['entity_group'] in ['MISC', 'ORG']]
            extracted_skills['technical_entities'] = list(set(tech_skills))
        except:
            extracted_skills['technical_entities'] = []
        
        return extracted_skills

    def analyze_job_posting(self, job_text: str) -> Dict[str, Any]:
        """
        Analyse complète d'une offre d'emploi
        """
        analysis = {
            "entities": self.extract_entities_spacy(job_text),
            "skills": self.extract_skills_and_requirements(job_text),
            "bert_embedding": self.extract_bert_embeddings(job_text),
            "sentence_embedding": self.extract_sentence_embeddings(job_text),
            "sentiment": self.sentiment_analyzer(job_text[:512])[0],
            "text_length": len(job_text),
            "raw_text": job_text
        }
        
        # Classification du niveau d'expérience requis
        experience_labels = ["junior", "mid-level", "senior", "executive"]
        exp_classification = self.classifier(job_text, experience_labels)
        analysis["experience_level"] = exp_classification
        
        return analysis

    def analyze_cv(self, cv_text: str) -> Dict[str, Any]:
        """
        Analyse complète d'un CV
        """
        analysis = {
            "entities": self.extract_entities_spacy(cv_text),
            "skills": self.extract_skills_and_requirements(cv_text),
            "bert_embedding": self.extract_bert_embeddings(cv_text),
            "sentence_embedding": self.extract_sentence_embeddings(cv_text),
            "sentiment": self.sentiment_analyzer(cv_text[:512])[0],
            "text_length": len(cv_text),
            "raw_text": cv_text
        }
        
        return analysis

    def calculate_similarity_scores(self, cv_analysis: Dict, job_analysis: Dict) -> Dict[str, float]:
        """
        Calcul des scores de similarité entre CV et offre d'emploi
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
        
        return scores

    def calculate_skill_match(self, cv_skills: Dict, job_skills: Dict) -> Dict[str, float]:
        """
        Calcul du matching des compétences
        """
        skill_matches = {}
        
        for skill_category in job_skills:
            if skill_category in cv_skills:
                job_set = set([skill.lower() for skill in job_skills[skill_category]])
                cv_set = set([skill.lower() for skill in cv_skills[skill_category]])
                
                if len(job_set) > 0:
                    intersection = len(job_set.intersection(cv_set))
                    match_percentage = intersection / len(job_set)
                    skill_matches[skill_category] = match_percentage
                else:
                    skill_matches[skill_category] = 0.0
            else:
                skill_matches[skill_category] = 0.0
        
        return skill_matches

    def generate_ats_score(self, cv_text: str, job_text: str) -> Dict[str, Any]:
        """
        Génération du score ATS complet
        """
        print("🔍 Analyse du CV...")
        cv_analysis = self.analyze_cv(cv_text)
        
        print("📋 Analyse de l'offre d'emploi...")
        job_analysis = self.analyze_job_posting(job_text)
        
        print("⚖️ Calcul des similarités...")
        similarity_scores = self.calculate_similarity_scores(cv_analysis, job_analysis)
        
        print("🎯 Matching des compétences...")
        skill_matches = self.calculate_skill_match(cv_analysis["skills"], job_analysis["skills"])
        
        # Calcul du score global ATS (pondéré)
        weights = {
            "bert_similarity": 0.3,
            "sentence_similarity": 0.3,
            "tfidf_similarity": 0.2,
            "skill_average": 0.2
        }
        
        skill_average = np.mean(list(skill_matches.values())) if skill_matches else 0.0
        
        ats_score = (
            similarity_scores["bert_similarity"] * weights["bert_similarity"] +
            similarity_scores["sentence_similarity"] * weights["sentence_similarity"] +
            similarity_scores["tfidf_similarity"] * weights["tfidf_similarity"] +
            skill_average * weights["skill_average"]
        ) * 100
        
        return {
            "ats_score": round(ats_score, 2),
            "similarity_scores": similarity_scores,
            "skill_matches": skill_matches,
            "cv_analysis": {
                "entities": cv_analysis["entities"],
                "skills": cv_analysis["skills"],
                "sentiment": cv_analysis["sentiment"]
            },
            "job_analysis": {
                "entities": job_analysis["entities"],
                "skills": job_analysis["skills"],
                "sentiment": job_analysis["sentiment"],
                "experience_level": job_analysis["experience_level"]
            },
            "recommendations": self.generate_recommendations(cv_analysis, job_analysis, skill_matches)
        }

    def generate_recommendations(self, cv_analysis: Dict, job_analysis: Dict, skill_matches: Dict) -> List[str]:
        """
        Génération de recommandations pour améliorer le matching
        """
        recommendations = []
        
        # Recommandations basées sur les compétences manquantes
        for skill_category, match_score in skill_matches.items():
            if match_score < 0.5:
                missing_skills = set(job_analysis["skills"][skill_category]) - set(cv_analysis["skills"][skill_category])
                if missing_skills:
                    recommendations.append(
                        f"Ajouter les compétences {skill_category}: {', '.join(list(missing_skills)[:3])}"
                    )
        
        # Recommandations générales
        if len(cv_analysis["raw_text"]) < 500:
            recommendations.append("Développer davantage le contenu du CV pour plus de détails")
        
        if cv_analysis["sentiment"]["label"] == "NEGATIVE":
            recommendations.append("Utiliser un langage plus positif dans le CV")
        
        return recommendations[:5]  # Limiter à 5 recommandations
