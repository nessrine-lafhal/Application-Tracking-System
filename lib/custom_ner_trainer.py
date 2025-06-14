import spacy
from spacy.tokens import DocBin
from spacy.training.example import Example
from spacy.util import minibatch, compounding
import random
import warnings
import json
import os
from typing import List, Tuple, Dict, Any

warnings.filterwarnings("ignore")

class CustomNERTrainer:
    def __init__(self, model_name="ner_recruitment_model"):
        self.model_name = model_name
        self.model_path = f"models/{model_name}"
        
        # Données d'entraînement spécifiques au recrutement avec noms arabes
        self.training_data = [
            # Candidats avec noms arabes
            ("أحمد بن علي est un développeur Python avec 5 ans d'expérience chez Google.", {
                "entities": [(0, 12, "PERSON"), (29, 35, "SKILL"), (58, 64, "ORG")]
            }),
            ("فاطمة المنصوري a des compétences en React et Angular, elle a travaillé chez Microsoft.", {
                "entities": [(0, 14, "PERSON"), (38, 43, "SKILL"), (47, 54, "SKILL"), (78, 87, "ORG")]
            }),
            ("محمد الطرابلسي maîtrise Java, Spring Boot et a une expérience de 3 ans chez IBM.", {
                "entities": [(0, 14, "PERSON"), (24, 28, "SKILL"), (30, 41, "SKILL"), (74, 77, "ORG")]
            }),
            ("زينب الحمامي est spécialisée en Data Science et Machine Learning chez Amazon.", {
                "entities": [(0, 12, "PERSON"), (32, 44, "SKILL"), (48, 64, "SKILL"), (70, 76, "ORG")]
            }),
            ("عمر بن يوسف développe des applications mobiles avec Flutter et React Native.", {
                "entities": [(0, 11, "PERSON"), (55, 62, "SKILL"), (66, 78, "SKILL")]
            }),
            
            # Compétences techniques
            ("Expérience avec Docker, Kubernetes et AWS pour le déploiement cloud.", {
                "entities": [(16, 22, "SKILL"), (24, 34, "SKILL"), (38, 41, "SKILL")]
            }),
            ("Maîtrise de PostgreSQL, MongoDB et Redis pour la gestion de données.", {
                "entities": [(12, 22, "SKILL"), (24, 31, "SKILL"), (35, 40, "SKILL")]
            }),
            ("Compétences en TensorFlow, PyTorch et scikit-learn pour l'IA.", {
                "entities": [(15, 25, "SKILL"), (27, 34, "SKILL"), (38, 50, "SKILL")]
            }),
            
            # Entreprises et organisations
            ("Il a travaillé chez TechCorp, StartupTN et Université de Tunis.", {
                "entities": [(20, 28, "ORG"), (30, 39, "ORG"), (43, 63, "ORG")]
            }),
            ("Formation à l'ENSI, ESPRIT et École Polytechnique de Tunisie.", {
                "entities": [(15, 19, "ORG"), (21, 27, "ORG"), (31, 61, "ORG")]
            }),
            
            # Lieux
            ("Basé à Tunis, disponible pour missions à Sfax et Sousse.", {
                "entities": [(7, 12, "LOC"), (42, 46, "LOC"), (50, 56, "LOC")]
            }),
            ("Expérience internationale: Paris, Londres et Dubai.", {
                "entities": [(31, 36, "LOC"), (38, 45, "LOC"), (49, 54, "LOC")]
            }),
            
            # Certifications et diplômes
            ("Certifié AWS Solutions Architect et Google Cloud Professional.", {
                "entities": [(9, 33, "CERTIFICATION"), (37, 62, "CERTIFICATION")]
            }),
            ("Diplôme d'Ingénieur en Informatique et Master en Data Science.", {
                "entities": [(8, 34, "EDUCATION"), (38, 62, "EDUCATION")]
            }),
            
            # Projets et réalisations
            ("Développement d'une plateforme e-commerce avec React et Node.js.", {
                "entities": [(51, 56, "SKILL"), (60, 67, "SKILL")]
            }),
            ("Création d'un système de recommandation basé sur Machine Learning.", {
                "entities": [(49, 66, "SKILL")]
            }),
            
            # Soft skills
            ("Excellentes compétences en communication, leadership et travail d'équipe.", {
                "entities": [(27, 40, "SOFT_SKILL"), (42, 52, "SOFT_SKILL"), (56, 72, "SOFT_SKILL")]
            }),
            ("Capacité d'adaptation, résolution de problèmes et pensée analytique.", {
                "entities": [(0, 21, "SOFT_SKILL"), (23, 46, "SOFT_SKILL"), (50, 67, "SOFT_SKILL")]
            }),
            
            # Langues
            ("Parle couramment Arabe, Français et Anglais.", {
                "entities": [(17, 22, "LANGUAGE"), (24, 32, "LANGUAGE"), (36, 43, "LANGUAGE")]
            }),
            ("Niveau natif en Arabe, professionnel en Anglais et intermédiaire en Allemand.", {
                "entities": [(16, 21, "LANGUAGE"), (40, 47, "LANGUAGE"), (68, 76, "LANGUAGE")]
            }),
        ]

    def create_ner_model(self):
        """Crée et entraîne un modèle NER personnalisé"""
        print("🚀 Création du modèle NER personnalisé...")
        
        # Créer un modèle vide
        nlp = spacy.blank("fr")  # Utiliser français comme base
        
        # Ajouter le composant NER
        ner = nlp.add_pipe("ner", last=True)
        
        # Ajouter toutes les étiquettes
        labels = ["PERSON", "SKILL", "ORG", "LOC", "CERTIFICATION", "EDUCATION", 
                 "SOFT_SKILL", "LANGUAGE", "PRODUCT", "EXPERIENCE"]
        
        for label in labels:
            ner.add_label(label)
        
        # Ajouter les étiquettes trouvées dans les données d'entraînement
        for _, annotations in self.training_data:
            for ent in annotations.get("entities", []):
                ner.add_label(ent[2])
        
        return nlp

    def train_model(self, iterations=20):
        """Entraîne le modèle NER"""
        print(f"🎯 Entraînement du modèle sur {len(self.training_data)} exemples...")
        
        nlp = self.create_ner_model()
        
        # Initialiser l'optimiseur
        nlp.initialize()
        
        # Entraînement
        for i in range(iterations):
            random.shuffle(self.training_data)
            losses = {}
            
            # Créer des batches
            batches = minibatch(self.training_data, size=compounding(2.0, 16.0, 1.5))
            
            for batch in batches:
                examples = []
                for text, annotations in batch:
                    doc = nlp.make_doc(text)
                    examples.append(Example.from_dict(doc, annotations))
                
                nlp.update(examples, drop=0.2, losses=losses)
            
            print(f"Itération {i+1}/{iterations} - Pertes: {losses}")
        
        # Créer le dossier models s'il n'existe pas
        os.makedirs("models", exist_ok=True)
        
        # Sauvegarder le modèle
        nlp.to_disk(self.model_path)
        print(f"✅ Modèle sauvegardé dans {self.model_path}")
        
        return nlp

    def load_model(self):
        """Charge le modèle entraîné"""
        try:
            nlp = spacy.load(self.model_path)
            print(f"✅ Modèle chargé depuis {self.model_path}")
            return nlp
        except OSError:
            print(f"❌ Modèle non trouvé dans {self.model_path}")
            print("🔄 Entraînement d'un nouveau modèle...")
            return self.train_model()

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extrait les entités d'un texte avec le modèle personnalisé"""
        nlp = self.load_model()
        doc = nlp(text)
        
        entities = {
            "PERSON": [],
            "SKILL": [],
            "ORG": [],
            "LOC": [],
            "CERTIFICATION": [],
            "EDUCATION": [],
            "SOFT_SKILL": [],
            "LANGUAGE": [],
            "PRODUCT": [],
            "EXPERIENCE": []
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                entities[ent.label_].append(ent.text.strip())
        
        # Nettoyer les doublons
        for key in entities:
            entities[key] = list(set(entities[key]))
        
        return entities

    def test_model(self, test_texts: List[str] = None):
        """Teste le modèle sur des exemples"""
        if test_texts is None:
            test_texts = [
                "أحمد بن علي est un développeur Python expérimenté chez Google à Tunis.",
                "فاطمة المنصوري maîtrise React, Angular et a un Master en Informatique.",
                "Compétences: Docker, Kubernetes, AWS, leadership et communication.",
                "Certifié AWS Solutions Architect, parle Arabe, Français et Anglais."
            ]
        
        nlp = self.load_model()
        
        print("\n🧪 Test du modèle NER personnalisé:")
        print("=" * 50)
        
        for text in test_texts:
            print(f"\nTexte: {text}")
            doc = nlp(text)
            
            if doc.ents:
                print("Entités détectées:")
                for ent in doc.ents:
                    print(f"  - {ent.text} ({ent.label_})")
            else:
                print("  Aucune entité détectée")

    def add_training_data(self, new_data: List[Tuple[str, Dict]]):
        """Ajoute de nouvelles données d'entraînement"""
        self.training_data.extend(new_data)
        print(f"✅ {len(new_data)} nouveaux exemples ajoutés")

    def retrain_model(self, new_data: List[Tuple[str, Dict]] = None):
        """Réentraîne le modèle avec de nouvelles données"""
        if new_data:
            self.add_training_data(new_data)
        
        print("🔄 Réentraînement du modèle...")
        return self.train_model()

# Fonction utilitaire pour l'intégration avec l'ATS
def get_recruitment_ner_model():
    """Retourne une instance du modèle NER pour le recrutement"""
    trainer = CustomNERTrainer()
    return trainer.load_model()

def extract_recruitment_entities(text: str) -> Dict[str, List[str]]:
    """Extrait les entités spécifiques au recrutement d'un texte"""
    trainer = CustomNERTrainer()
    return trainer.extract_entities(text)

# Exécution principale pour l'entraînement
if __name__ == "__main__":
    trainer = CustomNERTrainer()
    
    # Entraîner le modèle
    trainer.train_model()
    
    # Tester le modèle
    trainer.test_model()
