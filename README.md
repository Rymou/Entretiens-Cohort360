# 🏥 Entretiens Cohort360

> **Projet d'exercices techniques Fullstack & Data**

Ce projet regroupe trois repositories distincts, chacun correspondant à un exercice technique différent dans le contexte
d'une application médicale.

---

## 🎯 Exercice Principal : API Fullstack Prescriptions Médicamenteuses

L'objectif principal de ces exercices est de **développer une nouvelle route API REST pour gérer les prescriptions
médicamenteuses des patients** et d'exposer ces données de manière complète et utilisable.

### Fonctionnalités attendues :

- ✅ Créer un modèle de données pour les prescriptions (lien Patient ↔ Médicament)
- ✅ Implémenter des endpoints REST (GET, POST, PUT/PATCH)
- ✅ Ajouter des filtres avancés (patient, médicament, dates, statut)
- ✅ Exposer, consommer ces données dans le frontend et permettre l'ajout de nouvelles prescriptions

---

## 📦 Structure du Projet

Le projet est organisé en trois sous-repositories indépendants :

### 1. 🖥️ **Frontend**

Exercice de développement côté client pour afficher et interagir avec les données de prescriptions.

**Voir** → [`/Exercice_Front/README.md`](./Exercice_Front/README.md) pour l'énoncé détaillé

---

### 2. ⚙️ **Backend Django**

Exercice backend avec Django REST Framework pour créer l'API de gestion des prescriptions.

**Voir** → [`/Exercice_Django/README.md`](./Exercice_Django/README.md) pour l'énoncé détaillé

---

### 3. 📊 **Backend Scala / Spark** _(optionnel)_

Exercice orienté traitement de données massives avec Scala et Apache Spark.

**Voir** → [`/Exercice_scala_spark/README.md`](./Exercice_scala_spark/README.md) pour l'énoncé détaillé

---

## 🔗 Dépendances entre les Exercices

Les exercices **Backend Django** et **Frontend** sont **liés** et doivent être réalisés dans l'ordre :

1. **Backend Django** : Créer l'API REST pour les prescriptions
2. **Frontend** : Consommer l'API Django, afficher les données, permettre l'ajout de nouvelles prescriptions

Le troisième exercice (**Scala/Spark**) est :

- ✨ **Indépendant** des deux autres
- 🎁 **Optionnel**

---

## ▶️ Ordre Recommandé de Réalisation

| Ordre | Exercice           | Statut      | Durée estimée |
| ----- | ------------------ | ----------- | ------------- |
| 1️⃣    | **Backend Django** | Obligatoire | ~1h           |
| 2️⃣    | **Frontend**       | Obligatoire | ~2-3h         |
| 3️⃣    | **Scala/Spark**    | Optionnel   | <1h           |

---

## 🚀 Comment lancer les exercices

Chaque exercice se lance dans son propre dossier. Voici les commandes essentielles.

### 1. Exercice Django (Backend API)

**Prérequis :** Python 3.10+, pip

```bash
cd Exercice_Django
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_demo --patients 2500 --medications 150
python manage.py runserver
```

- **API :** http://127.0.0.1:8000/
- **Patients :** http://127.0.0.1:8000/Patient
- **Médicaments :** http://127.0.0.1:8000/Medication
- **Prescriptions :** http://127.0.0.1:8000/Prescription

À garder lancé pour que le frontend puisse consommer l’API.

---

### 2. Exercice Front (Frontend)

**Prérequis :** Node.js, npm. L’**API Django doit être lancée** (voir ci‑dessus).

```bash
cd Exercice_Front
npm install
npm run dev
```

- **App :** http://localhost:3000 (ou le port indiqué dans le terminal)
- Page des prescriptions : http://localhost:3000/prescriptions

---

### 3. Exercice Scala / Spark (optionnel)

**Prérequis :** Docker, Java 17, SBT. Détails dans [`Exercice_scala_spark/README.md`](./Exercice_scala_spark/README.md).

```bash
cd Exercice_scala_spark
cp .env.example .env
docker compose up -d
./sbt-run.sh compile
./sbt-run.sh test
./sbt-run.sh run
```

- **Solr :** http://localhost:8983
- Le résultat du job s’affiche dans le terminal (ex. `Nombre de patients trouvés : 3`).

Sans le script helper : après `source ~/.sdkman/bin/sdkman-init.sh` et `export SBT_OPTS="-Dsbt.global.base=$HOME/.sbt"`, utiliser `sbt run` et `sbt test` dans `Exercice_scala_spark`.

---

## 📖 Documentation

Chaque sous-repository contient son propre **README détaillé** avec :

- 📋 L'énoncé complet de l'exercice
- 🛠️ Les instructions d'installation
- 🚀 Les commandes de lancement
- ✅ Les critères d'acceptation

**Consultez les README individuels pour commencer !**

## 📖 Rendu

Vous pouvez fork ce repository afin de recuperer le code existant et lancer le projet facilement, puis nous soumettre l'URL de votre repo par e-mail.

---

**Bon courage ! 🎓**
