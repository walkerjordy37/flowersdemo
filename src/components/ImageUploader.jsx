import React, { useState, useRef } from 'react';
import { Camera, Upload, BarChart3, Brain, CheckCircle, XCircle, Info, Zap, Flower2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FlowerRecognitionML = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('demo');
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Données d'entraînement ML classique avec scikit-learn
  const trainingProgress = [
  { iteration: 10, train_acc: 99.85, val_acc: 93.41, train_error: 0.15, val_error: 6.59 },
  { iteration: 20, train_acc: 99.91, val_acc: 93.65, train_error: 0.09, val_error: 6.35 },
  { iteration: 30, train_acc: 99.97, val_acc: 94.49, train_error: 0.03, val_error: 5.51 },
  { iteration: 40, train_acc: 100.0, val_acc: 94.85, train_error: 0.0, val_error: 5.15 },
  { iteration: 50, train_acc: 100.0, val_acc: 94.61, train_error: 0.0, val_error: 5.39 },
  { iteration: 60, train_acc: 100.0, val_acc: 94.61, train_error: 0.0, val_error: 5.39 },
  { iteration: 70, train_acc: 100.0, val_acc: 94.49, train_error: 0.0, val_error: 5.51 },
  { iteration: 80, train_acc: 100.0, val_acc: 94.61, train_error: 0.0, val_error: 5.39 },
  { iteration: 90, train_acc: 100.0, val_acc: 94.61, train_error: 0.0, val_error: 5.39 },
  { iteration: 100, train_acc: 100.0, val_acc: 94.49, train_error: 0.0, val_error: 5.51 }
];



  const modelStats = {
    algorithm: 'Random Forest',
    accuracy: 94.0,
    precision: 94.0,
    recall: 94.0,
    f1Score: 94.0,
    trainingTime: '60 secondes',
    features: 'HOG + Histogramme couleurs'
  };

  // Activer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      alert('Erreur: Impossible d\'accéder à la caméra. Utilisez l\'upload d\'image.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureImage = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;

  if (canvas && video) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setImage(imageData);
    stopCamera();

    // Convertir base64 en blob
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "capture.jpg", { type: mimeString });

    setSelectedFile(file); // ✅ pour analyzeImage
    analyzeImage();
  }
};
   

 const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file); // ✅ nécessaire pour que analyzeImage ait accès au fichier

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result); // pour l'affichage
    };
    reader.readAsDataURL(file);
  }
};


  // Simulation de l'analyse ML classique
    // Analyse avec votre API réelle
  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setPrediction(null);
    
    if (!selectedFile) {
      alert("Aucun fichier sélectionné.");
      return;
    }

    console.log("Envoi du fichier à l'API…", selectedFile); // ✅ trace visuelle
    try {
      // Préparer les données pour l'API
      //const res = await fetch(image);
      //const blob = await res.blob();
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('https://walkerjordy37-fastapi-mldemo.hf.space/predict', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Erreur API');
      }
  
      const data = await response.json();
    
      setPrediction({
        isFlower: data.prediction === "fleur",
        label: data.prediction === "fleur" ? '🌸 Fleur détectée' : '❌ Pas une fleur',
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      alert('Erreur lors de l\'analyse. Vérifiez votre connexion.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPrediction(null);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Flower2 className="w-10 h-10 md:w-12 h-12" />
            Reconnaissance de Fleurs - ML Classique
          </h1>
          <p className="text-lg md:text-xl text-pink-200">Machine Learning avec scikit-learn</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'demo'
                ? 'bg-white text-pink-900 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Camera className="w-5 h-5" /> Démo
          </button>
          <button
            onClick={() => setActiveTab('rapport')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'rapport'
                ? 'bg-white text-pink-900 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <BarChart3 className="w-5 h-5" /> Rapport ML
          </button>
          <button
            onClick={() => setActiveTab('explication')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'explication'
                ? 'bg-white text-pink-900 shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Info className="w-5 h-5" /> ML Classique
          </button>
        </div>

        {/* Contenu */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl">
          
          {/* TAB DEMO */}
          {activeTab === 'demo' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Testez le modèle ML
              </h2>
              
              {!image ? (
                <div className="space-y-4">
                  {/* Caméra */}
                  <div className="bg-white/20 rounded-xl p-6">
                    {!cameraActive ? (
                      <button
                        onClick={startCamera}
                        className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all"
                      >
                        <Camera className="w-6 h-6" />
                        📱 Utiliser la caméra mobile
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full rounded-lg"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={captureImage}
                            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all"
                          >
                            📸 Capturer
                          </button>
                          <button
                            onClick={stopCamera}
                            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload */}
                  <div className="bg-white/20 rounded-xl p-6">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all"
                    >
                      <Upload className="w-6 h-6" />
                      📁 Uploader une image
                    </button>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-4">
                    <p className="text-white text-center">
                      💡 Le modèle utilise des <strong>features extraites</strong> (couleurs, textures, formes) et un algorithme <strong>Random Forest</strong> pour classifier
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image */}
                  <div className="bg-white/20 rounded-xl p-4">
                    <img src={image} alt="Captured" className="w-full rounded-lg max-h-96 object-contain mx-auto" />
                  </div>

                  {/* Analyse */}
                  {isAnalyzing && (
                    <div className="bg-blue-500/20 border-2 border-blue-400 rounded-xl p-6">
                      <div className="text-center">
                        <Zap className="w-12 h-12 text-yellow-300 mx-auto mb-3 animate-pulse" />
                        <p className="text-xl font-bold text-white mb-2">Analyse en cours...</p>
                        <div className="space-y-2 text-blue-200">
                          <p>⚙️ Extraction des features...</p>
                          <p>🎨 Analyse des couleurs...</p>
                          <p>🔍 Détection des textures...</p>
                          <p>🤖 Classification Random Forest...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Résultat */}
                  {selectedFile && (
                    <button
                      onClick={analyzeImage}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all mt-4"
                    >
                      🚀 Analyser l'image
                    </button>
                  )}
                  {prediction && (
                    <div>
                      <div className={`rounded-xl p-6 border-4 mb-4 ${
                        prediction.isFlower 
                          ? 'bg-green-500/20 border-green-400' 
                          : 'bg-red-500/20 border-red-400'
                      }`}>
                        <div className="flex items-center justify-center gap-3 mb-4">
                          {prediction.isFlower ? (
                            <CheckCircle className="w-16 h-16 text-green-400" />
                          ) : (
                            <XCircle className="w-16 h-16 text-red-400" />
                          )}
                        </div>
                        <h3 className="text-3xl font-bold text-white text-center mb-2">
                          {prediction.label}
                        </h3>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-all"
                  >
                    🔄 Nouvelle image
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* TAB RAPPORT */}
          {activeTab === 'rapport' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">📊 Rapport d'Entraînement ML</h2>

              {/* Infos du modèle */}
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-6 border-2 border-pink-400/30">
                <h3 className="text-2xl font-bold text-white mb-4">🤖 Modèle utilisé</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-pink-200 mb-2">Algorithme</p>
                    <p className="text-xl font-bold text-white">{modelStats.algorithm}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-blue-200 mb-2">Features</p>
                    <p className="text-xl font-bold text-white">{modelStats.features}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-green-200 mb-2">Temps d'entraînement</p>
                    <p className="text-xl font-bold text-white">{modelStats.trainingTime}</p>
                  </div>
                </div>
              </div>

              {/* Stats de performance */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-500/20 rounded-xl p-4 border-2 border-green-400">
                  <p className="text-green-200 text-sm mb-1">Précision</p>
                  <p className="text-3xl font-bold text-white">{modelStats.accuracy}%</p>
                </div>
                <div className="bg-blue-500/20 rounded-xl p-4 border-2 border-blue-400">
                  <p className="text-blue-200 text-sm mb-1">Precision</p>
                  <p className="text-3xl font-bold text-white">{modelStats.precision}%</p>
                </div>
                <div className="bg-purple-500/20 rounded-xl p-4 border-2 border-purple-400">
                  <p className="text-purple-200 text-sm mb-1">Recall</p>
                  <p className="text-3xl font-bold text-white">{modelStats.recall}%</p>
                </div>
                <div className="bg-pink-500/20 rounded-xl p-4 border-2 border-pink-400">
                  <p className="text-pink-200 text-sm mb-1">F1-Score</p>
                  <p className="text-3xl font-bold text-white">{modelStats.f1Score}%</p>
                </div>
              </div>

              {/* Courbe d'apprentissage */}
              <div className="bg-white/20 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">📈 Courbe d'Apprentissage (SVM)</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trainingProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff30" />
                    <XAxis 
                      dataKey="iteration" 
                      stroke="#fff" 
                      label={{ value: 'Itérations', position: 'insideBottom', offset: -5, fill: '#fff' }} 
                    />
                    <YAxis 
                      stroke="#fff" 
                      label={{ value: 'Précision (%)', angle: -90, position: 'insideLeft', fill: '#fff' }} 
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="train_acc" stroke="#10b981" strokeWidth={3} name="Train Accuracy" />
                    <Line type="monotone" dataKey="val_acc" stroke="#3b82f6" strokeWidth={3} name="Validation Accuracy" />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-green-200 mt-4 text-center">
                  ✓ Le modèle Random Forest atteint {modelStats.accuracy}% de précision sur les données de validation
                </p>
              </div>
            </div>
          )}

          {/* TAB EXPLICATION */}
          {activeTab === 'explication' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">🎓 Machine Learning Classique</h2>

              {/* Différence ML vs DL */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-yellow-400/30">
                <h3 className="text-2xl font-bold text-white mb-4">🔍 ML Classique ≠ Deep Learning</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-500/20 border-2 border-green-400 rounded-lg p-4">
                    <h4 className="font-bold text-white text-lg mb-2">✅ ML Classique (Notre projet)</h4>
                    <ul className="text-green-200 space-y-1 text-sm">
                      <li> Extraction manuelle des features</li>
                      <li> Algorithme: Random Forest</li>
                      <li> Bibliothèque: <strong>scikit-learn</strong></li>
                      <li> Rapide à entraîner (secondes)</li>
                      <li> Interprétable et explicable</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-4">
                    <h4 className="font-bold text-white text-lg mb-2">❌ Deep Learning (Non utilisé)</h4>
                    <ul className="text-red-200 space-y-1 text-sm">
                      <li> Extraction automatique des features</li>
                      <li> Réseaux de neurones (CNN, RNN)</li>
                      <li> TensorFlow, PyTorch</li>
                      <li> Long à entraîner (heures)</li>
                      <li> Boîte noire complexe</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Extraction de Features */}
              <div className="bg-white/20 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">🎨 Extraction de Features (Manuel)</h3>
                <p className="text-white/90 mb-4">
                  Contrairement au Deep Learning qui apprend automatiquement, le ML classique nécessite d'extraire manuellement les caractéristiques importantes:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-pink-500/20 border-2 border-pink-400 rounded-lg p-4">
                    <p className="text-3xl mb-2">🎨</p>
                    <h4 className="font-bold text-white mb-2">Histogramme de Couleurs</h4>
                    <p className="text-pink-200 text-sm">
                      Distribution des couleurs RGB. Les fleurs ont souvent des couleurs vives (rouge, rose, jaune)
                    </p>
                  </div>
                  <div className="bg-purple-500/20 border-2 border-purple-400 rounded-lg p-4">
                    <p className="text-3xl mb-2">🔍</p>
                    <h4 className="font-bold text-white mb-2">HOG (Histogram of Oriented Gradients)</h4>
                    <p className="text-purple-200 text-sm">
                      Détecte les contours et formes. Permet d'identifier les pétales et structures florales
                    </p>
                  </div>
                  <div className="bg-blue-500/20 border-2 border-blue-400 rounded-lg p-4">
                    <p className="text-3xl mb-2">📐</p>
                    <h4 className="font-bold text-white mb-2">Descripteurs de Texture</h4>
                    <p className="text-blue-200 text-sm">
                      Analyse la texture des surfaces. Les pétales ont une texture caractéristique
                    </p>
                  </div>
                </div>
              </div>
              {/* 
              {/* SVM Expliqué */}
        {/*       <div className="bg-white/20 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">🤖 Comment fonctionne le SVM ?</h3>
                <div className="space-y-4">
                  <p className="text-white/90">
                    <strong>SVM (Support Vector Machine)</strong> est un algorithme qui cherche à tracer la meilleure frontière (hyperplan) pour séparer deux classes.
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border-2 border-green-400/30">
                    <h4 className="font-bold text-white mb-2">🎯 Principe de base:</h4>
                    <ol className="text-white/90 space-y-2 ml-4">
                      <li><strong>1.</strong> Les features extraites (couleurs, formes, textures) créent un espace multidimensionnel</li>
                      <li><strong>2.</strong> Chaque image devient un point dans cet espace</li>
                      <li><strong>3.</strong> Le SVM trouve la meilleure ligne/plan qui sépare les fleurs des non-fleurs</li>
                      <li><strong>4.</strong> Il maximise la "marge" entre les deux classes pour une meilleure généralisation</li>
                    </ol>
                  </div>

                  <div className="bg-purple-500/20 border-2 border-purple-400 rounded-lg p-4">
                    <h4 className="font-bold text-white mb-2">⚙️ Kernel RBF (Radial Basis Function):</h4>
                    <p className="text-purple-200">
                      Permet au SVM de créer des frontières non-linéaires complexes. Essentiel car la séparation fleurs/non-fleurs n'est pas une simple ligne droite !
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Avantages ML Classique */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-400/30">
                <h3 className="text-2xl font-bold text-white mb-4">✅ Avantages du ML Classique</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚡</span>
                      <div>
                        <p className="font-bold text-white">Rapide à entraîner</p>
                        <p className="text-green-200 text-sm">45 secondes vs plusieurs heures pour le Deep Learning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💻</span>
                      <div>
                        <p className="font-bold text-white">Peu de ressources</p>
                        <p className="text-green-200 text-sm">Pas besoin de GPU puissant</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔍</span>
                      <div>
                        <p className="font-bold text-white">Interprétable</p>
                        <p className="text-green-200 text-sm">On comprend quelles features influencent la décision</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="font-bold text-white">Moins de données</p>
                        <p className="text-green-200 text-sm">Fonctionne bien avec quelques milliers d'images</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="font-bold text-white">Bonne performance</p>
                        <p className="text-green-200 text-sm">93% de précision sur notre tâche</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <p className="font-bold text-white">Facile à implémenter</p>
                        <p className="text-green-200 text-sm">scikit-learn simplifie tout</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div className="bg-white/20 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4">🛠️ Technologies et Outils</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="text-yellow-300 font-bold mb-3">Langage</h4>
                    <div className="space-y-2">
                      <p className="text-white">🐍 <strong>Python</strong> - Langage principal pour ML</p>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="text-green-300 font-bold mb-3">Bibliothèques ML</h4>
                    <div className="space-y-2">
                      <p className="text-white">📚 <strong>scikit-learn</strong> - Random Forest</p>
                      <p className="text-white">🔢 <strong>NumPy</strong> - Calculs matriciels</p>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="text-blue-300 font-bold mb-3">Traitement d'images</h4>
                    <div className="space-y-2">
                      <p className="text-white">👁️ <strong>OpenCV</strong> - Extraction de features</p>
                    </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="text-purple-300 font-bold mb-3">Visualisation</h4>
                    <div className="space-y-2">
                      <p className="text-white">📊 <strong>Matplotlib</strong> - Graphiques</p>
                      <p className="text-white">🎨 <strong>Seaborn</strong> - Visualisations avancées</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code exemple */}
              <div className="bg-gray-900/50 rounded-xl p-6 border-2 border-gray-600">
                <h3 className="text-2xl font-bold text-white mb-4">💻 Exemple de Code Python</h3>
                <pre className="text-green-400 text-sm overflow-x-auto">
{`# Importation des bibliothèques
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import cv2
import numpy as np

# 1. Chargement du dataset Oxford Flowers
images, labels = load_oxford_flowers()

# 2. Extraction des features
def extract_features(image):
    # Histogramme de couleurs
    hist = cv2.calcHist([image], [0,1,2], None, 
                        [8,8,8], [0,256,0,256,0,256])
    hist = hist.flatten()
    
    # HOG features
    hog = extract_hog_features(image)
    
    # Combiner les features
    features = np.concatenate([hist, hog])
    return features

features = [extract_features(img) for img in images]

# 3. Split train/test
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.3, random_state=42
)

# 4. Entraînement du SVM
model = SVC(kernel='rbf', C=1.0, gamma='scale')
model.fit(X_train, y_train)

# 5. Évaluation
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Précision: {accuracy*100:.1f}%")

# 6. Prédiction sur nouvelle image
new_image = cv2.imread('fleur.jpg')
new_features = extract_features(new_image)
prediction = model.predict([new_features])
print(f"Résultat: {'Fleur' if prediction[0]==1 else 'Pas fleur'}")`}
                </pre>
              </div>

              {/* Applications */}
              <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-6 border-2 border-pink-400/30">
                <h3 className="text-2xl font-bold text-white mb-4">🌟 Applications Pratiques</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-3xl mb-2">🌺</p>
                    <h4 className="font-bold text-white mb-1">Botanique</h4>
                    <p className="text-pink-200 text-sm">Identification automatique d'espèces de fleurs pour les botanistes et amateurs</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-3xl mb-2">🌾</p>
                    <h4 className="font-bold text-white mb-1">Agriculture</h4>
                    <p className="text-pink-200 text-sm">Surveillance des cultures, détection de floraison pour optimiser les récoltes</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-3xl mb-2">🏞️</p>
                    <h4 className="font-bold text-white mb-1">Écologie</h4>
                    <p className="text-pink-200 text-sm">Suivi de la biodiversité, monitoring des espèces végétales</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-3xl mb-2">📱</p>
                    <h4 className="font-bold text-white mb-1">Apps mobiles</h4>
                    <p className="text-pink-200 text-sm">Applications d'identification de plantes pour grand public (PlantNet, PictureThis)</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-3xl mb-2">🎓</p>
                    <h4 className="font-bold text-white mb-1">Éducation</h4>
                    <p className="text-pink-200 text-sm">Outils pédagogiques pour l'apprentissage de la botanique</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-3xl mb-2">🏪</p>
                    <h4 className="font-bold text-white mb-1">Commerce</h4>
                    <p className="text-pink-200 text-sm">Catalogage automatique de fleurs pour fleuristes et jardineries</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60">
          <p className="mb-1">🎓 Projet Machine Learning Classique - Classification d'Images</p>
          <p className="text-sm">Dataset: Oxford Flowers | Algorithme: Random Forest | Bibliothèque: scikit-learn</p>
        </div>
      </div>
    </div>
  );
};

export default FlowerRecognitionML;