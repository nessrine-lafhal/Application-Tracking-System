import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer, AutoProcessor
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
import pytesseract
import json
import os
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime
import hashlib
import pickle
from sklearn.metrics.pairwise import cosine_similarity
import easyocr
from dataclasses import dataclass

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DocumentFeatures:
    """Structure pour stocker les caractéristiques d'un document"""
    text_content: str
    layout_embedding: np.ndarray
    visual_features: np.ndarray
    ocr_confidence: float
    document_type: str
    metadata: Dict

class DocumentClassifier:
    """Classificateur de documents utilisant LayoutLM et OCR"""
    
    def __init__(self, model_name="microsoft/layoutlm-base-uncased"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Utilisation du device: {self.device}")
        
        # Chargement du modèle LayoutLM
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.to(self.device)
        
        # Configuration OCR
        self.ocr_reader = easyocr.Reader(['fr', 'ar', 'en'])
        
        # Types de documents supportés
        self.document_types = {
            'bac': ['baccalauréat', 'diplôme', 'académie', 'mention'],
            'cin': ['carte', 'identité', 'nationale', 'cin', 'cni'],
            'master': ['master', 'magistère', 'université', 'faculté'],
            'doctorat': ['doctorat', 'thèse', 'phd', 'docteur'],
            'permis': ['permis', 'conduire', 'transport', 'véhicule'],
            'licence': ['licence', 'bachelor', 'université', 'grade']
        }
        
        # Modèle de classification personnalisé
        self.classifier = self._build_classifier()
        
    def _build_classifier(self):
        """Construction du modèle de classification"""
        class DocumentTypeClassifier(nn.Module):
            def __init__(self, input_dim=768, hidden_dim=256, num_classes=6):
                super().__init__()
                self.classifier = nn.Sequential(
                    nn.Linear(input_dim, hidden_dim),
                    nn.ReLU(),
                    nn.Dropout(0.3),
                    nn.Linear(hidden_dim, hidden_dim // 2),
                    nn.ReLU(),
                    nn.Dropout(0.2),
                    nn.Linear(hidden_dim // 2, num_classes)
                )
            
            def forward(self, x):
                return self.classifier(x)
        
        return DocumentTypeClassifier().to(self.device)
    
    def extract_text_and_layout(self, image_path: str) -> Tuple[str, List[Dict]]:
        """Extraction du texte et des informations de layout"""
        try:
            # OCR avec EasyOCR
            results = self.ocr_reader.readtext(image_path, detail=1)
            
            text_content = ""
            layout_info = []
            
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Seuil de confiance
                    text_content += text + " "
                    
                    # Normalisation des coordonnées de bbox
                    x_coords = [point[0] for point in bbox]
                    y_coords = [point[1] for point in bbox]
                    
                    layout_info.append({
                        'text': text,
                        'bbox': [min(x_coords), min(y_coords), max(x_coords), max(y_coords)],
                        'confidence': confidence
                    })
            
            return text_content.strip(), layout_info
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction OCR: {e}")
            return "", []
    
    def get_layoutlm_embeddings(self, text: str, layout_info: List[Dict]) -> np.ndarray:
        """Génération des embeddings LayoutLM"""
        try:
            # Tokenisation
            tokens = self.tokenizer.tokenize(text[:512])  # Limitation à 512 tokens
            token_ids = self.tokenizer.convert_tokens_to_ids(tokens)
            
            # Création des bounding boxes pour chaque token
            bbox = []
            for token in tokens:
                if layout_info:
                    # Attribution simplifiée des bbox aux tokens
                    bbox.append([0, 0, 100, 100])  # Bbox par défaut
                else:
                    bbox.append([0, 0, 0, 0])
            
            # Préparation des inputs
            inputs = {
                'input_ids': torch.tensor([token_ids]).to(self.device),
                'bbox': torch.tensor([bbox]).to(self.device),
                'attention_mask': torch.ones(1, len(token_ids)).to(self.device)
            }
            
            # Inférence
            with torch.no_grad():
                outputs = self.model(**inputs)
                embeddings = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
            
            return embeddings[0]
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération des embeddings: {e}")
            return np.zeros(768)
    
    def extract_visual_features(self, image_path: str) -> np.ndarray:
        """Extraction des caractéristiques visuelles"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return np.zeros(100)
            
            # Conversion en niveaux de gris
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Caractéristiques basiques
            features = []
            
            # Histogramme
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
            features.extend(hist.flatten()[:50])
            
            # Détection de contours
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Statistiques des contours
            if contours:
                areas = [cv2.contourArea(c) for c in contours]
                features.extend([
                    len(contours),
                    np.mean(areas) if areas else 0,
                    np.std(areas) if areas else 0,
                    max(areas) if areas else 0,
                    min(areas) if areas else 0
                ])
            else:
                features.extend([0, 0, 0, 0, 0])
            
            # Dimensions de l'image
            h, w = gray.shape
            features.extend([h, w, h/w if w > 0 else 0])
            
            # Padding pour avoir exactement 100 features
            while len(features) < 100:
                features.append(0)
            
            return np.array(features[:100])
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des features visuelles: {e}")
            return np.zeros(100)
    
    def classify_document_type(self, text: str) -> str:
        """Classification du type de document basée sur le texte"""
        text_lower = text.lower()
        scores = {}
        
        for doc_type, keywords in self.document_types.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            scores[doc_type] = score
        
        # Retourner le type avec le score le plus élevé
        best_type = max(scores, key=scores.get)
        if scores[best_type] > 0:
            return best_type
        else:
            return "unknown"
    
    def process_document(self, image_path: str) -> DocumentFeatures:
        """Traitement complet d'un document"""
        logger.info(f"Traitement du document: {image_path}")
        
        # Extraction du texte et layout
        text_content, layout_info = self.extract_text_and_layout(image_path)
        
        # Génération des embeddings
        layout_embedding = self.get_layoutlm_embeddings(text_content, layout_info)
        
        # Extraction des features visuelles
        visual_features = self.extract_visual_features(image_path)
        
        # Classification
        document_type = self.classify_document_type(text_content)
        
        # Calcul de la confiance OCR moyenne
        ocr_confidence = np.mean([item['confidence'] for item in layout_info]) if layout_info else 0.0
        
        # Métadonnées
        metadata = {
            'image_path': image_path,
            'processed_at': datetime.now().isoformat(),
            'text_length': len(text_content),
            'layout_elements': len(layout_info)
        }
        
        return DocumentFeatures(
            text_content=text_content,
            layout_embedding=layout_embedding,
            visual_features=visual_features,
            ocr_confidence=ocr_confidence,
            document_type=document_type,
            metadata=metadata
        )

class DocumentAuthenticator:
    """Système d'authentification de documents"""
    
    def __init__(self, reference_db_path: str = "reference_documents.pkl"):
        self.reference_db_path = reference_db_path
        self.reference_documents = self._load_reference_db()
        self.similarity_threshold = 0.85
        
    def _load_reference_db(self) -> Dict:
        """Chargement de la base de données de référence"""
        if os.path.exists(self.reference_db_path):
            try:
                with open(self.reference_db_path, 'rb') as f:
                    return pickle.load(f)
            except Exception as e:
                logger.error(f"Erreur lors du chargement de la DB: {e}")
        return {}
    
    def _save_reference_db(self):
        """Sauvegarde de la base de données de référence"""
        try:
            with open(self.reference_db_path, 'wb') as f:
                pickle.dump(self.reference_documents, f)
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde: {e}")
    
    def add_reference_document(self, doc_features: DocumentFeatures, doc_id: str):
        """Ajout d'un document de référence"""
        if doc_features.document_type not in self.reference_documents:
            self.reference_documents[doc_features.document_type] = {}
        
        self.reference_documents[doc_features.document_type][doc_id] = {
            'features': doc_features,
            'hash': self._compute_document_hash(doc_features),
            'added_at': datetime.now().isoformat()
        }
        
        self._save_reference_db()
        logger.info(f"Document de référence ajouté: {doc_id}")
    
    def _compute_document_hash(self, doc_features: DocumentFeatures) -> str:
        """Calcul du hash d'un document"""
        content = (
            doc_features.text_content +
            str(doc_features.layout_embedding.tolist()) +
            str(doc_features.visual_features.tolist())
        )
        return hashlib.sha256(content.encode()).hexdigest()
    
    def compute_similarity(self, doc1: DocumentFeatures, doc2: DocumentFeatures) -> Dict[str, float]:
        """Calcul de similarité entre deux documents"""
        similarities = {}
        
        # Similarité textuelle (Jaccard)
        words1 = set(doc1.text_content.lower().split())
        words2 = set(doc2.text_content.lower().split())
        
        if words1 or words2:
            jaccard = len(words1.intersection(words2)) / len(words1.union(words2))
            similarities['text'] = jaccard
        else:
            similarities['text'] = 0.0
        
        # Similarité des embeddings (cosine)
        embed_sim = cosine_similarity(
            doc1.layout_embedding.reshape(1, -1),
            doc2.layout_embedding.reshape(1, -1)
        )[0][0]
        similarities['layout'] = float(embed_sim)
        
        # Similarité visuelle
        visual_sim = cosine_similarity(
            doc1.visual_features.reshape(1, -1),
            doc2.visual_features.reshape(1, -1)
        )[0][0]
        similarities['visual'] = float(visual_sim)
        
        # Score global pondéré
        similarities['global'] = (
            0.4 * similarities['text'] +
            0.4 * similarities['layout'] +
            0.2 * similarities['visual']
        )
        
        return similarities
    
    def authenticate_document(self, candidate_doc: DocumentFeatures) -> Dict:
        """Authentification d'un document candidat"""
        results = {
            'is_authentic': False,
            'confidence': 0.0,
            'best_match': None,
            'similarities': {},
            'document_type': candidate_doc.document_type,
            'alerts': []
        }
        
        # Vérification si le type de document existe dans la référence
        if candidate_doc.document_type not in self.reference_documents:
            results['alerts'].append(f"Type de document non référencé: {candidate_doc.document_type}")
            return results
        
        best_similarity = 0.0
        best_match_id = None
        all_similarities = {}
        
        # Comparaison avec tous les documents de référence du même type
        for ref_id, ref_data in self.reference_documents[candidate_doc.document_type].items():
            ref_doc = ref_data['features']
            
            similarities = self.compute_similarity(candidate_doc, ref_doc)
            all_similarities[ref_id] = similarities
            
            if similarities['global'] > best_similarity:
                best_similarity = similarities['global']
                best_match_id = ref_id
        
        results['similarities'] = all_similarities
        results['confidence'] = best_similarity
        results['best_match'] = best_match_id
        
        # Détermination de l'authenticité
        if best_similarity >= self.similarity_threshold:
            results['is_authentic'] = True
        else:
            results['alerts'].append(f"Similarité trop faible: {best_similarity:.3f} < {self.similarity_threshold}")
        
        # Vérifications supplémentaires
        if candidate_doc.ocr_confidence < 0.7:
            results['alerts'].append(f"Confiance OCR faible: {candidate_doc.ocr_confidence:.3f}")
        
        if len(candidate_doc.text_content) < 50:
            results['alerts'].append("Contenu textuel insuffisant")
        
        return results

class RealTimeDocumentProcessor:
    """Processeur de documents en temps réel"""
    
    def __init__(self):
        self.classifier = DocumentClassifier()
        self.authenticator = DocumentAuthenticator()
        
    def process_and_authenticate(self, image_path: str) -> Dict:
        """Traitement et authentification complète d'un document"""
        try:
            # Classification
            doc_features = self.classifier.process_document(image_path)
            
            # Authentification
            auth_results = self.authenticator.authenticate_document(doc_features)
            
            # Résultats combinés
            results = {
                'classification': {
                    'document_type': doc_features.document_type,
                    'ocr_confidence': doc_features.ocr_confidence,
                    'text_content': doc_features.text_content[:200] + "..." if len(doc_features.text_content) > 200 else doc_features.text_content,
                    'metadata': doc_features.metadata
                },
                'authentication': auth_results,
                'processed_at': datetime.now().isoformat()
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement: {e}")
            return {
                'error': str(e),
                'processed_at': datetime.now().isoformat()
            }
    
    def add_reference_document(self, image_path: str, doc_id: str):
        """Ajout d'un document de référence"""
        doc_features = self.classifier.process_document(image_path)
        self.authenticator.add_reference_document(doc_features, doc_id)
        return doc_features.document_type
