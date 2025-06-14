import pytesseract
from PIL import Image
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import io
import base64
from typing import Dict, Any, List, Tuple

class CVImageAnalyzer:
    def __init__(self):
        """
        Initialise l'analyseur d'images CV avec les modèles nécessaires
        """
        print("🚀 Initialisation de l'analyseur d'images CV...")
        
        # Chargement du modèle Sentence-BERT
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ Modèle Sentence-BERT chargé avec succès")
        except Exception as e:
            print(f"⚠️ Erreur lors du chargement du modèle: {str(e)}")
            raise e
            
        # Configuration de pytesseract
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Décommenter et ajuster si nécessaire
        
        # Mots-clés par catégorie pour l'analyse
        self.skill_keywords = {
            "programmation": ["python", "java", "javascript", "typescript", "c++", "c#", "php", "ruby", "go", "rust", "swift"],
            "frameworks": ["react", "angular", "vue", "django", "flask", "spring", "laravel", "rails", "express"],
            "data_science": ["machine learning", "deep learning", "nlp", "data mining", "statistiques", "tensorflow", "pytorch", "keras"],
            "databases": ["sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "oracle", "sqlite"],
            "cloud": ["aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform"],
            "soft_skills": ["communication", "travail d'équipe", "leadership", "gestion de projet", "résolution de problèmes"]
        }
        
        print("✅ Analyseur d'images CV initialisé avec succès")

    def extract_text_from_image(self, image_data: bytes) -> str:
        """
        Extrait le texte d'une image CV
        
        Args:
            image_data: Données binaires de l'image
            
        Returns:
            Texte extrait de l'image
        """
        try:
            img = Image.open(io.BytesIO(image_data))
            # Essayer d'abord en français, puis en anglais si échec
            try:
                text = pytesseract.image_to_string(img, lang='fra')
            except:
                text = pytesseract.image_to_string(img, lang='eng')
                
            return text
        except Exception as e:
            print(f"⚠️ Erreur lors de l'extraction du texte: {str(e)}")
            return ""

    def extract_text_from_base64(self, base64_image: str) -> str:
        """
        Extrait le texte d'une image CV encodée en base64
        
        Args:
            base64_image: Image encodée en base64
            
        Returns:
            Texte extrait de l'image
        """
        try:
            # Supprimer le préfixe data:image/... si présent
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
                
            image_data = base64.b64decode(base64_image)
            return self.extract_text_from_image(image_data)
        except Exception as e:
            print(f"⚠️ Erreur lors du décodage base64: {str(e)}")
            return ""

    def clean_text(self, text: str) -> str:
        """
        Nettoie le texte extrait
        
        Args:
            text: Texte à nettoyer
            
        Returns:
            Texte nettoyé
        """
        text = text.lower()
        text = re.sub(r'[^a-zàâçéèêëîïôûùüÿñæœ\s]', ' ', text)  # garder lettres et espaces
        text = re.sub(r'\s+', ' ', text)  # supprimer espaces multiples
        return text.strip()

    def get_embedding(self, text: str) -> np.ndarray:
        """
        Génère l'embedding d'un texte
        
        Args:
            text: Texte à encoder
            
        Returns:
            Embedding du texte
        """
        return self.model.encode([text])

    def compute_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Calcule la similarité cosinus entre deux embeddings
        
        Args:
            emb1: Premier embedding
            emb2: Deuxième embedding
            
        Returns:
            Score de similarité entre 0 et 1
        """
        return float(cosine_similarity(emb1, emb2)[0][0])

    def extract_skills(self, text: str) -> Dict[str, List[str]]:
        """
        Extrait les compétences du texte par catégorie
        
        Args:
            text: Texte à analyser
            
        Returns:
            Dictionnaire des compétences par catégorie
        """
        text_lower = text.lower()
        found_skills = {category: [] for category in self.skill_keywords}
        
        for category, keywords in self.skill_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_skills[category].append(keyword)
        
        return found_skills

    def extract_education(self, text: str) -> List[str]:
        """
        Extrait les informations d'éducation
        
        Args:
            text: Texte à analyser
            
        Returns:
            Liste des formations détectées
        """
        education_keywords = ["diplôme", "master", "licence", "bac", "doctorat", "ingénieur", 
                             "université", "école", "formation", "certificat", "bts", "dut"]
        
        education = []
        lines = text.split('\n')
        
        for line in lines:
            if any(keyword in line.lower() for keyword in education_keywords):
                education.append(line.strip())
                
        return education

    def extract_experience(self, text: str) -> List[str]:
        """
        Extrait les expériences professionnelles
        
        Args:
            text: Texte à analyser
            
        Returns:
            Liste des expériences détectées
        """
        experience_keywords = ["expérience", "travail", "emploi", "poste", "stage", "projet", 
                              "responsable", "manager", "développeur", "ingénieur", "consultant"]
        
        experiences = []
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in experience_keywords):
                exp = line.strip()
                # Essayer d'inclure la ligne suivante pour plus de contexte
                if i + 1 < len(lines) and len(lines[i + 1].strip()) > 0:
                    exp += " " + lines[i + 1].strip()
                experiences.append(exp)
                
        return experiences

    def analyze_cv_image(self, image_data: bytes, job_description: str) -> Dict[str, Any]:
        """
        Analyse complète d'une image CV par rapport à une description de poste
        
        Args:
            image_data: Données binaires de l'image CV
            job_description: Description du poste
            
        Returns:
            Résultats de l'analyse
        """
        # Extraction du texte
        cv_text = self.extract_text_from_image(image_data)
        if not cv_text:
            return {"error": "Impossible d'extraire le texte de l'image"}
            
        # Nettoyage des textes
        cv_text_clean = self.clean_text(cv_text)
        job_desc_clean = self.clean_text(job_description)
        
        # Génération des embeddings
        emb_cv = self.get_embedding(cv_text_clean)
        emb_job = self.get_embedding(job_desc_clean)
        
        # Calcul de la similarité globale
        similarity_score = self.compute_similarity(emb_cv, emb_job)
        
        # Extraction des compétences
        cv_skills = self.extract_skills(cv_text)
        job_skills = self.extract_skills(job_description)
        
        # Calcul du matching de compétences par catégorie
        skill_matches = {}
        for category in self.skill_keywords:
            cv_category_skills = set(cv_skills[category])
            job_category_skills = set(job_skills[category])
            
            if job_category_skills:
                match_score = len(cv_category_skills.intersection(job_category_skills)) / len(job_category_skills)
                skill_matches[category] = match_score
            else:
                skill_matches[category] = 0.0
        
        # Extraction d'éducation et expérience
        education = self.extract_education(cv_text)
        experience = self.extract_experience(cv_text)
        
        # Calcul du score global (pondéré)
        weights = {
            "similarity": 0.4,
            "skills": 0.4,
            "education": 0.1,
            "experience": 0.1
        }
        
        skill_score = sum(skill_matches.values()) / len(skill_matches) if skill_matches else 0
        education_score = min(len(education) / 2, 1.0)  # Plafonné à 1.0
        experience_score = min(len(experience) / 3, 1.0)  # Plafonné à 1.0
        
        global_score = (
            similarity_score * weights["similarity"] +
            skill_score * weights["skills"] +
            education_score * weights["education"] +
            experience_score * weights["experience"]
        ) * 100
        
        # Préparation des résultats
        return {
            "global_score": round(global_score, 2),
            "similarity_score": round(similarity_score * 100, 2),
            "skill_matches": {k: round(v * 100, 2) for k, v in skill_matches.items()},
            "extracted_text": cv_text[:1000] + "..." if len(cv_text) > 1000 else cv_text,
            "skills": cv_skills,
            "education": education,
            "experience": experience,
            "recommendations": self.generate_recommendations(cv_skills, job_skills, similarity_score)
        }

    def analyze_cv_base64(self, base64_image: str, job_description: str) -> Dict[str, Any]:
        """
        Analyse complète d'une image CV encodée en base64
        
        Args:
            base64_image: Image CV encodée en base64
            job_description: Description du poste
            
        Returns:
            Résultats de l'analyse
        """
        try:
            # Supprimer le préfixe data:image/... si présent
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
                
            image_data = base64.b64decode(base64_image)
            return self.analyze_cv_image(image_data, job_description)
        except Exception as e:
            print(f"⚠️ Erreur lors de l'analyse base64: {str(e)}")
            return {"error": str(e)}

    def generate_recommendations(self, cv_skills: Dict[str, List[str]], job_skills: Dict[str, List[str]], 
                               similarity_score: float) -> List[str]:
        """
        Génère des recommandations pour améliorer le CV
        
        Args:
            cv_skills: Compétences extraites du CV
            job_skills: Compétences extraites de l'offre d'emploi
            similarity_score: Score de similarité global
            
        Returns:
            Liste de recommandations
        """
        recommendations = []
        
        # Recommandations basées sur les compétences manquantes
        for category, skills in job_skills.items():
            if skills:
                missing_skills = set(skills) - set(cv_skills[category])
                if missing_skills:
                    if category == "programmation":
                        recommendations.append(f"Ajouter des compétences en programmation: {', '.join(missing_skills)}")
                    elif category == "frameworks":
                        recommendations.append(f"Mentionner l'expérience avec les frameworks: {', '.join(missing_skills)}")
                    elif category == "data_science":
                        recommendations.append(f"Ajouter des compétences en data science: {', '.join(missing_skills)}")
                    elif category == "databases":
                        recommendations.append(f"Mentionner l'expérience avec les bases de données: {', '.join(missing_skills)}")
                    elif category == "cloud":
                        recommendations.append(f"Ajouter des compétences cloud: {', '.join(missing_skills)}")
                    elif category == "soft_skills":
                        recommendations.append(f"Mettre en avant les soft skills: {', '.join(missing_skills)}")
        
        # Recommandations générales basées sur le score
        if similarity_score < 0.4:
            recommendations.append("Le CV ne correspond pas bien au poste. Envisagez de le personnaliser davantage.")
        elif similarity_score < 0.6:
            recommendations.append("Améliorer la correspondance en ajoutant plus de mots-clés de l'offre d'emploi.")
        
        # Limiter le nombre de recommandations
        return recommendations[:5]
