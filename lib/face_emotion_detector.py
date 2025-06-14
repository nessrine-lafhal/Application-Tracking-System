import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import base64
import json
from typing import Dict, List, Tuple, Optional
import time
from collections import deque
import io
from PIL import Image

class FaceExpressionDetector:
    """
    Système de détection d'expressions faciales utilisant CNN et MediaPipe Holistic
    Adapté pour l'intégration web avec Next.js
    """
    
    def __init__(self):
        """Initialisation du système"""
        print("🚀 Initialisation du détecteur d'expressions faciales...")
        
        # Configuration MediaPipe
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Initialisation de MediaPipe Holistic
        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=2,
            enable_segmentation=False,
            refine_face_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Expressions faciales supportées
        self.emotions = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        
        # Modèles
        self.cnn_model = None
        self.landmark_model = None
        
        # Configuration pour la détection en temps réel
        self.emotion_buffer = deque(maxlen=10)  # Buffer pour lisser les prédictions
        self.confidence_threshold = 0.6
        
        # Initialisation des modèles
        self._initialize_models()
        
        print("✅ Initialisation terminée!")

    def _initialize_models(self):
        """Initialisation des modèles avec des poids pré-entraînés simulés"""
        try:
            self.cnn_model = self.create_cnn_model()
            self.landmark_model = self.create_landmark_model()
            
            # Simulation d'un entraînement rapide pour la démo
            self._train_demo_models()
            
        except Exception as e:
            print(f"Erreur lors de l'initialisation des modèles: {e}")

    def create_cnn_model(self, input_shape: Tuple[int, int, int] = (48, 48, 1)) -> keras.Model:
        """Création du modèle CNN pour la classification d'expressions"""
        model = keras.Sequential([
            # Premier bloc convolutionnel
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
            layers.BatchNormalization(),
            layers.Conv2D(32, (3, 3), activation='relu'),
            layers.MaxPooling2D(2, 2),
            layers.Dropout(0.25),
            
            # Deuxième bloc convolutionnel
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D(2, 2),
            layers.Dropout(0.25),
            
            # Troisième bloc convolutionnel
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.BatchNormalization(),
            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D(2, 2),
            layers.Dropout(0.25),
            
            # Couches denses
            layers.Flatten(),
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(len(self.emotions), activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model

    def create_landmark_model(self, input_dim: int = 468 * 3) -> keras.Model:
        """Création du modèle basé sur les landmarks MediaPipe"""
        model = keras.Sequential([
            layers.Dense(512, activation='relu', input_shape=(input_dim,)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.2),
            
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            
            layers.Dense(len(self.emotions), activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model

    def _train_demo_models(self):
        """Entraînement rapide avec des données synthétiques pour la démo"""
        print("🏋️ Entraînement des modèles de démonstration...")
        
        # Données CNN (images)
        X_cnn = np.random.random((100, 48, 48, 1))
        y_cnn = keras.utils.to_categorical(
            np.random.randint(0, len(self.emotions), 100), 
            len(self.emotions)
        )
        
        # Données Landmarks
        X_landmarks = np.random.random((100, 468 * 3))
        y_landmarks = keras.utils.to_categorical(
            np.random.randint(0, len(self.emotions), 100), 
            len(self.emotions)
        )
        
        # Entraînement rapide (1 epoch pour la démo)
        self.cnn_model.fit(X_cnn, y_cnn, epochs=1, batch_size=32, verbose=0)
        self.landmark_model.fit(X_landmarks, y_landmarks, epochs=1, batch_size=32, verbose=0)
        
        print("✅ Entraînement de démonstration terminé!")

    def extract_face_landmarks(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Extraction des landmarks faciaux avec MediaPipe"""
        try:
            # Conversion BGR vers RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Traitement avec MediaPipe
            results = self.holistic.process(rgb_image)
            
            if results.face_landmarks:
                # Extraction des coordonnées des landmarks
                landmarks = []
                for landmark in results.face_landmarks.landmark:
                    landmarks.extend([landmark.x, landmark.y, landmark.z])
                
                return np.array(landmarks)
            
            return None
            
        except Exception as e:
            print(f"Erreur lors de l'extraction des landmarks: {e}")
            return None

    def preprocess_face_image(self, image: np.ndarray, target_size: Tuple[int, int] = (48, 48)) -> np.ndarray:
        """Prétraitement de l'image du visage pour le CNN"""
        try:
            # Conversion en niveaux de gris
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Redimensionnement
            resized = cv2.resize(gray, target_size)
            
            # Normalisation
            normalized = resized.astype('float32') / 255.0
            
            # Ajout de la dimension du canal
            preprocessed = np.expand_dims(normalized, axis=-1)
            
            return preprocessed
            
        except Exception as e:
            print(f"Erreur lors du prétraitement: {e}")
            return None

    def detect_face_region(self, image: np.ndarray) -> Optional[np.ndarray]:
        """Détection et extraction de la région du visage"""
        try:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.holistic.process(rgb_image)
            
            if results.face_landmarks:
                h, w = image.shape[:2]
                
                # Calcul de la bounding box du visage
                x_coords = [landmark.x * w for landmark in results.face_landmarks.landmark]
                y_coords = [landmark.y * h for landmark in results.face_landmarks.landmark]
                
                x_min, x_max = int(min(x_coords)), int(max(x_coords))
                y_min, y_max = int(min(y_coords)), int(max(y_coords))
                
                # Ajout de marge
                margin = 20
                x_min = max(0, x_min - margin)
                y_min = max(0, y_min - margin)
                x_max = min(w, x_max + margin)
                y_max = min(h, y_max + margin)
                
                # Extraction de la région du visage
                face_region = image[y_min:y_max, x_min:x_max]
                return face_region
            
            return None
            
        except Exception as e:
            print(f"Erreur lors de la détection du visage: {e}")
            return None

    def predict_expression_cnn(self, face_image: np.ndarray) -> Tuple[str, float]:
        """Prédiction d'expression avec le modèle CNN"""
        if self.cnn_model is None:
            return "unknown", 0.0
        
        try:
            # Prétraitement
            preprocessed = self.preprocess_face_image(face_image)
            if preprocessed is None:
                return "unknown", 0.0
            
            # Prédiction
            batch_input = np.expand_dims(preprocessed, axis=0)
            predictions = self.cnn_model.predict(batch_input, verbose=0)
            
            # Récupération du résultat
            predicted_class = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class])
            emotion = self.emotions[predicted_class]
            
            return emotion, confidence
            
        except Exception as e:
            print(f"Erreur lors de la prédiction CNN: {e}")
            return "unknown", 0.0

    def predict_expression_landmarks(self, landmarks: np.ndarray) -> Tuple[str, float]:
        """Prédiction d'expression avec les landmarks"""
        if self.landmark_model is None or landmarks is None:
            return "unknown", 0.0
        
        try:
            # Normalisation des landmarks
            normalized_landmarks = self.normalize_landmarks(landmarks)
            
            # Prédiction
            batch_input = np.expand_dims(normalized_landmarks, axis=0)
            predictions = self.landmark_model.predict(batch_input, verbose=0)
            
            # Récupération du résultat
            predicted_class = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class])
            emotion = self.emotions[predicted_class]
            
            return emotion, confidence
            
        except Exception as e:
            print(f"Erreur lors de la prédiction landmarks: {e}")
            return "unknown", 0.0

    def normalize_landmarks(self, landmarks: np.ndarray) -> np.ndarray:
        """Normalisation des landmarks pour améliorer la robustesse"""
        try:
            # Reshape en points 3D
            points = landmarks.reshape(-1, 3)
            
            # Centrage par rapport au centroïde
            centroid = np.mean(points, axis=0)
            centered_points = points - centroid
            
            # Normalisation par l'écart-type
            std_dev = np.std(centered_points)
            if std_dev > 0:
                normalized_points = centered_points / std_dev
            else:
                normalized_points = centered_points
            
            return normalized_points.flatten()
            
        except Exception as e:
            print(f"Erreur lors de la normalisation: {e}")
            return landmarks

    def smooth_predictions(self, emotion: str, confidence: float) -> Tuple[str, float]:
        """Lissage des prédictions pour plus de stabilité"""
        # Ajout de la prédiction au buffer
        self.emotion_buffer.append((emotion, confidence))
        
        # Calcul de l'émotion la plus fréquente avec confiance élevée
        emotion_counts = {}
        total_confidence = {}
        
        for emo, conf in self.emotion_buffer:
            if conf >= self.confidence_threshold:
                emotion_counts[emo] = emotion_counts.get(emo, 0) + 1
                total_confidence[emo] = total_confidence.get(emo, 0) + conf
        
        if emotion_counts:
            # Émotion la plus fréquente
            most_frequent = max(emotion_counts.items(), key=lambda x: x[1])
            smoothed_emotion = most_frequent[0]
            avg_confidence = total_confidence[smoothed_emotion] / emotion_counts[smoothed_emotion]
            return smoothed_emotion, avg_confidence
        
        return emotion, confidence

    def process_base64_image(self, base64_image: str) -> Dict:
        """Traitement d'une image encodée en base64 (pour l'API web)"""
        try:
            # Décodage de l'image base64
            image_data = base64.b64decode(base64_image.split(',')[1])
            image = Image.open(io.BytesIO(image_data))
            
            # Conversion en array numpy
            frame = np.array(image)
            
            # Conversion RGB vers BGR pour OpenCV
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            
            return self.process_frame(frame)
            
        except Exception as e:
            print(f"Erreur lors du traitement de l'image base64: {e}")
            return {
                'face_detected': False,
                'cnn_prediction': ('unknown', 0.0),
                'landmark_prediction': ('unknown', 0.0),
                'final_prediction': ('unknown', 0.0),
                'error': str(e)
            }

    def process_frame(self, frame: np.ndarray) -> Dict:
        """Traitement complet d'une frame"""
        results = {
            'face_detected': False,
            'cnn_prediction': ('unknown', 0.0),
            'landmark_prediction': ('unknown', 0.0),
            'final_prediction': ('unknown', 0.0),
            'landmarks': None,
            'face_region': None,
            'emotion_scores': {}
        }
        
        try:
            # Détection de la région du visage
            face_region = self.detect_face_region(frame)
            if face_region is not None and face_region.size > 0:
                results['face_detected'] = True
                
                # Prédiction CNN
                if self.cnn_model is not None:
                    cnn_emotion, cnn_conf = self.predict_expression_cnn(face_region)
                    results['cnn_prediction'] = (cnn_emotion, cnn_conf)
                
                # Extraction des landmarks
                landmarks = self.extract_face_landmarks(frame)
                if landmarks is not None:
                    results['landmarks'] = landmarks.tolist()
                    
                    # Prédiction basée sur les landmarks
                    if self.landmark_model is not None:
                        landmark_emotion, landmark_conf = self.predict_expression_landmarks(landmarks)
                        results['landmark_prediction'] = (landmark_emotion, landmark_conf)
                
                # Combinaison des prédictions
                final_emotion, final_conf = self._combine_predictions(
                    results['cnn_prediction'], 
                    results['landmark_prediction']
                )
                
                # Lissage des prédictions
                smoothed_emotion, smoothed_conf = self.smooth_predictions(final_emotion, final_conf)
                results['final_prediction'] = (smoothed_emotion, smoothed_conf)
                
                # Scores détaillés pour toutes les émotions
                results['emotion_scores'] = self._get_detailed_scores(frame, face_region, landmarks)
        
        except Exception as e:
            print(f"Erreur lors du traitement de la frame: {e}")
            results['error'] = str(e)
        
        return results

    def _combine_predictions(self, cnn_pred: Tuple[str, float], landmark_pred: Tuple[str, float]) -> Tuple[str, float]:
        """Combinaison intelligente des prédictions CNN et landmarks"""
        cnn_emotion, cnn_conf = cnn_pred
        landmark_emotion, landmark_conf = landmark_pred
        
        # Poids pour la combinaison
        cnn_weight = 0.6
        landmark_weight = 0.4
        
        if cnn_conf > 0 and landmark_conf > 0:
            # Si les deux modèles prédisent la même émotion
            if cnn_emotion == landmark_emotion:
                final_emotion = cnn_emotion
                final_conf = (cnn_weight * cnn_conf + landmark_weight * landmark_conf)
            else:
                # Prendre la prédiction avec la plus haute confiance
                if cnn_conf > landmark_conf:
                    final_emotion, final_conf = cnn_emotion, cnn_conf
                else:
                    final_emotion, final_conf = landmark_emotion, landmark_conf
        elif cnn_conf > 0:
            final_emotion, final_conf = cnn_emotion, cnn_conf
        elif landmark_conf > 0:
            final_emotion, final_conf = landmark_emotion, landmark_conf
        else:
            final_emotion, final_conf = 'neutral', 0.5  # Défaut
        
        return final_emotion, final_conf

    def _get_detailed_scores(self, frame: np.ndarray, face_region: np.ndarray, landmarks: np.ndarray) -> Dict[str, float]:
        """Obtention des scores détaillés pour toutes les émotions"""
        scores = {emotion: 0.0 for emotion in self.emotions}
        
        try:
            # Scores CNN
            if self.cnn_model is not None and face_region is not None:
                preprocessed = self.preprocess_face_image(face_region)
                if preprocessed is not None:
                    batch_input = np.expand_dims(preprocessed, axis=0)
                    cnn_predictions = self.cnn_model.predict(batch_input, verbose=0)[0]
                    
                    for i, emotion in enumerate(self.emotions):
                        scores[emotion] += cnn_predictions[i] * 0.6  # Poids CNN
            
            # Scores landmarks
            if self.landmark_model is not None and landmarks is not None:
                normalized_landmarks = self.normalize_landmarks(landmarks)
                batch_input = np.expand_dims(normalized_landmarks, axis=0)
                landmark_predictions = self.landmark_model.predict(batch_input, verbose=0)[0]
                
                for i, emotion in enumerate(self.emotions):
                    scores[emotion] += landmark_predictions[i] * 0.4  # Poids landmarks
        
        except Exception as e:
            print(f"Erreur lors du calcul des scores détaillés: {e}")
        
        return scores

    def get_emotion_analysis_summary(self, emotion_history: List[Dict]) -> Dict:
        """Analyse résumée des émotions sur une période"""
        if not emotion_history:
            return {}
        
        # Comptage des émotions
        emotion_counts = {emotion: 0 for emotion in self.emotions}
        total_confidence = {emotion: 0.0 for emotion in self.emotions}
        
        for entry in emotion_history:
            if 'final_prediction' in entry:
                emotion, confidence = entry['final_prediction']
                if emotion in emotion_counts:
                    emotion_counts[emotion] += 1
                    total_confidence[emotion] += confidence
        
        # Calcul des pourcentages et moyennes
        total_frames = len(emotion_history)
        summary = {}
        
        for emotion in self.emotions:
            count = emotion_counts[emotion]
            percentage = (count / total_frames) * 100 if total_frames > 0 else 0
            avg_confidence = total_confidence[emotion] / count if count > 0 else 0
            
            summary[emotion] = {
                'count': count,
                'percentage': round(percentage, 2),
                'avg_confidence': round(avg_confidence, 3)
            }
        
        # Émotion dominante
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])
        summary['dominant_emotion'] = {
            'emotion': dominant_emotion[0],
            'percentage': summary[dominant_emotion[0]]['percentage']
        }
        
        return summary

# Instance globale pour l'API
emotion_detector = None

def get_emotion_detector():
    """Singleton pour le détecteur d'émotions"""
    global emotion_detector
    if emotion_detector is None:
        emotion_detector = FaceExpressionDetector()
    return emotion_detector
